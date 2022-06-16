import {SplitFrame} from "./SplitFrame.js"
import {TreeView} from "./TreeView.js"
import {TabView} from "./TabView.js"
import {MenuBar} from "./MenuBar.js"
import {WorkspaceTreeEntry} from "./WorkspaceObjects.js"

///////////////////////////////////////////
//Application
///////////////////////////////////////////


//constant - should be defined elsewhere
const INVALID_OBJECT_ID = 0

/** This is the app element. */
export function AppElement({workspaceManager, menuData}) {

    //tabDataList = [{tabObjectId, getTabElement(tabObject,showing)}]
    const [tabDataList,setTabDataList] = React.useState([])
    const [selectedTabId,setSelectedTabId] = React.useState(INVALID_OBJECT_ID)   //0 is invalid tab id

    function openTab(objectId,getTabElement,isSelected = true) {
        //insert only if not already there
        if(tabDataList.find(tabData => (objectId == tabData.objectId)) === undefined) {
            setTabDataList(tabDataList.concat({objectId, getTabElement}))
        }

        //select if specified
        if(isSelected) selectTabId(objectId)
    }

    function selectTabId(tabObjectId) {
        setSelectedTabId(tabObjectId)
    }

    function closeTab(objectId) {
        //add edit state to the tab view
        // if( tabObject.closeTabOk && !tabObject.closeTabOk() ) {
        //     //we need some action here presumably
        //     return
        // }
        
        let newTabDataList = tabDataList.filter(tabData => (objectId != tabData.objectId) )
        if(objectId == selectedTabId) {
            if(newTabDataList.length > 0) { //if we close the active tab, make the first remaining tab active
                selectTabId(newTabDataList[0].objectId)
            }
            else {
                selectTabId(INVALID_OBJECT_ID)
            }
        }
        setTabDataList(newTabDataList)
    }

    const childTreeEntries = workspaceManager ? 
            [<WorkspaceTreeEntry key={workspaceManager.getId()} workspaceManager={workspaceManager} openTab={openTab} />]
            : undefined


    //Here we might find components that no longer exist - remove them if so
    let tabObjectInfos = []
    let activeTabObject
    tabDataList.forEach(tabData => {
        const tabObject = workspaceManager.getObject(tabData.objectId)
        if(tabObject) {
            tabObjectInfos.push({
                tabObject: tabObject,
                getTabElement: tabData.getTabElement
            })
            if(tabObject.getId() == selectedTabId) {
                activeTabObject = tabObject
            }
        }
        else {
            //tabObject not found
            closeTab(tabData.objectId)
        }
    })

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
                    closeTab={closeTab} selectTabId={selectTabId} />} 
            />
        </>
    )
}

