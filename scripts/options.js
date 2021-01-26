const { execSync } = require("child_process");

const defaultValues = {
  "@groupings_session_targets": "build,git",
  "@groupings_special_session_name": "___",
  "@groupings_special_window_name": "___",
  "@groupings_file_system_poll_min_interval": 1000,
  "@groupings_file_system_poll_max_interval": 15000,

  // mandatory options
  "@groupings_workspace_directory": null,
};

const getTmuxOption = (option) => {
  const value = execSync(`tmux show-option -gqv ${option}`).toString().trim();
  return value || defaultValues[option];
};

module.exports = { getTmuxOption };
