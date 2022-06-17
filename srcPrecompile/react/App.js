import {SplitFrame} from "./SplitFrame.js"
import {TreeView} from "./TreeView.js"
import {TabView} from "./TabView.js"
import {MenuBar} from "./MenuBar.js"
import {WorkspaceTreeEntry} from "./WorkspaceObjects.js"

///////////////////////////////////////////
//Application
///////////////////////////////////////////

/** This is the app element. */
export function AppElement({workspaceManager,menuData,viewState}) {

    /////////////////////////////////////////
    //TEMP
    let tabObjectInfos,selectedTabId,tabFunctions,activeTabObject
    if(viewState) {
        tabObjectInfos = viewState.tabDataList
        selectedTabId = viewState.selectedTabId
        tabFunctions = viewState.tabFunctions

        let activeObjectInfo = tabObjectInfos.filter(tabDataObject => tabDataObject.tabId == selectedTabId)
        if(activeObjectInfo) {
            activeTabObject = activeObjectInfo.tabObject
        }
    }
    /////////////////////////////////////////


    const childTreeEntries = workspaceManager ? 
            [<WorkspaceTreeEntry key={workspaceManager.getId()} workspaceManager={workspaceManager} openTab={tabFunctions.openTab} />]
            : undefined

    

    let activeTabName, activeTabIcon, activeTabStatus
    if(activeTabObject) {
        activeTabName = activeTabObject.getFullName(workspaceManager.getModelManager())
        activeTabIcon = activeTabObject.getIconUrl()
        activeTabObject.getState()
    }

    return (
        <>
            <MenuBar menuData={menuData} activeTabName={activeTabName} activeTabIcon={activeTabIcon} activeTabStatus={activeTabStatus} />
            <SplitFrame
                leftContent={<TreeView childTreeEntries={childTreeEntries}/>}
                rightContent={<TabView tabObjectInfos={tabObjectInfos} selectedTabId={selectedTabId} 
                    closeTab={tabFunctions.closeTab} selectTabId={tabFunctions.selectTab} />} 
            />
        </>
    )
}

