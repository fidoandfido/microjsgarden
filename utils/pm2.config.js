"use strict";

const path = require("path");

let rootdir = process.env["ROOT_DIR"] 
let env = {
  JWT_INTERNAL_PUBLIC_KEY: process.env["JWT_INTERNAL_PUBLIC_KEY"],
  JWT_INTERNAL_PRIVATE_KEY: process.env["JWT_INTERNAL_PRIVATE_KEY"],
  JWT_EXTERNAL_PUBLIC_KEY: process.env["JWT_EXTERNAL_PUBLIC_KEY"],
  JWT_EXTERNAL_PRIVATE_KEY: process.env["JWT_EXTERNAL_PRIVATE_KEY"],
  DB_CONNECTION: process.env["DB_CONNECTION"],
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
        PORT: 3001,
        BROWSER: "none"
      }
    },
    {
      name: "auth",
      script: "npm",
      args: "start",
      cwd: path.join(rootdir, "auth"),
      watch: true,
      instance_var: "INSTANCE_ID",
      env: {
        ...env,
        PORT: 3110,
        NODE_ENV: "development"
      }
    },
    {
      name: "users",
      script: "npm",
      args: "start",
      cwd: path.join(rootdir, "users"),
      watch: true,
      instance_var: "INSTANCE_ID",
      env: {
        ...env,
        PORT: 3111,
        NODE_ENV: "development"
      }
    },
    {
      name: "gardens",
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
