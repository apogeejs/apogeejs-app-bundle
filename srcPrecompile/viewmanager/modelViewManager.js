import {uiutil} from "/apogeejs-ui-lib/src/apogeeUiLib.js"
import {componentInfo} from "/apogeejs-app-lib/src/apogeeAppLib.js"

const modelViewManager = {
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
        //DOH! if referneces are opened, we will get here before the model opens!!!
        //let modelId = modelManager.getModel().getId()
        const parentComponentConfigs = componentInfo.getParentComponentConfigs()
        parentComponentConfigs.forEach(componentConfig => {
            let childMenuItem = {};
            childMenuItem.text = "Add Child " + componentConfig.displayName
            childMenuItem.action = () => apogeeView.addComponent(componentConfig,modelManager.getModel().getId())
            menuItems.push(childMenuItem);
        })

        return menuItems
    },

    getDefaultStateJson() {
        return {
            treeEntryOpened: true
        }
    }
}

export default modelViewManager

const FOLDER_LABEL = "Code"
const ICON_RES_PATH = "/icons3/folderIcon.png"