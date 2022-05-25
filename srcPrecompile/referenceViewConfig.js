import WebApogeeModuleEntryViewConfig from "/apogeejs-app-bundle/src/references/WebApogeeModuleEntryViewConfig.js";
import NodeApogeeModuleEntryViewConfig from "/apogeejs-app-bundle/src/references/NodeApogeeModuleEntryViewConfig.js";
import EsModuleEntryViewConfig from "/apogeejs-app-bundle/src/references/EsModuleEntryViewConfig.js";
import NpmModuleEntryViewConfig from "/apogeejs-app-bundle/src/references/NpmModuleEntryViewConfig.js";
import JsScriptEntryViewConfig from "/apogeejs-app-bundle/src/references/JsScriptEntryViewConfig.js";
import CssEntryViewConfig from "/apogeejs-app-bundle/src/references/CssEntryViewConfig.js";

import ReferenceView from "/apogeejs-app-bundle/src/references/ReferenceView.js";

/** This file initializes the reference class types available. */

let referenceViewConfigMap = {};
if(__APOGEE_ENVIRONMENT__ == "WEB") {
    referenceViewConfigMap[WebApogeeModuleEntryViewConfig.referenceType] = WebApogeeModuleEntryViewConfig;
    referenceViewConfigMap[EsModuleEntryViewConfig.referenceType] = EsModuleEntryViewConfig;
    referenceViewConfigMap[JsScriptEntryViewConfig.referenceType] = JsScriptEntryViewConfig;
    referenceViewConfigMap[CssEntryViewConfig.referenceType] = CssEntryViewConfig;
}
else if(__APOGEE_ENVIRONMENT__ == "NODE") {
    referenceViewConfigMap[NodeApogeeModuleEntryViewConfig.referenceType] = NodeApogeeModuleEntryViewConfig;
    referenceViewConfigMap[NpmModuleEntryViewConfig.referenceType] = NpmModuleEntryViewConfig;
}
else {
    console.log("Warning - apogee environment not recognized!");
}

ReferenceView.setReferenceViewConfigMap(referenceViewConfigMap);