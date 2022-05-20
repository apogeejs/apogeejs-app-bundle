import {addComponent} from "/apogeejs-app-bundle/src/commandseq/addcomponentseq.js";
import {updateComponentProperties} from "/apogeejs-app-bundle/src/commandseq/updatecomponentseq.js";
import {deleteComponent} from "/apogeejs-app-bundle/src/commandseq/deletecomponentseq.js";
import {updateWorkspaceProperties} from "/apogeejs-app-bundle/src/commandseq/updateworkspaceseq.js";
import DataDisplayWrapper from "/apogeejs-app-bundle/src/componentdisplay/DataDisplayWrapper.js";

import {componentInfo} from "/apogeejs-app-lib/src/apogeeAppLib.js";

/** This module exports some functions we need inside the react code - but for now while testing we cant mix JSX and modules. */
const moduleHelper = {

    getDataDisplayWrapper(component,index) {
        return new DataDisplayWrapper(component,index)
    },

    getComponentConfigs: componentInfo.getComponentConfigs,

    getChildComponentConfigs: componentInfo.getChildComponentConfigs,

    getParentComponentConfigs: componentInfo.getParentComponentConfigs,

    addComponent: addComponent,

    updateWorkspaceProperties: updateWorkspaceProperties,

    addComponentMenuItems(menuItems,component) {
        menuItems.push({text: "Edit Properties", action: () => updateComponentProperties(component)})
        menuItems.push({text: "Delete", action: () => deleteComponent(component)})
    },

    addParentMenuItems(menuItems,app,memberParent) {
        let initialValues = memberParent ? {parentId:memberParent.getId()} : {}
        let parentComponentConfigs = componentInfo.getParentComponentConfigs()
        parentComponentConfigs.forEach(componentConfig => {
            let childMenuItem = {};
            childMenuItem.text = "Add Child " + componentConfig.displayName;
            childMenuItem.action = () => addComponent(app,componentConfig,initialValues);
            menuItems.push(childMenuItem);
        })
    },

    addOpenComponentTabMenuItem(menuItems,openTab,objectId) {
        menuItems.push({text: "Open", action: () => openTab(objectId)})
    }
}

export default moduleHelper;

