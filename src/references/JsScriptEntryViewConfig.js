import {addLinkSeq,updateLinkSeq,removeLinkSeq} from "/apogeejs-view-lib/src/apogeeViewLib.js";

const PROPERTIES_CONFIG = {
    dialogTitle: "JS Script Link",
    dialogLayout: [
        {
            "type": "textField",
            "label": "URL: ",
            "key": "url",
            "size": 100
        },
        {
            "type": "textField",
            "label": "Display Name: ",
            "key": "name",
            "hint": "optional",
            "size": 25
        }
    ]//,
    //isDataValid: newValues => true,
    //processData: newValues => newValues
};

const DELETE_MSG = "Are you sure you want to delete this JS script?"

const entryConfig = {
    referenceType: "js link",
    listName: "JS Scripts",
    listIconPath:"/icons3/folderIcon.png",
    listMenuItems: [
        {
            text: "Add JS Script",
            callback: (app) => addLinkSeq(app,entryConfig.referenceType,PROPERTIES_CONFIG)
        }
    ],
    entryIconPath:"/icons3/jsLinkIcon.png",
    entryMenuItems: [
        {
            text: "Edit Properties",
            callback: (app,referenceEntry) => updateLinkSeq(app,referenceEntry,entryConfig.referenceType,PROPERTIES_CONFIG)
        },
        {
            text: "Delete",
            callback: (app,referenceEntry) => removeLinkSeq(app,referenceEntry,DELETE_MSG)
        }
    ]
}

export default entryConfig;