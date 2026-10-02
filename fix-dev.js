const fs=require("fs"); let c=fs.readFileSync("dev-server.js","utf8"); c=c.replace("const backupPath = CONFIG_PATH + \".bak\";", ""); fs.writeFileSync("dev-server.js", c);
