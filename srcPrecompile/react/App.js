import {SplitFrame} from "./SplitFrame.js"
import {TreeView} from "./TreeView.js"
import {TabView} from "./TabView.js"
import {MenuBar} from "./MenuBar.js"

///////////////////////////////////////////
//Application
///////////////////////////////////////////

/** This is the app element. */
export function AppElement({workspaceTreeState,menuData,tabListState}) {

    //get active tab data
    let activeTabState
    if(tabListState) {
        activeTabState = tabListState.tabStateArray.filter(tabState => tabState.tabData.id == tabListState.selectedId)

    }

    let activeTabName, activeTabIcon, activeTabStatus
    if(activeTabState) {
        activeTabName = activeTabState.label
        activeTabIcon = activeTabState.iconSrc
        activeTabStatus = activeTabState.status
    }

    return (
        <>
            <MenuBar menuData={menuData} activeTabName={activeTabName} activeTabIcon={activeTabIcon} activeTabStatus={activeTabStatus} />
            <SplitFrame
                leftContent={<TreeView childTreeEntries={workspaceTreeState ? [workspaceTreeState] : []}/>}
                rightContent={<TabView tabListState={tabListState} />} 
            />
        </>
    )
}

