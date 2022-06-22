import {componentInfo} from "/apogeejs-app-lib/src/apogeeAppLib.js"


const componentHelper = {
    getLabel(component) {
        return component.getName()
    },

    getIconUrl(component) {
        return component.getIconUrl()
    },

    getChildren(workspaceManager,component) {
        if(component.getComponentConfig().isParentOfChildEntries) {
            let modelManager = workspaceManager.getModelManager()
            let parentMember = component.getParentFolderForChildren()
            let childComponents = []
            let childIdMap = parentMember.getChildIdMap()
            for(let childKey in childIdMap) {
                let childMemberId = childIdMap[childKey]
                let childComponentId = modelManager.getComponentIdByMemberId(childMemberId)
                if(childComponentId) {
                    let childComponent = modelManager.getComponentByComponentId(childComponentId)
                    childComponents.push(childComponent)
                }
            }
            return childComponents
        }
        else {
            return []
        }
    },

    /** note - menu items should not change for component updates - call back to apogeeView */
    getMenuItems(apogeeView,component) {
        //menu items
        let menuItems = []
        //open tab
        if(component.getComponentConfig().isParentOfChildEntries) {
            menuItems.push({text: "Open", action: () => apogeeView.openTab(component.getId())})
        }

        //component properties
        menuItems.push({text: "Edit Properties", action: () => apogeeView.updateComponentProperties(component.getId())})
        menuItems.push({text: "Delete", action: () => apogeeView.deleteComponent(component.getId())})

        //add children
        if(component.getComponentConfig().isParentOfChildEntries) {
            let memberParent = component.getParentFolderForChildren()
            let initialValues = memberParent? {parentId:memberParent.getId()} : {}
            const parentComponentConfigs = componentInfo.getParentComponentConfigs()
            parentComponentConfigs.forEach(componentConfig => {
                let childMenuItem = {};
                childMenuItem.text = "Add Child " + componentConfig.displayName
                childMenuItem.action = () => apogeeView.addComponent(componentConfig,initialValues)
                menuItems.push(childMenuItem);
            })
        }

        return menuItems
        
    }

}

export default componentHelper
