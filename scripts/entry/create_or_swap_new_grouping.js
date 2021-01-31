const path = require("path");
const { getAllTmuxSessionWindows } = require("../utils");
const { getTmuxOption } = require("../options");

require("../init");

const SPECIAL_SWAPPER_SESSION = getTmuxOption(
  "@groupings_special_session_name"
);
const SPECIAL_SWAPPER_WINDOW = getTmuxOption("@groupings_special_window_name");
const SESSION_TARGETS = getTmuxOption("@groupings_session_targets").split(",");
const WORKSPACE = getTmuxOption("@groupings_workspace_directory");
const FILE_SYSTEM_MIN_INTERVAL = getTmuxOption(
  "@groupings_file_system_poll_min_interval"
);
const FILE_SYSTEM_MAX_INTERVAL = getTmuxOption(
  "@groupings_file_system_poll_max_interval"
);
const PLUGIN_ROOT = path.join(__dirname, ".."); // we will be at `dist`, so one up should be the plugin root

const sessions = getAllTmuxSessionWindows();
const windowsInSpecialSession = sessions.filter(
  ([sessionName]) => sessionName === SPECIAL_SWAPPER_SESSION
);
const specialWindow = windowsInSpecialSession.find(
  ([, , windowName]) => windowName === SPECIAL_SWAPPER_WINDOW
);
const [, isSpecialSessionAttached, , isSpecialWindowActive] =
  specialWindow || [];
const isSpecialOpen =
  isSpecialSessionAttached === "1" && isSpecialWindowActive === "1";

const cmd = `node ${__filename}`;

if (isSpecialOpen) {
  // import only when needed in order to be as speedy as possible
  const { render } = require("ink");
  const React = require("react");
  const SwapApp = require("../swap_app.jsx");

  render(
    React.createElement(SwapApp, {
      workspace: WORKSPACE,
      sessionTargets: SESSION_TARGETS,
      fileSystemMinInterval: FILE_SYSTEM_MIN_INTERVAL,
      fileSystemMaxInterval: FILE_SYSTEM_MAX_INTERVAL,
      pluginRoot: PLUGIN_ROOT,
    })
  );
} else if (specialWindow) {
  // import only when needed in order to be as speedy as possible
  const { tmuxSwitch } = require("../utils");

  tmuxSwitch(SPECIAL_SWAPPER_SESSION, SPECIAL_SWAPPER_WINDOW);
} else {
  // import only when needed in order to be as speedy as possible
  const { tmuxCreate, tmuxSwitch } = require("../utils");

  tmuxCreate(SPECIAL_SWAPPER_WINDOW, "/", [SPECIAL_SWAPPER_SESSION], cmd);
  tmuxSwitch(SPECIAL_SWAPPER_SESSION, SPECIAL_SWAPPER_WINDOW);
}
