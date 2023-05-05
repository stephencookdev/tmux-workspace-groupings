const path = require("path");
const { render } = require("ink");
const React = require("react");
const SwapApp = require("../swap_app.jsx");
const { getTmuxOption } = require("../options");

require("../init");

const SESSION_TARGETS = getTmuxOption("@groupings_session_targets").split(",");
const WORKSPACE = getTmuxOption("@groupings_workspace_directory");
const FILE_SYSTEM_MIN_INTERVAL = getTmuxOption(
  "@groupings_file_system_poll_min_interval"
);
const FILE_SYSTEM_MAX_INTERVAL = getTmuxOption(
  "@groupings_file_system_poll_max_interval"
);
const PLUGIN_ROOT = path.join(__dirname, ".."); // we will be at `dist`, so one up should be the plugin root

render(
  React.createElement(SwapApp, {
    workspace: WORKSPACE,
    sessionTargets: SESSION_TARGETS,
    fileSystemMinInterval: FILE_SYSTEM_MIN_INTERVAL,
    fileSystemMaxInterval: FILE_SYSTEM_MAX_INTERVAL,
    pluginRoot: PLUGIN_ROOT,
  })
);
