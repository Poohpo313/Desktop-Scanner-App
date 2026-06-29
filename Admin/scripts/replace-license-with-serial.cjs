const fs = require("node:fs");
const path = require("node:path");

const replacements = [
  ["3 License Assignment Requests Completed", "3 Serial Assignment Requests Completed"],
  ["Completed License Key Renewal Request", "Completed Serial Key Renewal Request"],
  ["License Assignment Request ID", "Serial Assignment Request ID"],
  ["4 New License Keys Generated", "4 New Serial Keys Generated"],
  ["License Assignment Completed", "Serial Assignment Completed"],
  ["License Keys Generated", "Serial Keys Generated"],
  ["License Key Management", "Serial Key Management"],
  ["License Key Generated", "Serial Key Generated"],
  ["License Key Revoked", "Serial Key Revoked"],
  ["License Key Assigned", "Serial Key Assigned"],
  ["Assigned License Key", "Assigned Serial Key"],
  ["Generate License Keys", "Generate Serial Keys"],
  ["enterprise scanner licenses", "enterprise scanner serials"],
  ["Export License Data", "Export Serial Data"],
  ["License Assignments", "Serial Assignments"],
  ["License Assignment", "Serial Assignment"],
  ["License key generated", "Serial key generated"],
  ["License key copied", "Serial key copied"],
  ["License key added", "Serial key added"],
  ["License keys refreshed", "Serial keys refreshed"],
  ["License exported as", "Serial exported as"],
  ["License key:", "Serial key:"],
  ["Copy license key", "Copy serial key"],
  ["License Details", "Serial Details"],
  ["View License", "View Serial"],
  ["License Key", "Serial Key"],
  ["License Type", "Serial Type"],
  ["License Generated", "Serial Generated"],
  ["License Revoked", "Serial Revoked"],
  ["License utilization", "Serial utilization"],
  ["License Expiry", "Serial Expiry"],
  ["license keys expire", "serial keys expire"],
  ["Review License Renewals", "Review Serial Renewals"],
  ["Enterprise Secure License", "Enterprise Secure Serial"],
  ["valid license", "valid serial"],
  ["LicenseManager", "SerialManager"],
  ["license-assignments", "serial-assignments"],
  ["LICENSE KEY", "SERIAL KEY"],
  ["License keys", "Serial keys"],
  ["license keys", "serial keys"],
  ["License Utilization", "Serial Utilization"],
  ["Assigned License", "Assigned Serial"],
  ["VIEW LICENSE MODAL", "VIEW SERIAL MODAL"],
  ["Failed to save license key", "Failed to save serial key"],
  ["Your new license key", "Your new serial key"],
  ["activate license key", "activate serial key"],
  ["per license", "per serial"],
  ["Standard licenses", "Standard serials"],
];

function walkDir(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules") {
        walkDir(fullPath, files);
      }
      continue;
    }

    if (/\.(tsx?|json)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

const srcDir = path.join(__dirname, "..", "src");
let updatedFiles = 0;

for (const file of walkDir(srcDir)) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;

  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    updatedFiles += 1;
  }
}

console.log(`Updated ${updatedFiles} files.`);
