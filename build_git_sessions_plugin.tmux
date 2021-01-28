#!/usr/bin/env bash

# Get our the directory of this tmux plugin
PLUGIN_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Set up our key bindings
tmux bind-key b run-shell "node $PLUGIN_ROOT/dist/swap_to_alternate_session.js"
tmux bind-key B run-shell -b "node $PLUGIN_ROOT/dist/create_or_swap_new_grouping.js &>/dev/null"
tmux bind-key X confirm-before -p "Close entire grouping? (y/N)" "run-shell \"node $PLUGIN_ROOT/dist/close_grouping.js\""

# Close the previous create/swap menu if it's open
node $PLUGIN_ROOT/dist/kill_create_swap_menu.js
