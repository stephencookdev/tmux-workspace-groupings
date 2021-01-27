const { readdirSync } = require("fs");
const { execSync } = require("child_process");

const getDirectories = (source) =>
  readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

const getAllTmuxSessions = () => {
  return execSync(
    "tmux list-sessions -F '#{session_name}//#{session_attached}'"
  )
    .toString()
    .split("\n")
    .filter(Boolean)
    .map((w) => w.split("//"));
};

const getAllTmuxSessionWindows = () => {
  return execSync(
    "tmux list-windows -a -F '#{session_name}//#{session_attached}//#{window_name}//#{window_active}//#{pane_id}'"
  )
    .toString()
    .split("\n")
    .filter(Boolean)
    .map((w) => w.split("//"));
};

const tmuxSwitch = (session, win) => {
  if (session && win) execSync(`tmux select-window -t ${session}:${win}`);
  else if (win) execSync("tmux select-window -t " + win);

  if (session) execSync("tmux switch-client -t " + session);
};

const getTmuxWindows = (targetSession) => {
  const windowsForTarget = getAllTmuxSessionWindows()
    .filter(([sessionName]) => sessionName === targetSession)
    .map(([, , windowName]) => windowName);

  return windowsForTarget;
};

const tmuxCreate = (target, workspace, sessionTargets, cmd = "") => {
  const aliveSessions = getAllTmuxSessions().map(
    ([sessionName]) => sessionName
  );

  sessionTargets.forEach((session) => {
    if (aliveSessions.includes(session)) {
      execSync(
        `tmux new-window -t ${session} -n ${target} -c ${workspace} ${cmd}`
      );
    } else {
      execSync(
        `tmux new-session -A -d -s ${session} -n ${target} -c ${workspace} ${cmd}`
      );
    }
  });
};

const closeTmuxWindow = (session, win) => {
  execSync(`tmux kill-window -t ${session}:${win}`);
};

const killTmuxSession = (session) => {
  execSync(`tmux kill-session -t ${session}`);
};

const restoreLastTmuxSession = () => {
  execSync("tmux switch-client -l");
};

const runInAlternateScreen = () => {
  const enterAltScreenCommand = "\x1b[?1049h";
  const leaveAltScreenCommand = "\x1b[?1049l";
  process.stdout.write(enterAltScreenCommand);
  process.on("exit", () => {
    process.stdout.write(leaveAltScreenCommand);
  });
};

const throwTmuxError = (err) => {
  execSync(`tmux display-message '${err}'`);
  process.exit(
    // lie about our exit code so we don't show weird errors to the user, only the display-message error
    0
  );
};

module.exports = {
  getDirectories,
  getAllTmuxSessions,
  getAllTmuxSessionWindows,
  tmuxSwitch,
  getTmuxWindows,
  tmuxCreate,
  closeTmuxWindow,
  killTmuxSession,
  runInAlternateScreen,
  restoreLastTmuxSession,
  throwTmuxError,
};
