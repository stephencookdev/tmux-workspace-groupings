#!/usr/bin/env bash

# Get our the directory of this tmux plugin
PLUGIN_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Remove any existing key bindings
tmux unbind-key b
tmux unbind-key B
tmux unbind-key X

# Set up our key bindings
tmux bind-key b run-shell "node $PLUGIN_ROOT/dist/swap_to_alternate_session.js"
tmux bind-key B display-popup -w 80% -h 80% -E "node $PLUGIN_ROOT/dist/create_or_swap_new_grouping.js"
tmux bind-key X confirm-before -p "Close entire grouping? (y/N)" "run-shell \"node $PLUGIN_ROOT/dist/close_grouping.js\""
