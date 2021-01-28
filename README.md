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

## Initial panes

You can initalise panes with commands by creating some JSON config files.

For example, if you had a project called `batman-work` in your workspace, then you could:

```bash
vi ~/.tmux/plugins/tmux-workspace-groupings-plugin/.config/batman-work.json
```

to create a file with contents:

```json
{
  "build": {
    "layout": "even-horizontal",
    "panes": ["echo 'i am'", "echo 'batman'"]
  },
  "git": {
    "layout": "tiled",
    "panes": ["git status", "git diff"]
  }
}
```

This means whenever you open the `batman-work` project, you will see:

1. in the `build` session, two panes with `echo 'i am'` and `echo 'batman'` in each
2. in the `git` session, two panes with `git status` and `git diff` in each

If you want a pane with no command initialised, you can simply include the empty string, e.g. `"panes": ["", ""]`

The `layout` is just the name of a default tmux layout (i.e. it's a tmux thing, not a tmux-workspace-groupings-plugin thing).

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
