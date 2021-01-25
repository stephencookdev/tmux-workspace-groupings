const { execSync } = require("child_process");
const { closeTmuxWindow, getAllTmuxSessionWindows } = require("./utils");

const SESSION_TARGETS = ["build", "git"];

const windows = getAllTmuxSessionWindows();

const [activeSession, , activeWindow] = windows.find(
  ([, sessionAttached, , windowActive]) =>
    sessionAttached === "1" && windowActive === "1"
);

if (SESSION_TARGETS.includes(activeSession)) {
  SESSION_TARGETS.forEach((session) => {
    closeTmuxWindow(session, activeWindow);
  });
}
