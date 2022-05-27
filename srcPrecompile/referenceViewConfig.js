import WebApogeeModuleEntryViewConfig from "/apogeejs-app-bundle/src/references/WebApogeeModuleEntryViewConfig.js";
//import NodeApogeeModuleEntryViewConfig from "/apogeejs-app-bundle/src/references/NodeApogeeModuleEntryViewConfig.js";
import EsModuleEntryViewConfig from "/apogeejs-app-bundle/src/references/EsModuleEntryViewConfig.js";
//import NpmModuleEntryViewConfig from "/apogeejs-app-bundle/src/references/NpmModuleEntryViewConfig.js";
import JsScriptEntryViewConfig from "/apogeejs-app-bundle/src/references/JsScriptEntryViewConfig.js";
import CssEntryViewConfig from "/apogeejs-app-bundle/src/references/CssEntryViewConfig.js";

export const referenceViewConfigList = [
    WebApogeeModuleEntryViewConfig,
    EsModuleEntryViewConfig,
    JsScriptEntryViewConfig,
    CssEntryViewConfig
]


if(__APOGEE_ENVIRONMENT__ == "NODE") throw new Error("References not configured for Node environment!")

// const referenceViewConfigList = [
//     NodeApogeeModuleEntryViewConfig,
//     NpmModuleEntryViewConfig
// ]


