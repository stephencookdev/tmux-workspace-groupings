# Tmux Workspace Groupings Plugin

This plugin supports a workspace grouping workflow.

## Install

Add the plugin to the list of tpm plugins in your tmux.conf

```bash
# Download and use the plugin
set -g @plugin 'stephencookdev/tmux-workspace-groupings-plugin'

# Set the workspace for the plugin to use
set -g @groupings_workspace_directory /Users/batman/projects
```

Hit `prefix + I` to install.

## Commands

Once installed, the following bindings are set up:

- `prefix + B` — this opens the create/swap menu
- `prefix + b` — this swaps between sessions of a grouping
- `prefix + X` — this closes all windows (in all sessions) of a particular grouping

## Options

```bash
# The the workspace the plugin will use to look for projects
# (Required)
set -g @groupings_workspace_directory /Users/batman/projects

# The sessions that will be created for each project (comma separated)
# Default: 'build,git'
set -g @groupings_session_targets 'build,git,test'

# The min/max polling frequency that the plugin will interact with
# your file-system when running. This is required for the plugin
# to stay in sync with your workspace and tmux status
# Default for min: 1000 (1 second)
# Default for max: 15000 (15 seconds)
set -g @groupings_file_system_poll_min_interval 1000
set -g @groupings_file_system_poll_max_interval 15000

# The name of the special session and window created by the plugin
# so the plugin can run quickly (especially for the create/swap menu)
set -g @groupings_special_session_name "___",
set -g @groupings_special_window_name "___",
```

### TODO

This plugin is super early-development, TODO remains:

- implement initialisation commands
