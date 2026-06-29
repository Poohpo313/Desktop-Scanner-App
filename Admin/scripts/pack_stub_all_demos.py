import json
from pathlib import Path

root = Path(r"c:\Users\User\Downloads\admin-interface-react-20260609T143925Z-3-001\admin-interface-react")
parts = root / "scripts" / "stub-bodies"
stubs = {}
for p in sorted(parts.glob("*.ts")):
    stubs[p.name] = p.read_text(encoding="utf-8")

header = """import fs from \"fs\";
import path from \"path\";
import { fileURLToPath } from \"url\";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, \"..\", \"src\", \"data\");
const skip = new Set([\"demoSettingsNotifications.ts\"]);

const STUBS = """

footer = """;


const stubbed = [];
for (const [name, content] of Object.entries(STUBS)) {
  if (skip.has(name)) continue;
  const text = content.endsWith(\"\\n\") ? content : content + \"\\n\";
  fs.writeFileSync(path.join(dataDir, name), text, \"utf8\");
  stubbed.push(name);
  console.log(\"stubbed\", name);
}

const restorePath = path.join(__dirname, \"restore-demos.mjs\");
if (fs.existsSync(restorePath)) {
  fs.unlinkSync(restorePath);
  console.log(\"deleted restore-demos.mjs\");
}

console.log(\"Done:\", stubbed.length, \"files\");
"""

runner = header + json.dumps(stubs, ensure_ascii=False) + footer
(root / "scripts" / "stub-all-demos.mjs").write_text(runner, encoding="utf-8", newline="\n")
print("wrote stub-all-demos.mjs", len(stubs), "stubs")