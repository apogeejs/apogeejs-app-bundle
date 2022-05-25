import {getChildComponents,addComponentMenuItems,addOpenComponentTabMenuItem,addParentMenuItems} from "./componentUtils.js"
import {TreeEntry} from "./TreeView.js"
import {updateWorkspaceProperties} from "/apogeejs-app-bundle/src/commandseq/updateworkspaceseq.js"
import {componentInfo} from "/apogeejs-app-lib/src/apogeeAppLib.js";

/** This file contains the functions to generate the tree objects for the workspace. */

export function WorkspaceTreeEntry({workspaceManager, openTab}) {

    const menuItems = [
        {text: "Edit Properties", action: () => updateWorkspaceProperties(workspaceManager) },
    ]
    const modelManager = workspaceManager.getModelManager()
    const parentComponentConfigs = componentInfo.getParentComponentConfigs()
    const childTreeEntries = [
        <ModelTreeEntry key={modelManager.getId()} modelManager={modelManager} openTab={openTab} parentComponentConfigs={parentComponentConfigs}/>
    ]

    return <TreeEntry 
        key={workspaceManager.getId()}
        iconSrc={workspaceManager.getIconUrl()} 
        text={workspaceManager.getName()} 
        status={workspaceManager.getStatus()} 
        menuItems={menuItems} 
        childTreeEntries={childTreeEntries} />
}

export function ModelTreeEntry({modelManager, openTab, parentComponentConfigs}) {

    //child tree entries
    const childComponents = getChildComponents(modelManager,modelManager.getModel()) 
    const childTreeEntries = (childComponents.length > 0) ?
        childComponents.map( component => <ComponentTreeEntry key={component.getId()} component={component} 
                modelManager={modelManager} openTab={openTab} parentComponentConfigs={parentComponentConfigs} /> ) : undefined

    //menu items
    let menuItems = []
    addParentMenuItems(menuItems,modelManager.getApp(),modelManager.getModel(),parentComponentConfigs)
    
    return <TreeEntry 
        key={modelManager.getId()}
        iconSrc={modelManager.getIconUrl()} 
        text={modelManager.getName()} 
        status={modelManager.getStatus()} 
        menuItems={menuItems}
        childTreeEntries={childTreeEntries} />
}

export function ComponentTreeEntry({component, modelManager, openTab, parentComponentConfigs}) {

    //child tree entries
    const childComponents = component.getComponentConfig().isParentOfChildEntries ? 
        getChildComponents(modelManager,component.getParentFolderForChildren()) : undefined 

    const childTreeEntries = ((childComponents)&&(childComponents.length > 0)) ?
        childComponents.map( component => <ComponentTreeEntry key={component.getId()} component={component} 
            modelManager={modelManager} openTab={openTab} /> ) : undefined

    //menu items
    let menuItems = []
    //open tab
    if(component.getComponentConfig().isParentOfChildEntries) {
        addOpenComponentTabMenuItem(menuItems,openTab,component.getId())
    }
    //component properties
    addComponentMenuItems(menuItems,component)
    //add children
    if(component.getComponentConfig().isParentOfChildEntries) {
        addParentMenuItems(menuItems,modelManager.getApp(),component.getParentFolderForChildren(),parentComponentConfigs)
    }
    

    //react element
    return <TreeEntry 
        key={component.getId()}
        iconSrc={component.getIconUrl()} 
        text={component.getName()} 
        status={component.getStatus()} 
        menuItems={menuItems}
        childTreeEntries={childTreeEntries} />
}


