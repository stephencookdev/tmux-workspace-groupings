const { getAllTmuxSessions, killTmuxSession } = require("../utils");
const { getTmuxOption } = require("../options");

const SPECIAL_SWAPPER_SESSION = getTmuxOption(
  "@groupings_special_session_name"
);

const sessions = getAllTmuxSessions().map(([sessionName]) => sessionName);
if (sessions.includes(SPECIAL_SWAPPER_SESSION)) {
  killTmuxSession(SPECIAL_SWAPPER_SESSION);
}
