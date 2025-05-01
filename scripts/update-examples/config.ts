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

export function example(
  category: string,
  name: string,
  response: any,
  filetype: "json" | "pgn" = "json",
  forceAsYaml: boolean = false,
) {
  const saveAsYaml = forceAsYaml || filetype !== "json";
  const filename = join(
    resolve(
      dirname(fileURLToPath(import.meta.url)),
      "..",
      "..",
      "doc",
      "specs",
      "examples",
    ),
    `${category}-${name}.${filetype}${saveAsYaml ? ".yaml" : ""}`,
  );
  console.log(`Writing ${filename}`);

  const data: string = JSON.stringify(response.data ?? response, null, 2);
  let contents = saveAsYaml
    ? convertStringToYaml(data, filetype === "json")
    : data;
  contents = contents.replace(
    /http:\/\/localhost:8080/g,
    "https://lichess.org",
  );

  writeFileSync(filename, contents);
}

const convertStringToYaml = (str: string, isJson: boolean) => {
  let lines: string[] = [];
  if (isJson) {
    lines.push("value: " + str);
  } else {
    lines.push("value: |");
    const indent = " ".repeat(2);
    const strLines = str.split("\n");
    for (const line of strLines) {
      lines.push(`${indent}${line}`);
    }
  }
  return lines.join("\n");
};

type ProcessLine<T> = (line: T) => void;
export const readNdJson = async <T>(
  response: Response,
  processLine: ProcessLine<T>,
): Promise<void> => {
  try {
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
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }
    throw error;
  }
};

export const readTextStream = async (
  response: Response,
  processLine: (line: string) => void,
): Promise<void> => {
  try {
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
      for (const part of parts) processLine(part);
    } while (!done);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return;
    }
    throw error;
  }
};
