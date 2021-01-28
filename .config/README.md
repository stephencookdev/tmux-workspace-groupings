Add files here to specify preset pane layouts and commands for each session, when a grouping is opened.

E.g.

```json
{
  "build": {
    "layout": "even-horizontal",
    "panes": ["npm run dev", "npm run test --watch", "npm run lint --watch"]
  },
  "git": {
    "layout": "tiled",
    "panes": ["git status", "git diff"]
  }
}
```

The file should be called `GROUPING_NAME.json`, where `GROUPING_NAME` is the name of the group (e.g. the name of the directory)
