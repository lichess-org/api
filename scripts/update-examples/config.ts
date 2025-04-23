import createClient from "openapi-fetch";
import type { paths } from "@lichess-org/types";
import { writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

export const localClient = (as?: string) =>
  createClient<paths>({
    baseUrl: "http://localhost:8080",
    headers: {
      Authorization: `Bearer lip_${as ?? "bobby"}`,
    },
  });

export const prodClient = () =>
  createClient<paths>({
    baseUrl: "https://lichess.org",
  });

export function example(category: string, name: string, response: any) {
  const filename = join(
    resolve(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
      "doc",
      "specs",
      "examples",
    ),
    `${category}-${name}.json`,
  );
  console.log(`Writing ${filename}`);

  let contents = JSON.stringify(response.data ?? response, null, 2);
  contents = contents.replace("http://localhost:8080", "https://lichess.org");

  writeFileSync(filename, contents);
}

type ProcessLine<T> = (line: T) => void;
export const readNdJson = async <T>(
  response: Response,
  processLine: ProcessLine<T>,
): Promise<void> => {
  if (!response.ok) throw new Error(`Status ${response.status}`);
  const stream = response.body!.getReader();
  const matcher = /\r?\n/;
  const decoder = new TextDecoder();
  let buf = "";
  let done, value;
  do {
    ({ done, value } = await stream.read());
    buf += decoder.decode(value || new Uint8Array(), { stream: !done });
    const parts = buf.split(matcher);
    if (!done) buf = parts.pop()!;
    for (const part of parts) if (part) processLine(JSON.parse(part));
  } while (!done);
};
