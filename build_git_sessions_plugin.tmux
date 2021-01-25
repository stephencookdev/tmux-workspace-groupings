#!/usr/bin/env bash

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
tmux bind-key b run-shell "node $CURRENT_DIR/scripts/swap_to_alternate_session.js"
tmux bind-key B run-shell -b "node $CURRENT_DIR/scripts/create_or_swap_new_grouping.js &>/dev/null"
tmux bind-key X confirm-before -p "Close entire grouping? (y/N)" "run-shell \"node $CURRENT_DIR/scripts/close_grouping.js\""
