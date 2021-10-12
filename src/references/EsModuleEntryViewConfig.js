import {addLinkSeq,updateLinkSeq,removeLinkSeq} from "/apogeejs-view-lib/src/apogeeViewLib.js";

const ADD_MODULE_NAME_LINE = {
    "type": "textField",
    "label": "Module Name: ",
    "key": "name",
    "hint": "name to use in loadModule()",
    "size": 50
}

//name can not be changed after the module is created
const UPDATE_MODULE_NAME_LINE = {
    "type": "textField",
    "label": "Module Name: ",
    "key": "name",
    "hint": "name to use in loadModule()",
    "state": "disabled",
    "size": 50
}

const MODULE_URL_LINE = {
    "type": "textField",
    "label": "URL: ",
    "key": "url",
    "size": 100
}

//isDataValid: newValues => true,
//processData: newValues => newValues

const ADD_PROPERTIES_CONFIG = {
    dialogTitle: "ES Module",
    dialogLayout: [
        ADD_MODULE_NAME_LINE,
        MODULE_URL_LINE
    ]
};

const UPDATE_PROPERTIES_CONFIG = {
    dialogTitle: "ES Module",
    dialogLayout: [
        UPDATE_MODULE_NAME_LINE,
        MODULE_URL_LINE
    ]
};

const DELETE_MSG = "Are you sure you want to delete this ES module?"

const entryConfig = {
    referenceType: "es module",
    listName: "ES Modules",
    listIconPath:"/icons3/folderIcon.png",
    listMenuItems: [
        {
            text: "Add ES Module",
            callback: (app) => addLinkSeq(app,entryConfig.referenceType,ADD_PROPERTIES_CONFIG)
        }
    ],
    entryIconPath:"/icons3/esModuleIcon.png",
    entryMenuItems: [
        {
            text: "Edit Properties",
            callback: (app,referenceEntry) => updateLinkSeq(app,referenceEntry,entryConfig.referenceType,UPDATE_PROPERTIES_CONFIG)
        },
        {
            text: "Delete",
            callback: (app,referenceEntry) => removeLinkSeq(app,referenceEntry,DELETE_MSG)
        }
    ]
}

export default entryConfig;