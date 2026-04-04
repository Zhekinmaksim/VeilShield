const fs = require("fs");
const path = require("path");

const replacements = [
  {
    file: "node_modules/cofhe-hardhat-plugin/src/addresses.ts",
    from: [
      "0x0000000000000000000000000000000000000100",
      "0x0000000000000000000000000000000000000200",
      "0x0000000000000000000000000000000000000300"
    ],
    to: [
      "0x0000000000000000000000000000000000001000",
      "0x0000000000000000000000000000000000002000",
      "0x0000000000000000000000000000000000003000"
    ]
  },
  {
    file: "node_modules/cofhe-hardhat-plugin/dist/src/addresses.js",
    from: [
      "0x0000000000000000000000000000000000000100",
      "0x0000000000000000000000000000000000000200",
      "0x0000000000000000000000000000000000000300"
    ],
    to: [
      "0x0000000000000000000000000000000000001000",
      "0x0000000000000000000000000000000000002000",
      "0x0000000000000000000000000000000000003000"
    ]
  },
  {
    file: "node_modules/cofhe-hardhat-plugin/dist/src/addresses.d.ts",
    from: [
      "0x0000000000000000000000000000000000000100",
      "0x0000000000000000000000000000000000000200",
      "0x0000000000000000000000000000000000000300"
    ],
    to: [
      "0x0000000000000000000000000000000000001000",
      "0x0000000000000000000000000000000000002000",
      "0x0000000000000000000000000000000000003000"
    ]
  },
  {
    file: "node_modules/cofhejs/src/core/utils/consts.ts",
    from: ["0x0000000000000000000000000000000000000100"],
    to: ["0x0000000000000000000000000000000000001000"]
  },
  {
    file: "node_modules/cofhejs/dist/node.js",
    from: ["0x0000000000000000000000000000000000000100"],
    to: ["0x0000000000000000000000000000000000001000"]
  },
  {
    file: "node_modules/cofhejs/dist/web.js",
    from: ["0x0000000000000000000000000000000000000100"],
    to: ["0x0000000000000000000000000000000000001000"]
  }
];

for (const replacement of replacements) {
  const target = path.resolve(process.cwd(), replacement.file);
  if (!fs.existsSync(target)) {
    continue;
  }

  let source = fs.readFileSync(target, "utf8");
  replacement.from.forEach((from, index) => {
    source = source.split(from).join(replacement.to[index]);
  });
  fs.writeFileSync(target, source);
}

console.log("patched CoFHE mock addresses for local Hardhat compatibility");
