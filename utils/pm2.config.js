"use strict";

const path = require("path");

let rootdir = process.env["ROOT_DIR"] 
let env = {
};

module.exports = {
  apps: [{
      name: "Frontend",
      script: "npm",
      args: "start",
      cwd: path.join(rootdir, "frontend"),
      watch: true,
      env: {
        env,
        PORT: 3000,
        BROWSER: "none"
      }
    },
    {
      name: "AUTH",
      script: "npm",
      args: "start",
      cwd: path.join(rootdir, "auth"),
      watch: true,
      instance_var: "INSTANCE_ID",
      env: {
        ...env,
        PORT: 3111,
        NODE_ENV: "development"
      }
    },
    {
      name: "GARDENS",
      script: "npm",
      args: "start",
      cwd: path.join(rootdir, "gardens"),
      watch: true,
      instance_var: "INSTANCE_ID",
      env: {
        ...env,
        PORT: 3112,
        NODE_ENV: "development"
      }
    },
  ]
};
