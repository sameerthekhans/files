#!/usr/bin/env node

const path = require("path");
const { spawnSync } = require("child_process");

const cliPath = path.join(
  __dirname,
  "node_modules",
  "commit-and-tag-version",
  "bin",
  "cli.js"
);

const result = spawnSync("node", [cliPath, ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: process.cwd(),
});

process.exit(result.status);
