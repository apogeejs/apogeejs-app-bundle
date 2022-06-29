import {uiutil} from "/apogeejs-ui-lib/src/apogeeUiLib.js"
import {componentInfo} from "/apogeejs-app-lib/src/apogeeAppLib.js"

const modelManagerHelper = {
    getLabel(modelManager) {
        return FOLDER_LABEL
    },

    getIconUrl(modelManager) {
        return uiutil.getResourcePath(ICON_RES_PATH,"app")
    },

    getChildren(workspaceManager,modelManager) {
        let model = modelManager.getField("model")
        let childComponents = []
        if(model) {
            let childIdMap = model.getChildIdMap()
            for(let childKey in childIdMap) {
                let childMemberId = childIdMap[childKey]
                let childComponentId = modelManager.getComponentIdByMemberId(childMemberId)
                if(childComponentId) {
                    let childComponent = modelManager.getComponentByComponentId(childComponentId)
                    childComponents.push(childComponent)
                }
            }
        }
        return childComponents
    },

    /** note - menu items should not change for modelManager updates - call back to apogeeView */
    getMenuItems(apogeeView,modelManager) {
        //menu items - add children
        let menuItems = []
        let model = modelManager.getModel()
        const parentComponentConfigs = componentInfo.getParentComponentConfigs()
        parentComponentConfigs.forEach(componentConfig => {
            let childMenuItem = {};
            childMenuItem.text = "Add Child " + componentConfig.displayName
            childMenuItem.action = () => apogeeView.addComponent(componentConfig,model.getId())
            menuItems.push(childMenuItem);
        })

        return menuItems
    }
}

export default modelManagerHelper

const FOLDER_LABEL = "Code"
const ICON_RES_PATH = "/icons3/folderIcon.png"