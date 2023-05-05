<div align="center">
  <img width="140" src="https://raw.githubusercontent.com/stephencookdev/tmux-workspace-groupings/assets/twg.png" />
  <h1>Tmux Workspace Groupings</h1>
</div>

An easy way to create, open, and close groupings of workspaces.

![TWG working in zsh](https://raw.githubusercontent.com/stephencookdev/tmux-workspace-groupings/assets/preview.gif)

## Requirements

- [tmux](https://github.com/tmux/tmux/wiki/Installing)
- [tpm](https://github.com/tmux-plugins/tpm#installation)
- [node](https://nodejs.org/en/download/package-manager/)

## Install

Add the following to your `~/.tmux.conf`:

```bash
# Download and use TWG
set -g @plugin 'stephencookdev/tmux-workspace-groupings'

# Set the workspace for TWG to use
set -g @groupings_workspace_directory /Users/batman/projects
```

Once saved, hit <kbd>prefix</kbd> + <kbd>I</kbd> to install.

## Commands

| Keybinding                       | Description                                                 |
| -------------------------------- | ----------------------------------------------------------- |
| <kbd>prefix</kbd> + <kbd>B</kbd> | Opens the groupings create/swap menu                        |
| <kbd>prefix</kbd> + <kbd>b</kbd> | Switch between sessions in the active group                 |
| <kbd>prefix</kbd> + <kbd>X</kbd> | Close all windows, in all sessions, of the current grouping |

## Options

```bash
# The workspace TWG will use to look for projects
# (Required)
set -g @groupings_workspace_directory /Users/batman/projects

# The sessions to create for each project (comma separated)
# Default: 'build,git'
set -g @groupings_session_targets 'build,git,test'

# The min/max polling frequency of your file-system when running.
# TWG requires this to stay in sync with your workspace and tmux status
# Default for min: 1000 (1 second)
# Default for max: 15000 (15 seconds)
set -g @groupings_file_system_poll_min_interval 1000
set -g @groupings_file_system_poll_max_interval 15000
```

## Initial Panes

You can initalise panes with commands by creating some JSON config files.

For example, if you had a project called `batman-work` in your workspace, then you could:

```bash
vi ~/.tmux/plugins/tmux-workspace-groupings/.config/batman-work.json
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

Now whenever you open the `batman-work` project, you will see:

1. in the `build` session, two panes with `echo 'i am'` and `echo 'batman'` in each
2. in the `git` session, two panes with `git status` and `git diff` in each

If you want a pane with no command initialised, you can include the empty string, e.g. `"panes": ["", ""]`

The `layout` is the name of a default tmux layout (i.e. it's a tmux thing, not a tmux-workspace-groupings thing).

## New Project

Paste a GitHub URL into the create/swap menu to clone the repo into your workspace. TWG will also create a grouping for the new project.

![Cloning a new project and creating a grouping](https://raw.githubusercontent.com/stephencookdev/tmux-workspace-groupings/assets/new-project.gif)
