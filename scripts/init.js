const { appendFileSync } = require("fs");
const path = require("path");
const { throwTmuxError } = require("./utils");
const { getTmuxOption } = require("./options");

const WORKSPACE = getTmuxOption("@groupings_workspace_directory");
const PLUGIN_ROOT = path.join(__dirname, ".."); // we will be at `dist`, so one up should be the plugin root

if (!WORKSPACE) {
  throwTmuxError(
    "You need to incude a `set-option -g workspace MY_WORKSPACE` to point to where your workspace directory is"
  );
}

process.on("uncaughtException", (error, origin) => {
  const errorLogFile = `${PLUGIN_ROOT}/twg.error.log`;
  const timeOfError = new Date().toISOString();

  const errorLog = {
    timeOfError,
    error: error.toString(),
    stack: error.stack,
    origin,
  };
  const errorLogString = JSON.stringify(errorLog, null, 2);

  appendFileSync(errorLogFile, errorLogString + "\n");

  throwTmuxError(`Unexpected TWG error! Error log written to ${errorLogFile}`);
});
