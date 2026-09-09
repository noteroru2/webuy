import fs from "node:fs";

const baseline = JSON.parse(fs.readFileSync(new URL("../observations/webuy-w5-baseline.json", import.meta.url), "utf8"));
const productionState = JSON.parse(fs.readFileSync(new URL("../observations/webuy-w5-production-state.json", import.meta.url), "utf8"));
const args = new Map(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, "").split("=");
  return [key, rest.join("=")];
}));

const latestFinalizedDate = args.get("latest-finalized") || baseline.latestFinalizedGscDate;

function dayDiff(from, to) {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error("Invalid YYYY-MM-DD date");
  return Math.max(0, Math.floor((b - a) / 86400000));
}

let verdict = "WAIT_FOR_PRODUCTION";
let newFinalizedDays = 0;

if (productionState.productionVerdict === "PASS" && productionState.productionPassDate) {
  newFinalizedDays = dayDiff(productionState.productionPassDate, latestFinalizedDate);
  if (newFinalizedDays >= baseline.observationClock.primaryDecisionWindowDays) {
    verdict = "READY_FOR_14D_DECISION";
  } else if (newFinalizedDays >= baseline.observationClock.minimumNewFinalizedDays) {
    verdict = "READY_FOR_7D_REVIEW";
  } else {
    verdict = "WAIT_FOR_MORE_DATA";
  }
}

console.log(JSON.stringify({
  batch: "WEBUY_W5",
  verdict,
  productionState,
  baselineFinalizedGscDate: baseline.latestFinalizedGscDate,
  latestFinalizedDate,
  newFinalizedDays,
  minimumNewFinalizedDays: baseline.observationClock.minimumNewFinalizedDays,
  primaryDecisionWindowDays: baseline.observationClock.primaryDecisionWindowDays,
  protectedLocationBaseline: baseline.protectedLocationBaseline,
  ctrQueryMixBaseline: baseline.ctrQueryMixBaseline,
  guardrails: [
    "Freeze W1-W4 during the first 7 finalized post-production days unless a technical NO_GO is confirmed.",
    "Protect distributed local ownership; do not consolidate generic near-me intent.",
    "Judge W1 winners by page/query movement, not sitewide average position alone.",
    "Do not re-add synthetic rating/review or deprecated FAQ/HowTo structured data."
  ]
}, null, 2));
