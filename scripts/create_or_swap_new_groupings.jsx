const path = require("path");
const React = require("react");
const { useRef, useState } = React;
const { render, useApp, useInput, Box, Text, Spacer } = require("ink");
const fuzzysort = require("fuzzysort");
const importJsx = require("import-jsx");
const FullScreen = importJsx("./full_screen.jsx");
const {
  runInAlternateScreen,
  getTmuxWindows,
  getDirectories,
  tmuxSwitch,
  tmuxCreate,
} = require("./utils");

const WORKSPACE = "/Users/stephen/workspace";
const SESSION_TARGETS = ["build", "git"];

runInAlternateScreen();

const App = () => {
  const { exit } = useApp();
  const [text, setText] = useState("");
  const [pointer, setPointer] = useState(0);
  const dirsRef = useRef(getDirectories(WORKSPACE));
  const windowSessionsRef = useRef(getTmuxWindows(SESSION_TARGETS[0]));

  const dirs = dirsRef.current;
  const matchingDirs = text
    ? fuzzysort.go(text, dirs).map((r) => r.target)
    : dirs;
  const windowSessions = windowSessionsRef.current;

  const roundedPointer = (pointer + matchingDirs.length) % matchingDirs.length;

  useInput((input, key) => {
    if (key.escape) {
      exit();
    } else if (key.return) {
      const matchingDir = matchingDirs[roundedPointer];
      if (!windowSessions.includes(matchingDir)) {
        tmuxCreate(
          matchingDir,
          path.join(WORKSPACE, matchingDir),
          SESSION_TARGETS
        );
      }
      tmuxSwitch(SESSION_TARGETS[0], matchingDir);
      exit();
    } else if (key.downArrow) {
      setPointer((pointer) => pointer + 1);
    } else if (key.upArrow) {
      setPointer((pointer) => pointer - 1);
    } else if (key.backspace || key.delete) {
      setText((text) => text.slice(0, Math.max(text.length - 1, 0)));
      setPointer(0);
    } else if (/^[a-z0-9 -_]$/i.test(input)) {
      setText((text) => text + input);
      setPointer(0);
    }
  });

  return (
    <FullScreen
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Box borderStyle="round">
        <Text>{text || " "}</Text>
      </Box>
      <Spacer />
      {matchingDirs.map((d, i) => (
        <Text
          key={d}
          color={
            i === roundedPointer
              ? "green"
              : windowSessions.includes(d)
              ? "yellow"
              : "white"
          }
        >
          {d}
        </Text>
      ))}
      <Spacer />
    </FullScreen>
  );
};

render(<App />);
