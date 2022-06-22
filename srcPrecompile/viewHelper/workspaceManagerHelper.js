import {uiutil} from "/apogeejs-ui-lib/src/apogeeUiLib.js"

const workspaceManagerHelper = {
    getLabel(workspaceManager) {
        return workspaceManager.getName()
    },

    getIconUrl(workspaceManager) {
        return uiutil.getResourcePath(ICON_RES_PATH,"app")
    },

    getChildren(workspaceManagerXXX,workspaceManager) {
        return [workspaceManager.getModelManager(),workspaceManager.getReferenceManager()]
    },

    /** note - menu items should not change for workspace updates - call back to apogeeView */
    getMenuItems(apogeeView,workspaceManager) {
        return [
            {
                text: "Edit Properties",
                action: () => apogeeView.editWorkspaceProperties()
            }
        ]

    }
}

export default workspaceManagerHelper

const ICON_RES_PATH = "/icons3/workspaceIcon.png"; 