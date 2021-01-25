# Tmux Workspace Groupings Plugin

This plugin supports a workspace grouping workflow.

## Install

Add the plugin to the list of tpm plugins in your tmux.conf

```bash
set -g @plugin 'stephencookdev/tmux-workspace-groupings-plugin'
```

Hit `prefix + I` to install.

And then install the node_modules by

```bash
cd ~/.tmux/plugins/tmux-workspace-groupings-plugin
npm install
cd -
```

### TODO

This plugin is super early-development, TODO remains:

- remove the need to `npm install` post-install
- allow configurability of workspace and session targets
- implement initialisation commands
- allow easy `git pull` of new repos
