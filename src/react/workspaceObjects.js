/** This file contains the functions to generate the tree objects for the workspace. */

export function WorkspaceTreeEntry({workspaceManager, openTab, moduleHelper}) {
    const updateWorkspaceProperties = moduleHelper.updateWorkspaceProperties

    const menuItems = [
        {text: "Edit Properties", action: () => updateWorkspaceProperties(workspaceManager) },
    ]
    const modelManager = workspaceManager.getModelManager()
    const childTreeEntries = [
        <ModelTreeEntry key={modelManager.getId()} modelManager={modelManager} openTab={openTab} moduleHelper={moduleHelper} />
    ]

    return <TreeEntry 
        key={workspaceManager.getId()}
        iconSrc={workspaceManager.getIconUrl()} 
        text={workspaceManager.getName()} 
        status={workspaceManager.getStatus()} 
        menuItems={menuItems} 
        childTreeEntries={childTreeEntries} />
}

export function ModelTreeEntry({modelManager, openTab, moduleHelper}) {

    //child tree entries
    const childComponents = getChildComponents(modelManager,modelManager.getModel()) 
    const childTreeEntries = (childComponents.length > 0) ?
        childComponents.map( component => <ComponentTreeEntry key={component.getId()} component={component} 
                modelManager={modelManager} openTab={openTab} moduleHelper={moduleHelper} /> ) : undefined

    //menu items
    let menuItems = []
    moduleHelper.addParentMenuItems(menuItems,modelManager.getApp(),modelManager.getModel())
    
    return <TreeEntry 
        key={modelManager.getId()}
        iconSrc={modelManager.getIconUrl()} 
        text={modelManager.getName()} 
        status={modelManager.getStatus()} 
        menuItems={menuItems}
        childTreeEntries={childTreeEntries} />
}

export function ComponentTreeEntry({component, modelManager, openTab, moduleHelper}) {

    //child tree entries
    const childComponents = component.getComponentConfig().isParentOfChildEntries ? 
        getChildComponents(modelManager,component.getParentFolderForChildren()) : undefined 

    const childTreeEntries = ((childComponents)&&(childComponents.length > 0)) ?
        childComponents.map( component => <ComponentTreeEntry key={component.getId()} component={component} openTab={openTab}/> ) : undefined

    //menu items
    let menuItems = []
    //open tab
    if(component.getComponentConfig().isParentOfChildEntries) {
        moduleHelper.addOpenComponentTabMenuItem(menuItems,openTab,component.getId())
    }
    //component properties
    moduleHelper.addComponentMenuItems(menuItems,component)
    //add children
    if(component.getComponentConfig().isParentOfChildEntries) {
        moduleHelper.addParentMenuItems(menuItems,modelManager.getApp(),component.getParentFolderForChildren())
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


