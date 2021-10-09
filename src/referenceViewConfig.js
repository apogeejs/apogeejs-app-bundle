import EsModuleEntryViewConfig from "/apogeejs-app-bundle/src/references/EsModuleEntryViewConfig.js";
import NpmModuleEntryViewConfig from "/apogeejs-app-bundle/src/references/NpmModuleEntryViewConfig.js";
import JsScriptEntryViewConfig from "/apogeejs-app-bundle/src/references/JsScriptEntryViewConfig.js";
import CssEntryViewConfig from "/apogeejs-app-bundle/src/references/CssEntryViewConfig.js";

import ReferenceView from "/apogeejs-app-bundle/src/references/ReferenceView.js";

/** This file initializes the reference class types available. */

let referenceViewConfigMap = {};
if(__APOGEE_ENVIRONMENT__ == "WEB") {
    referenceViewConfigMap[EsModuleEntryViewConfig.REFERENCE_TYPE] = EsModuleEntryViewConfig;
    referenceViewConfigMap[JsScriptEntryViewConfig.REFERENCE_TYPE] = JsScriptEntryViewConfig;
    referenceViewConfigMap[CssEntryViewConfig.REFERENCE_TYPE] = CssEntryViewConfig;
}
else if(__APOGEE_ENVIRONMENT__ == "NODE") {
    referenceViewConfigMap[NpmModuleEntryViewConfig.REFERENCE_TYPE] = NpmModuleEntryViewConfig;
}
else {
    console.log("Warning - apogee environment not recognized!");
}

ReferenceView.setReferenceViewConfigMap(referenceViewConfigMap);