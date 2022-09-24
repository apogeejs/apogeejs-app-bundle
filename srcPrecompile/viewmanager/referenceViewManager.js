import {uiutil} from "/apogeejs-ui-lib/src/apogeeUiLib.js"

const referenceViewManager = {
    getLabel(referenceManager) {
        return FOLDER_LABEL
    },

    getIconUrl(referenceManager) {
        return uiutil.getResourcePath(ICON_RES_PATH,"app")
    },

    getChildren(workspaceManager,referenceManager) {
        return referenceManager.getReferenceLists()
    },

    /** note - menu items should not change for object updates - call back to apogeeView */
    getMenuItems(apogeeView,referenceManager) {
        return []
    }
}

export default referenceViewManager

const FOLDER_LABEL = "Libraries"
const ICON_RES_PATH = "/icons3/folderIcon.png"