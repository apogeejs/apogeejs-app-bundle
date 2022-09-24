
import {uiutil} from "/apogeejs-ui-lib/src/apogeeUiLib.js"

//this is a mess - maybe just put some data here in the config - like the dialog data

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

const REF_DATA = {
    "css link": {
        listLabel: "CSS Links",
        addLinkLabel: "Add CSS Script",
        iconPath: "/icons3/cssLinkIcon.png",
        editPropConfig: {
            dialogTitle: "CSS Script Link",
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
            ]
        },
        deleteMsg: "Are you sure you want to delete this CSS Script?"
    },
    "js link": {
        listLabel: "JS Scripts",
        addLinkLabel: "Add JS Script",
        iconPath: "/icons3/jsLinkIcon.png",
        editPropConfig: {
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
            ]
        },
        deleteMsg: "Are you sure you want to delete this JS script?"
    },
    "es module": {
        listLabel: "Web Modules",
        addLinkLabel: "Add ES Module",
        addPropConfig: {
            dialogTitle: "ES Module",
            dialogLayout: [
                ADD_MODULE_NAME_LINE,
                MODULE_URL_LINE
            ]
        },
        iconPath: "/icons3/esModuleIcon.png",
        editPropConfig: {
            dialogTitle: "ES Module",
            dialogLayout: [
                UPDATE_MODULE_NAME_LINE,
                MODULE_URL_LINE
            ]
        },
        deleteMsg: "Are you sure you want to delete this ES module?"
    },
    "npm module": {
        listLabel: "NPM Modules",
        iconPath: "/icons3/npmModuleIcon.png"
    },
    "apogee module": {
        iconPath: "/icons3/workspaceIcon.png",
        listLabel: "Apogee Modules"
    }
}


export const referenceListViewManager = {
    getLabel(referenceList) {
        let refType = referenceList.getReferenceType()
        return REF_DATA[refType].listLabel
        
    },

    getIconUrl(referenceList) {
        return uiutil.getResourcePath(FOLDER_ICON_PATH,"app")
    },

    getChildren(workspaceManager,referenceList) {
        return referenceList.getEntries()
    },

    /** note - menu items should not change for list object updates - call back to apogeeView */
    getMenuItems(apogeeView,referenceList) {
        let refType = referenceList.getReferenceType()
        if(refType == "apogee module") {
            //use a manage command
            return [
                {
                    text: "Manage",
                    action: () => apogeeView.manageModules()
                }
            ]
        }
        else if(refType == "npm module") {
            return []
        }
        else {
            //use add entry - allow for add prop config to be equal edit prop config, as it is in most cases
            let propConfig = REF_DATA[refType].addPropConfig ? REF_DATA[refType].addPropConfig : REF_DATA[refType].editPropConfig
            return [
                {
                    text: REF_DATA[refType].addLinkLabel,
                    action: () => apogeeView.addLink(referenceList.getReferenceType(),propConfig)
                }
            ]
        }
    }
}

export const referenceEntryViewManager = {
    getLabel(referenceEntry) {
        return referenceEntry.getDisplayName()
    },

    getIconUrl(referenceEntry) {
        let refType = referenceEntry.getEntryType()
        let iconPath = REF_DATA[refType].iconPath
        return uiutil.getResourcePath(iconPath,"app")
    },

    getChildren(workspaceManager,referenceManager) {
        return []
    },

    /** note - menu items should not change for entry updates - call back to apogeeView */
    getMenuItems(apogeeView,referenceEntry) {
        let entryType = referenceEntry.getEntryType()
        if(entryType == "apogee module") {
            //use a manage command
            return [
                {
                    text: "Manage",
                    action: () => apogeeView.manageModules()
                }
            ]
        }
        else if(entryType == "npm module") {
            return []
        }
        else {
            //use edit properties and delete commands
            return [
                {
                    text: "Edit Properties",
                    action: () => apogeeView.editRefEntryProperties(referenceEntry.getId(),REF_DATA[entryType].editPropConfig)
                },
                {
                    text: "Delete",
                    action: () => apogeeView.deleteRefEntry(referenceEntry.getId(),REF_DATA[entryType.editPropConfig].deleteMsg)
                }
            ]
        }
    }
}

const FOLDER_ICON_PATH = "/icons3/folderIcon.png"
