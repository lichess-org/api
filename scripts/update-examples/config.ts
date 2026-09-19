import createClient from "openapi-fetch";
import type { paths } from "@lichess-org/types";
import { join } from "node:path";

const EXAMPLES_DIR = join(
  import.meta.dir,
  "..",
  "..",
  "doc",
  "specs",
  "examples",
);

export const prodClient = () =>
  createClient<paths>({
    baseUrl: "https://lichess.org",
  });

export const localUrl = "http://localhost:8080";

export const localClient = (as?: string) =>
  createClient<paths>({
    baseUrl: localUrl,
    headers:
      as === "anon"
        ? {}
        : {
            Authorization: `Bearer lip_${as ?? "bobby"}`,
          },
  });

export const localExternalEngineUrl = "http://localhost:9666";

export const localExternalEngineClient = () =>
  createClient<paths>({
    baseUrl: localExternalEngineUrl,
  });

export const explorerClient = () => {
  const token = process.env.LICHESS_API_TOKEN;
  if (!token) {
    throw new Error(
      "The opening explorer requires a lichess.org API token (it needs no scopes). Set LICHESS_API_TOKEN, e.g. in a .env file.",
    );
  }
  return createClient<paths>({
    baseUrl: "https://explorer.lichess.ovh",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const tablebaseClient = () =>
  createClient<paths>({
    baseUrl: "https://tablebase.lichess.ovh",
  });

/** What openapi-fetch resolves a request with. */
type FetchResult<T = unknown> = {
  data?: T;
  error?: unknown;
  response: Response;
};

const isFetchResult = (value: unknown): value is FetchResult =>
  typeof value === "object" &&
  value !== null &&
  (value as FetchResult).response instanceof Response;

/** The body of a successful response. Throws, naming the request, if the response was not a success. */
export function ok<T>({ data, error, response }: FetchResult<T>): T {
  if (!response.ok) {
    const detail =
      typeof error === "string" ? error : (JSON.stringify(error) ?? "");
    throw new Error(
      `${response.status} ${response.url} ${detail.slice(0, 200)}`.trim(),
    );
  }
  return data as T;
}

type Filetype = "json" | "pgn" | "txt";

/**
 * Save a response as `doc/specs/examples/<category>-<name>.<filetype>.yaml`.
 *
 * `response` is either a request (pending or resolved) or the value to write. A request must have
 * succeeded and returned a body, so a failing endpoint never overwrites an example with junk.
 */
export async function example(
  category: string,
  name: string,
  response: unknown,
  filetype: Filetype = "json",
) {
  const resolved = await response;
  const data = isFetchResult(resolved) ? ok(resolved) : resolved;

  const filename = join(EXAMPLES_DIR, `${category}-${name}.${filetype}.yaml`);
  if (data === undefined) throw new Error(`Nothing to write to ${filename}`);
  if (filetype !== "json" && typeof data !== "string")
    throw new TypeError(`${filename} needs a string`);
  console.log(`Writing ${filename}`);

  const contents =
    filetype === "json"
      ? `value: ${JSON.stringify(data, null, 2)}`
      : [
          "value: |",
          ...(data as string).split("\n").map((line) => `  ${line}`),
        ].join("\n");

  await Bun.write(
    filename,
    contents.replaceAll(localUrl, "https://lichess.org") + "\n",
  );
}

/** Bounds how long a stream may take to produce what we are waiting for, so a stalled one can't hang the run. */
export const streamTimeout = () => AbortSignal.timeout(30_000);

/** A response requested with `parseAs: "stream"`. */
type Streamed = FetchResult<AsyncIterable<Uint8Array> | null>;

/**
 * Yields each line of a streamed response as it arrives. The loop ends when the server closes the
 * stream; `break` out of it to close the stream yourself.
 */
export async function* readLines(result: Streamed): AsyncGenerator<string> {
  const body = ok(result);
  if (!body) throw new Error(`${result.response.url} has no body`);
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const chunk of body) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop()!;
    yield* lines;
  }
  buffer += decoder.decode();
  if (buffer) yield buffer;
}

export async function* readNdJson<T = any>(
  result: Streamed,
): AsyncGenerator<T> {
  for await (const line of readLines(result)) {
    if (line) yield JSON.parse(line);
  }
}

/** The first line of an NDJSON stream, after which the stream is closed. */
export async function firstNdJson<T = any>(result: Streamed): Promise<T> {
  for await (const line of readNdJson<T>(result)) return line;
  throw new Error(`${result.response.url} closed without sending anything`);
}

/**
 * A casual 5+0 game between two local players: the challenger creates the challenge and the
 * challengee accepts it. Resolves to the game ID.
 */
export async function startGame(challenger: string, challengee: string) {
  const challenge = ok(
    await localClient(challenger).POST("/api/challenge/{username}", {
      params: {
        path: {
          username: challengee,
        },
      },
      body: {
        rated: false,
        "clock.limit": 300,
        "clock.increment": 0,
        color: "white",
      },
    }),
  );
  ok(
    await localClient(challengee).POST("/api/challenge/{challengeId}/accept", {
      params: {
        path: {
          challengeId: challenge.id,
        },
      },
    }),
  );
  return challenge.id;
}

/** Play a move in a game, through the Board API or, for a bot account, the Bot API. */
export function makeMove(
  as: string,
  gameId: string,
  move: string,
  api: "board" | "bot" = "board",
) {
  const params = { path: { gameId, move } };
  return api === "board"
    ? localClient(as).POST("/api/board/game/{gameId}/move/{move}", { params })
    : localClient(as).POST("/api/bot/game/{gameId}/move/{move}", { params });
}

/**
 * Follows a game through its Board or Bot API stream, in the background while the caller plays it,
 * and keeps the events it receives. The stream is closed with `close`, or after three minutes.
 */
export function followGame(
  as: string,
  gameId: string,
  api: "board" | "bot" = "board",
) {
  const events: any[] = [];
  const controller = new AbortController();
  const signal = AbortSignal.any([
    controller.signal,
    AbortSignal.timeout(180_000),
  ]);
  const options = {
    params: { path: { gameId } },
    headers: { Accept: "application/x-ndjson" },
    parseAs: "stream",
    signal,
  } as const;
  (async () => {
    const stream =
      api === "board"
        ? await localClient(as).GET("/api/board/game/stream/{gameId}", options)
        : await localClient(as).GET("/api/bot/game/stream/{gameId}", options);
    for await (const event of readNdJson(stream)) events.push(event);
  })().catch(() => {
    // The stream was closed on purpose, or `next` reports that what it waits for never arrived
  });

  return {
    /** The first event that satisfies `match`, whether it has arrived already or is yet to. */
    async next(match: (event: any) => boolean, waitSeconds = 30) {
      for (let i = 0; i < waitSeconds * 10; i++) {
        const event = events.find(match);
        if (event) return event;
        await Bun.sleep(100);
      }
      throw new Error(
        `${as} did not see the expected event of ${gameId} within ${waitSeconds}s. Events: ${JSON.stringify(events).slice(0, 300)}`,
      );
    },
    close: () => controller.abort(),
  };
}

/** The first `count` games of a PGN stream, after which the stream is closed. */
export async function firstPgnGames(
  result: Streamed,
  count = 1,
): Promise<string> {
  const lines: string[] = [];
  let games = 0;
  for await (const line of readLines(result)) {
    if (line.startsWith("[Event ") && ++games > count) break;
    lines.push(line);
  }
  return lines.join("\n").trimEnd();
}

/**
 * Listens to a local user's event stream in the background while the caller drives the API, and
 * await the result once done. `onEvent` returns true when it has seen what it needs, which closes
 * the stream. Rejects if the stream fails, times out, or ends first.
 */
export function streamEvents(
  as: string,
  onEvent: (event: any) => boolean | void | Promise<boolean | void>,
) {
  const done = (async () => {
    const stream = await localClient(as).GET("/api/stream/event", {
      headers: { Accept: "application/x-ndjson" },
      parseAs: "stream",
      signal: streamTimeout(),
    });
    for await (const event of readNdJson(stream)) {
      if (await onEvent(event)) return;
    }
    throw new Error(
      `The event stream for ${as} ended before the expected events arrived`,
    );
  })();
  // The caller may fail before awaiting this; that must not surface as a second, unhandled rejection.
  done.catch(() => {});
  return done;
}
