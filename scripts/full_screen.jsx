const React = require("react");
const { Box, useStdout } = require("ink");

const FullScreen = (props) => {
  const { stdout } = useStdout();
  return <Box width={stdout.columns} height={stdout.rows} {...props} />;
};

module.exports = FullScreen;
