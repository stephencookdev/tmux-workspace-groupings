const { closeTmuxWindow, getAllTmuxSessionWindows } = require("../utils");
const { getTmuxOption } = require("../options");

require("../init");

const SESSION_TARGETS = getTmuxOption("@groupings_session_targets").split(",");

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
