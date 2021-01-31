const { tmuxSwitch, getAllTmuxSessionWindows } = require("../utils");
const { getTmuxOption } = require("../options");

require("../init");

const SESSION_TARGETS = getTmuxOption("@groupings_session_targets").split(",");

const windows = getAllTmuxSessionWindows();

const [activeSession, , activeWindow] = windows.find(
  ([, sessionAttached, , windowActive]) =>
    sessionAttached === "1" && windowActive === "1"
);

let hasSwapped = false;
for (let i = 0; i < SESSION_TARGETS.length; i++) {
  if (activeSession === SESSION_TARGETS[i]) {
    const nextSession =
      SESSION_TARGETS[
        (i + 1 + SESSION_TARGETS.length) % SESSION_TARGETS.length
      ];
    tmuxSwitch(nextSession, activeWindow);
    hasSwapped = true;
    break;
  }
}
if (!hasSwapped) {
  // just swap to the first target, plain
  tmuxSwitch(SESSION_TARGETS[0]);
}
