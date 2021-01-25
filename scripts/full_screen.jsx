const React = require("react");
const { useState, useEffect } = React;
const { Box } = require("ink");

const FullScreen = (props) => {
  const [size, setSize] = useState({
    columns: process.stdout.columns,
    rows: process.stdout.rows,
  });

  useEffect(() => {
    function onResize() {
      setSize({
        columns: process.stdout.columns,
        rows: process.stdout.rows,
      });
    }

    process.stdout.on("resize", onResize);
    return () => {
      process.stdout.off("resize", onResize);
    };
  }, []);

  return <Box width={size.columns} height={size.rows} {...props} />;
};

module.exports = FullScreen;
