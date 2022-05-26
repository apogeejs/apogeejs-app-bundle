import { addComponent } from "/apogeejs-app-bundle/src/commandseq/addcomponentseq.js"
import { updateComponentProperties } from "/apogeejs-app-bundle/src/commandseq/updatecomponentseq.js"
import { deleteComponent } from "/apogeejs-app-bundle/src/commandseq/deletecomponentseq.js"


/** This function gets the child components, usable either for a parent folder or the model object. */
export function getChildComponents(modelManager,memberParent) {
    let childComponents = []
    let childIdMap = memberParent.getChildIdMap()
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

export function addComponentMenuItems(menuItems,component) {
    menuItems.push({text: "Edit Properties", action: () => updateComponentProperties(component)})
    menuItems.push({text: "Delete", action: () => deleteComponent(component)})
}

export function addParentMenuItems(menuItems,app,memberParent,parentComponentConfigs) {
    let initialValues = memberParent ? {parentId:memberParent.getId()} : {}
    parentComponentConfigs.forEach(componentConfig => {
        let childMenuItem = {};
        childMenuItem.text = "Add Child " + componentConfig.displayName;
        childMenuItem.action = () => addComponent(app,componentConfig,initialValues);
        menuItems.push(childMenuItem);
    })
}

export function addOpenComponentTabMenuItem(menuItems,openTab,objectId) {
    menuItems.push({text: "Open", action: () => openTab(objectId)})
}