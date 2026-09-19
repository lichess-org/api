import account from "./account";
import arenas from "./arenas";
import bot from "./bot";
import broadcasts from "./broadcasts";
import challenges from "./challenges";
import externalEngine from "./external-engine";
import fide from "./fide";
import games from "./games";
import oauth from "./oauth";
import openingExplorer from "./opening-explorer";
import puzzles from "./puzzles";
import relations from "./relations";
import simuls from "./simuls";
import tablebase from "./tablebase";
import teams from "./teams";
import tv from "./tv";
import users from "./users";

const scripts: Record<string, () => Promise<void>> = {
  account,
  arenas,
  bot,
  broadcasts,
  challenges,
  "external-engine": externalEngine,
  fide,
  games,
  oauth,
  "opening-explorer": openingExplorer,
  puzzles,
  relations,
  simuls,
  tablebase,
  teams,
  tv,
  users,
};

const requested = Bun.argv.slice(2);
const unknown = requested.filter((name) => !(name in scripts));
if (unknown.length > 0) {
  console.error(`Unknown script: ${unknown.join(", ")}`);
  console.error(`Available: ${Object.keys(scripts).join(", ")}`);
  process.exit(2);
}

const failed: string[] = [];
for (const name of requested.length > 0 ? requested : Object.keys(scripts)) {
  console.log(`\n=== ${name} ===`);
  try {
    await scripts[name]!();
  } catch (error) {
    // Keep going, so one failing endpoint doesn't stop the rest from being updated
    console.error(`${name} failed:`, error);
    failed.push(name);
  }
}

if (failed.length > 0) {
  console.error(`\nFailed: ${failed.join(", ")}`);
}
// Exit explicitly so a stream that is still open can't keep the process alive
process.exit(failed.length > 0 ? 1 : 0);
