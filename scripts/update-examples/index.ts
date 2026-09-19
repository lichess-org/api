import account from "./account";
import analysis from "./analysis";
import arenas from "./arenas";
import board from "./board";
import bot from "./bot";
import broadcasts from "./broadcasts";
import bulkPairings from "./bulk-pairings";
import challenges from "./challenges";
import externalEngine from "./external-engine";
import fide from "./fide";
import games from "./games";
import messaging from "./messaging";
import oauth from "./oauth";
import openingExplorer from "./opening-explorer";
import puzzles from "./puzzles";
import relations from "./relations";
import simuls from "./simuls";
import studies from "./studies";
import swiss from "./swiss";
import tablebase from "./tablebase";
import teams from "./teams";
import tv from "./tv";
import users from "./users";

const scripts: Record<string, () => Promise<void>> = {
  account,
  analysis,
  arenas,
  board,
  bot,
  broadcasts,
  "bulk-pairings": bulkPairings,
  challenges,
  "external-engine": externalEngine,
  fide,
  games,
  messaging,
  oauth,
  "opening-explorer": openingExplorer,
  puzzles,
  relations,
  simuls,
  studies,
  swiss,
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
