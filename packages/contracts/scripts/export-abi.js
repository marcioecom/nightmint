const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "..", "out");
const ABI_DIR = path.join(__dirname, "..", "abi");

const CONTRACTS = [
  "NightMintSeeder",
  "NightMintDescriptor",
  "NightMintToken",
  "NightMintAuctionHouse",
];

if (!fs.existsSync(ABI_DIR)) {
  fs.mkdirSync(ABI_DIR, { recursive: true });
}

for (const name of CONTRACTS) {
  const artifactPath = path.join(OUT_DIR, `${name}.sol`, `${name}.json`);

  if (!fs.existsSync(artifactPath)) {
    console.warn(`Skipping ${name}: artifact not found at ${artifactPath}`);
    continue;
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = artifact.abi;

  const outPath = path.join(ABI_DIR, `${name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(abi, null, 2));
  console.log(`Exported ${name} ABI to ${outPath}`);
}
