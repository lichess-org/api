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

  let failure: unknown;
  let ended = false;
  (async () => {
    const stream =
      api === "board"
        ? await localClient(as).GET("/api/board/game/stream/{gameId}", options)
        : await localClient(as).GET("/api/bot/game/stream/{gameId}", options);
    for await (const event of readNdJson(stream)) events.push(event);
    ended = true;
  })().catch((error) => {
    // Closing the stream on purpose is not a failure
    if (!controller.signal.aborted) failure = error;
  });

  return {
    /** The first event that satisfies `match`, whether it has arrived already or is yet to. */
    async next(match: (event: any) => boolean, waitSeconds = 30) {
      const seen = () => JSON.stringify(events).slice(0, 300);
      for (let i = 0; i < waitSeconds * 10; i++) {
        const event = events.find(match);
        if (event) return event;
        // Waiting on would only end in the timeout below, without saying what went wrong
        if (failure)
          throw new Error(
            `The stream of ${gameId} for ${as} failed: ${String(failure)}`,
            { cause: failure },
          );
        if (ended)
          throw new Error(
            `The stream of ${gameId} for ${as} ended before the expected event. Events: ${seen()}`,
          );
        await Bun.sleep(100);
      }
      throw new Error(
        `${as} did not see the expected event of ${gameId} within ${waitSeconds}s. Events: ${seen()}`,
      );
    },
    close: () => controller.abort(),
  };
}

/**
 * Ends a game that a player is in, whatever state it is in: it is aborted as long as that is
 * possible, and resigned after that. For cleaning up.
 */
export async function endGame(
  as: string,
  gameId: string,
  api: "board" | "bot" = "board",
) {
  const client = localClient(as);
  const params = { params: { path: { gameId } } };
  const aborted =
    api === "board"
      ? await client.POST("/api/board/game/{gameId}/abort", params)
      : await client.POST("/api/bot/game/{gameId}/abort", params);
  if (aborted.response.ok) return;
  if (api === "board")
    await client.POST("/api/board/game/{gameId}/resign", params);
  else await client.POST("/api/bot/game/{gameId}/resign", params);
}

/**
 * Runs the steps that undo what a flow did before it failed. A step that fails as well is not
 * worth reporting next to the failure that made it necessary, which the caller rethrows.
 */
export async function cleanUp(...steps: (() => Promise<unknown>)[]) {
  for (const step of steps) {
    try {
      await step();
    } catch {}
  }
}

/**
 * Chat messages that Lila lets through however often a player sends them. Any other message is
 * dropped without an error when it is similar to one of the player's last two of the past minute,
 * which is what a second run of a script soon after the first would send.
 */
export const presetChat = {
  goodLuck: "Good luck",
  haveFun: "Have fun!",
};

/**
 * Fetches until `ready` accepts what came back. Some things are only saved a moment after they were
 * requested, and fetching them too soon would give an empty example that is still valid.
 */
export async function waitFor<T>(
  what: string,
  get: () => Promise<T>,
  ready: (value: T) => boolean,
  seconds = 10,
): Promise<T> {
  let last = "nothing";
  for (let i = 0; i < seconds * 5; i++) {
    try {
      const value = await get();
      if (ready(value)) return value;
      last = String(JSON.stringify(value));
    } catch (error) {
      // Something that is not there yet can be reported as an error, like a 404
      last = String(error);
    }
    await Bun.sleep(200);
  }
  throw new Error(
    `Gave up after ${seconds}s waiting for ${what}. Last response: ${last.slice(0, 300)}`,
  );
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
