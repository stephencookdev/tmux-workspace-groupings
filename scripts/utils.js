const { readFileSync, readdirSync } = require("fs");
const { execSync } = require("child_process");

// create "safe quotes", e.g. turning
// a string with a "quote" in it
// into
// "a string with a \"quote\" in it"
const sq = (str) => (str ? `"${str.replace(/"/g, '\\"')}"` : str);

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
  if (session && win)
    execSync(`tmux select-window -t ${sq(session)}:${sq(win)}`);
  else if (win) execSync(`tmux select-window -t ${sq(win)}`);

  if (session) execSync(`tmux switch-client -t ${sq(session)}`);
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
        `tmux new-window -t ${sq(session)} -n ${sq(target)} -c ${sq(
          workspace
        )} ${sq(cmd)}`
      );
    } else {
      execSync(
        `tmux new-session -A -d -s ${sq(session)} -n ${sq(target)} -c ${sq(
          workspace
        )} ${sq(cmd)}`
      );
    }
  });
};

const closeTmuxWindow = (session, win) => {
  execSync(`tmux kill-window -t ${sq(session)}:${sq(win)}`);
};

const killTmuxSession = (session) => {
  execSync(`tmux kill-session -t ${sq(session)}`);
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
  execSync(`tmux display-message ${sq(err)}`);
  process.exit(
    // lie about our exit code so we don't show weird errors to the user, only the display-message error
    0
  );
};

const getPaneIds = (sessionTarget, groupingName) => {
  const windows = getAllTmuxSessionWindows().filter(
    ([sessionName, , windowName]) =>
      sessionName === sessionTarget && windowName === groupingName
  );
  const paneIds = windows.map(([, , , , paneId]) => paneId);
  return paneIds;
};

const applyConfig = (groupingName, sessionTargets, workspace, pluginRoot) => {
  let configRaw;
  try {
    configRaw = readFileSync(`${pluginRoot}/.config/${groupingName}.json`);
  } catch (_) {
    // this will throw if the file doesn't exist, no worries about that
  }
  if (!configRaw) return;

  const config = JSON.parse(configRaw);
  sessionTargets.forEach((s) => {
    const sessionConfig = config[s];
    if (!sessionConfig) return;

    const initialPaneIds = getPaneIds(s, groupingName);
    const mainPaneId = initialPaneIds[0];
    if (sessionConfig.panes) {
      for (let i = 0; i < sessionConfig.panes.length; i++) {
        if (sessionConfig.panes[i]) {
          execSync(
            `tmux send-keys -t ${sq(s)}:${sq(groupingName)} ${sq(
              sessionConfig.panes[i]
            )} Enter`
          );
        }
        if (i === sessionConfig.panes.length - 1) {
          execSync(`tmux select-pane -t ${sq(mainPaneId)}`);
        } else {
          execSync(
            `tmux split-window -t ${sq(mainPaneId)} -c ${sq(workspace)}`
          );
        }
      }
    }
    if (sessionConfig.layout) {
      execSync(
        `tmux select-layout -t ${sq(s)}:${sq(groupingName)} ${sq(
          sessionConfig.layout
        )}`
      );
    }
  });
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
  applyConfig,
};
