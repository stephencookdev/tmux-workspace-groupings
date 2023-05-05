const path = require("path");
const { exec } = require("child_process");
const React = require("react");
const { useEffect, useState } = React;
const { useStdin, useStdout, Box, Text, Spacer } = require("ink");
const fuzzysort = require("fuzzysort");
const FullScreen = require("./full_screen.jsx");
const Spinner = require("./spinner.jsx");
const {
  runInAlternateScreen,
  getTmuxWindows,
  getDirectories,
  tmuxSwitch,
  tmuxCreate,
  applyConfig,
} = require("./utils");

runInAlternateScreen();

const useTextInput = (callback) => {
  const { stdin, setRawMode } = useStdin();

  useEffect(() => {
    setRawMode(true);
    return () => setRawMode(false);
  }, [setRawMode]);

  useEffect(() => {
    const handleData = (data) => {
      const input = String(data);

      const key = {
        upArrow: input === "\u001B[A",
        downArrow: input === "\u001B[B",
        leftArrow: input === "\u001B[D",
        rightArrow: input === "\u001B[C",
        pageDown: input === "\u001B[6~",
        pageUp: input === "\u001B[5~",
        return: input === "\r",
        escape: input === "\u001B",
        backspace: input === "\u0008",
        delete: input === "\u007F" || input === "\u001B[3~",
        num: /^[0-9]$/.test(input) ? input : null,
      };

      if (Object.values(key).find(Boolean)) {
        return callback(null, key);
      }

      const textInput = input
        .split("")
        .filter((c) => /^[a-z -_]$/i.test(c))
        .join("");

      if (textInput) callback(textInput, {});
    };

    stdin?.on("data", handleData);
    return () => stdin?.off("data", handleData);
  }, [stdin, callback]);
};

let lastFileSystemCheck = 0;
const getFilesystemRefs = (workspace, sessionTargets) => ({
  dirs: getDirectories(workspace),
  windowSessions: getTmuxWindows(sessionTargets[0]),
});

const useFileSystemRefs = ({
  workspace,
  sessionTargets,
  fileSystemMinInterval,
  fileSystemMaxInterval,
}) => {
  const [fileSystemRefs, setFileSystemRefs] = useState(
    getFilesystemRefs(workspace, sessionTargets)
  );

  const updateFromFilesystem = () => {
    const timestamp = Date.now();
    if (timestamp - lastFileSystemCheck > fileSystemMinInterval) {
      lastFileSystemCheck = timestamp;
      setFileSystemRefs(getFilesystemRefs(workspace, sessionTargets));
    }
  };

  useEffect(() => {
    const interval = setInterval(updateFromFilesystem, fileSystemMaxInterval);
    return () => clearInterval(interval);
  });

  return [fileSystemRefs, updateFromFilesystem];
};

const DirectoryList = ({ dirs, pointer, windowSessions, rowHeight }) => {
  const offset = Math.max(0, pointer - rowHeight + 1);
  const offsetPointer = pointer - offset;
  const visibleDirs = dirs.slice(offset, offset + rowHeight);

  return visibleDirs.map((d, i) => {
    const offsetI = i + offset;
    const dName = offsetI < 10 ? `(${offsetI}) ${d}` : d;
    return (
      <Text
        key={d}
        color={
          i === offsetPointer
            ? "green"
            : windowSessions.includes(d)
            ? "yellow"
            : "white"
        }
      >
        {i === offsetPointer ? `✳ ${dName} ✳` : `  ${dName}  `}
      </Text>
    );
  });
};

const App = ({
  workspace,
  sessionTargets,
  fileSystemMinInterval,
  fileSystemMaxInterval,
  pluginRoot,
}) => {
  const { stdout } = useStdout();
  const [text, setText] = useState("");
  const [pointer, setPointer] = useState(0);
  const [isCloning, setIsCloning] = useState(false);
  const [fileSystemRefs, updateFromFilesystem] = useFileSystemRefs({
    workspace,
    sessionTargets,
    fileSystemMinInterval,
    fileSystemMaxInterval,
  });

  const { dirs, windowSessions } = fileSystemRefs;
  const matchingDirs = (
    text ? fuzzysort.go(text, dirs).map((r) => r.target) : dirs
  ).sort((a, b) => {
    const aIsSession = windowSessions.includes(a);
    const bIsSession = windowSessions.includes(b);
    if (aIsSession && !bIsSession) return -1;
    if (!aIsSession && bIsSession) return 1;
    return windowSessions.indexOf(a) - windowSessions.indexOf(b);
  });

  const roundedPointer = (pointer + matchingDirs.length) % matchingDirs.length;

  const exit = () => {
    process.exit(0);
  };

  const gitHubMatch = /^git@.*\/(.*)\.git$/.exec(text)?.[1];

  useTextInput((input, key) => {
    // ignore input while cloning
    if (isCloning) return;

    // we update from the filesystem whenever there's input as that implies
    // the user is actively using the system, and cares about if it's up
    // to date or not
    updateFromFilesystem();

    if (input) {
      setText((text) => text + input);
      setPointer(0);
    } else if (key.escape) {
      exit();
    } else if (key.num || (key.return && dirs[roundedPointer])) {
      const matchingDir = key.num
        ? matchingDirs[key.num]
        : matchingDirs[roundedPointer];
      const groupingWorkspace = path.join(workspace, matchingDir);
      if (windowSessions.includes(matchingDir)) {
        tmuxSwitch(null, matchingDir);
      } else {
        tmuxCreate(matchingDir, groupingWorkspace, sessionTargets);
        applyConfig(matchingDir, sessionTargets, groupingWorkspace, pluginRoot);
        tmuxSwitch(sessionTargets[0], matchingDir);
      }
      exit();
    } else if (key.return && gitHubMatch) {
      setIsCloning(true);
      exec(`git clone ${text} ${path.join(workspace, gitHubMatch)}`, () => {
        tmuxCreate(
          gitHubMatch,
          path.join(workspace, gitHubMatch),
          sessionTargets
        );
        tmuxSwitch(sessionTargets[0], gitHubMatch);
        exit();
      });
    } else if (key.downArrow) {
      setPointer((pointer) => pointer + 1);
    } else if (key.upArrow) {
      setPointer((pointer) => pointer - 1);
    } else if (key.backspace || key.delete) {
      setText((text) => text.slice(0, Math.max(text.length - 1, 0)));
      setPointer(0);
    }
  });

  const directoryHeight = Math.floor(stdout.rows * 0.8);

  if (isCloning) {
    return (
      <FullScreen
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Text>
          <Spinner /> Downloading <Text color="green">{gitHubMatch}</Text>...
        </Text>
      </FullScreen>
    );
  }

  return (
    <FullScreen
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Box borderStyle="round">
        <Text>{text || "..."}</Text>
      </Box>

      <Spacer />

      {gitHubMatch ? (
        <Text color="yellow">
          Hit enter to download <Text color="green">{gitHubMatch}</Text>
        </Text>
      ) : (
        <Box
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          height={directoryHeight}
        >
          <DirectoryList
            pointer={roundedPointer}
            dirs={matchingDirs}
            windowSessions={windowSessions}
            rowHeight={directoryHeight}
          />
        </Box>
      )}

      <Spacer />
    </FullScreen>
  );
};

module.exports = App;
