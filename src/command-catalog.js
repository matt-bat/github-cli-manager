import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const coveragePath = path.join(rootDir, "docs", "gh-command-coverage.md");

function splitMarkdownRow(line) {
  return line
    .slice(1, -1)
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll("\\|", "|"));
}

export async function loadCommandCatalog() {
  const markdown = await readFile(coveragePath, "utf8");
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("| `gh "))
    .map((line) => {
      const [commandCell, surface, pathType, notes] = splitMarkdownRow(line);
      const command = commandCell.replace(/^`|`$/g, "");
      return {
        id: command
          .replace(/^gh\s+/, "")
          .replace(/[^a-zA-Z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        command,
        argsText: command,
        surface,
        pathType,
        notes
      };
    });
}
