/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./scripts/init.js":
/*!*************************!*\
  !*** ./scripts/init.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("const { appendFileSync } = __webpack_require__(/*! fs */ \"fs\");\nconst path = __webpack_require__(/*! path */ \"path\");\nconst { throwTmuxError } = __webpack_require__(/*! ./utils */ \"./scripts/utils.js\");\nconst { getTmuxOption } = __webpack_require__(/*! ./options */ \"./scripts/options.js\");\n\nconst WORKSPACE = getTmuxOption(\"@groupings_workspace_directory\");\nconst PLUGIN_ROOT = path.join(__dirname, \"..\"); // we will be at `dist`, so one up should be the plugin root\n\nif (!WORKSPACE) {\n  throwTmuxError(\n    \"You need to incude a `set-option -g workspace MY_WORKSPACE` to point to where your workspace directory is\"\n  );\n}\n\nprocess.on(\"uncaughtException\", (error, origin) => {\n  const errorLogFile = `${PLUGIN_ROOT}/twg.error.log`;\n  const timeOfError = new Date().toISOString();\n\n  const errorLog = {\n    timeOfError,\n    error: error.toString(),\n    stack: error.stack,\n    origin,\n  };\n  const errorLogString = JSON.stringify(errorLog, null, 2);\n\n  appendFileSync(errorLogFile, errorLogString + \"\\n\");\n\n  throwTmuxError(`Unexpected TWG error! Error log written to ${errorLogFile}`);\n});\n\n\n//# sourceURL=webpack://tmux-workspace-groupings-plugin/./scripts/init.js?");

/***/ }),

/***/ "./scripts/options.js":
/*!****************************!*\
  !*** ./scripts/options.js ***!
  \****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const { execSync } = __webpack_require__(/*! child_process */ \"child_process\");\n\nconst defaultValues = {\n  \"@groupings_session_targets\": \"build,git\",\n  \"@groupings_file_system_poll_min_interval\": 1000,\n  \"@groupings_file_system_poll_max_interval\": 15000,\n\n  // mandatory options\n  \"@groupings_workspace_directory\": null,\n};\n\nconst getTmuxOption = (option) => {\n  const value = execSync(`tmux show-option -gqv ${option}`).toString().trim();\n  return value || defaultValues[option];\n};\n\nmodule.exports = { getTmuxOption };\n\n\n//# sourceURL=webpack://tmux-workspace-groupings-plugin/./scripts/options.js?");

/***/ }),

/***/ "./scripts/utils.js":
/*!**************************!*\
  !*** ./scripts/utils.js ***!
  \**************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("const { readFileSync, readdirSync } = __webpack_require__(/*! fs */ \"fs\");\nconst { execSync } = __webpack_require__(/*! child_process */ \"child_process\");\n\n// create \"safe quotes\", e.g. turning\n// a string with a \"quote\" in it\n// into\n// \"a string with a \\\"quote\\\" in it\"\nconst sq = (str) => (str ? `\"${str.replace(/\"/g, '\\\\\"')}\"` : str);\n\nconst getDirectories = (source) =>\n  readdirSync(source, { withFileTypes: true })\n    .filter((dirent) => dirent.isDirectory())\n    .map((dirent) => dirent.name);\n\nconst getAllTmuxSessions = () => {\n  return execSync(\n    \"tmux list-sessions -F '#{session_name}//#{session_attached}'\"\n  )\n    .toString()\n    .split(\"\\n\")\n    .filter(Boolean)\n    .map((w) => w.split(\"//\"));\n};\n\nconst getAllTmuxSessionWindows = () => {\n  return execSync(\n    \"tmux list-windows -a -F '#{session_name}//#{session_attached}//#{window_name}//#{window_active}//#{pane_id}'\"\n  )\n    .toString()\n    .split(\"\\n\")\n    .filter(Boolean)\n    .map((w) => w.split(\"//\"));\n};\n\nconst tmuxSwitch = (session, win) => {\n  if (session && win)\n    execSync(`tmux select-window -t ${sq(session)}:${sq(win)}`);\n  else if (win) execSync(`tmux select-window -t ${sq(win)}`);\n\n  if (session) execSync(`tmux switch-client -t ${sq(session)}`);\n};\n\nconst getTmuxWindows = (targetSession) => {\n  const windowsForTarget = getAllTmuxSessionWindows()\n    .filter(([sessionName]) => sessionName === targetSession)\n    .map(([, , windowName]) => windowName);\n\n  return windowsForTarget;\n};\n\nconst tmuxCreate = (target, workspace, sessionTargets, cmd = \"\") => {\n  const aliveSessions = getAllTmuxSessions().map(\n    ([sessionName]) => sessionName\n  );\n\n  sessionTargets.forEach((session) => {\n    if (aliveSessions.includes(session)) {\n      execSync(\n        `tmux new-window -t ${sq(session)} -n ${sq(target)} -c ${sq(\n          workspace\n        )} ${sq(cmd)}`\n      );\n    } else {\n      execSync(\n        `tmux new-session -A -d -s ${sq(session)} -n ${sq(target)} -c ${sq(\n          workspace\n        )} ${sq(cmd)}`\n      );\n    }\n  });\n};\n\nconst closeTmuxWindow = (session, win) => {\n  execSync(`tmux kill-window -t ${sq(session)}:${sq(win)}`);\n};\n\nconst killTmuxSession = (session) => {\n  execSync(`tmux kill-session -t ${sq(session)}`);\n};\n\nconst restoreLastTmuxSession = () => {\n  execSync(\"tmux switch-client -l\");\n};\n\nconst runInAlternateScreen = () => {\n  const enterAltScreenCommand = \"\\x1b[?1049h\";\n  const leaveAltScreenCommand = \"\\x1b[?1049l\";\n  process.stdout.write(enterAltScreenCommand);\n  process.on(\"exit\", () => {\n    process.stdout.write(leaveAltScreenCommand);\n  });\n};\n\nconst throwTmuxError = (err) => {\n  execSync(`tmux display-message ${sq(err)}`);\n  process.exit(\n    // lie about our exit code so we don't show weird errors to the user, only the display-message error\n    0\n  );\n};\n\nconst getPaneIds = (sessionTarget, groupingName) => {\n  const windows = getAllTmuxSessionWindows().filter(\n    ([sessionName, , windowName]) =>\n      sessionName === sessionTarget && windowName === groupingName\n  );\n  const paneIds = windows.map(([, , , , paneId]) => paneId);\n  return paneIds;\n};\n\nconst applyConfig = (groupingName, sessionTargets, workspace, pluginRoot) => {\n  let configRaw;\n  try {\n    configRaw = readFileSync(`${pluginRoot}/.config/${groupingName}.json`);\n  } catch (_) {\n    // this will throw if the file doesn't exist, no worries about that\n  }\n  if (!configRaw) return;\n\n  const config = JSON.parse(configRaw);\n  sessionTargets.forEach((s) => {\n    const sessionConfig = config[s];\n    if (!sessionConfig) return;\n\n    const initialPaneIds = getPaneIds(s, groupingName);\n    const mainPaneId = initialPaneIds[0];\n    if (sessionConfig.panes) {\n      for (let i = 0; i < sessionConfig.panes.length; i++) {\n        if (sessionConfig.panes[i]) {\n          execSync(\n            `tmux send-keys -t ${sq(s)}:${sq(groupingName)} ${sq(\n              sessionConfig.panes[i]\n            )} Enter`\n          );\n        }\n        if (i === sessionConfig.panes.length - 1) {\n          execSync(`tmux select-pane -t ${sq(mainPaneId)}`);\n        } else {\n          execSync(\n            `tmux split-window -t ${sq(mainPaneId)} -c ${sq(workspace)}`\n          );\n        }\n      }\n    }\n    if (sessionConfig.layout) {\n      execSync(\n        `tmux select-layout -t ${sq(s)}:${sq(groupingName)} ${sq(\n          sessionConfig.layout\n        )}`\n      );\n    }\n  });\n};\n\nmodule.exports = {\n  getDirectories,\n  getAllTmuxSessions,\n  getAllTmuxSessionWindows,\n  tmuxSwitch,\n  getTmuxWindows,\n  tmuxCreate,\n  closeTmuxWindow,\n  killTmuxSession,\n  runInAlternateScreen,\n  restoreLastTmuxSession,\n  throwTmuxError,\n  applyConfig,\n};\n\n\n//# sourceURL=webpack://tmux-workspace-groupings-plugin/./scripts/utils.js?");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("child_process");;

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");;

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
(() => {
/*!*****************************************!*\
  !*** ./scripts/entry/close_grouping.js ***!
  \*****************************************/
eval("const { closeTmuxWindow, getAllTmuxSessionWindows } = __webpack_require__(/*! ../utils */ \"./scripts/utils.js\");\nconst { getTmuxOption } = __webpack_require__(/*! ../options */ \"./scripts/options.js\");\n\n__webpack_require__(/*! ../init */ \"./scripts/init.js\");\n\nconst SESSION_TARGETS = getTmuxOption(\"@groupings_session_targets\").split(\",\");\n\nconst windows = getAllTmuxSessionWindows();\n\nconst [activeSession, , activeWindow] = windows.find(\n  ([, sessionAttached, , windowActive]) =>\n    sessionAttached === \"1\" && windowActive === \"1\"\n);\n\nif (SESSION_TARGETS.includes(activeSession)) {\n  SESSION_TARGETS.forEach((session) => {\n    closeTmuxWindow(session, activeWindow);\n  });\n}\n\n\n//# sourceURL=webpack://tmux-workspace-groupings-plugin/./scripts/entry/close_grouping.js?");
})();

/******/ })()
;