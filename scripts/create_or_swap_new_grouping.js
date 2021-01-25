const { getAllTmuxSessionWindows } = require("./utils");

const SPECIAL_SWAPPER_SESSION = "___";
const SPECIAL_SWAPPER_WINDOW = "___";

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

const cmd = `'node ${__filename}'`;

if (isSpecialOpen) {
  // import only when needed in order to be as speedy as possible
  const importJsx = require("import-jsx");
  const { render } = require("ink");
  const React = require("react");
  const SwapApp = importJsx("./swap_app.jsx");

  render(React.createElement(SwapApp));
} else if (specialWindow) {
  // import only when needed in order to be as speedy as possible
  const { tmuxSwitch } = require("./utils");

  tmuxSwitch(SPECIAL_SWAPPER_SESSION, SPECIAL_SWAPPER_WINDOW);
} else {
  // import only when needed in order to be as speedy as possible
  const { tmuxCreate, tmuxSwitch } = require("./utils");

  tmuxCreate(SPECIAL_SWAPPER_WINDOW, "/", [SPECIAL_SWAPPER_SESSION], cmd);
  tmuxSwitch(SPECIAL_SWAPPER_SESSION, SPECIAL_SWAPPER_WINDOW);
}
