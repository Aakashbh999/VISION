const { execSync } = require("child_process");

const getTrackedFiles = () => {
  const output = execSync("git ls-files", { encoding: "utf8" });
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
};

const files = getTrackedFiles();
const backslashPaths = files.filter((file) => file.includes("\\"));

const normalizedPathMap = new Map();
for (const file of files) {
  const normalized = file.replace(/\\/g, "/").toLowerCase();
  if (!normalizedPathMap.has(normalized)) {
    normalizedPathMap.set(normalized, [file]);
  } else {
    normalizedPathMap.get(normalized).push(file);
  }
}

const collisions = [...normalizedPathMap.values()].filter(
  (group) => group.length > 1,
);

if (!backslashPaths.length && !collisions.length) {
  console.log("Path canonicalization check passed.");
  process.exit(0);
}

if (backslashPaths.length) {
  console.error("Found tracked paths using backslashes:");
  backslashPaths.forEach((file) => console.error(` - ${file}`));
}

if (collisions.length) {
  console.error("Found normalized path collisions:");
  collisions.forEach((group) =>
    console.error(` - ${group.join(" <-> ")}`),
  );
}

process.exit(1);
