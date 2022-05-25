import {SelectMenu} from "./SelectMenu.js"
import {SplitFrame} from "./SplitFrame.js"
import {TreeView} from "./TreeView.js"
import {TabView} from "./TabView.js"
import {WorkspaceTreeEntry} from "./WorkspaceObjects.js"

///////////////////////////////////////////
//Application
///////////////////////////////////////////


//constant - should be defined elsewhere
const INVALID_OBJECT_ID = 0

/** This is the app element. */
export function App({apogeeView}) {
    //Tab State
    //tab data = {text,contentElement,closeOkCallback}
    const [tabObjectIds,setTabObjectIds] = React.useState([])
    const [selectedTabId,setSelectedTabId] = React.useState(INVALID_OBJECT_ID)   //0 is invalid tab id

    function openTab(tabObjectId,isSelected = true) {
        //open if not already there
        if(tabObjectIds.find(existingTabObjectId => tabObjectId == existingTabObjectId) === undefined) {
            setTabObjectIds(tabObjectIds.concat(tabObjectId))
        }

        //select if specified
        if(isSelected) selectTabId(tabObjectId)
    }

    function selectTabId(tabObjectId) {
        //need notify show and hide!!!
        setSelectedTabId(tabObjectId)
    }

    function closeTab(tabObject) {
        if( tabObject.closeTabOk && !tabObject.closeTabOk() ) {
            //we need some action here presumably
            return
        }
        
        let newTabObjectIds = tabObjectIds.filter(existingTabObjectId => existingTabObjectId != tabObject.getId())
        if(tabObject.getId() == selectedTabId) {
            if(newTabObjectIds.length > 0) { //if we close the active tab, make the first tab active
                selectTabId(newTabObjectIds[0])
            }
            else {
                selectTabId(INVALID_OBJECT_ID)
            }
        }
        setTabObjectIds(newTabObjectIds)
    }

    const workspaceManager = apogeeView.getApp().getWorkspaceManager();

    const childTreeEntries = workspaceManager ? 
            [<WorkspaceTreeEntry key={workspaceManager.getId()} workspaceManager={workspaceManager} openTab={openTab} />]
            : undefined

    return (
        <>
            <MenuBar apogeeView={apogeeView} />
            <SplitFrame
                leftContent={<TreeView childTreeEntries={childTreeEntries}/>}
                rightContent={<TabView apogeeView={apogeeView} tabObjectIds={tabObjectIds} 
                        selectedTabId={selectedTabId} closeTab={closeTab} selectTabId={selectTabId} />} 
            />
        </>
    )
}

function MenuBar({apogeeView}) {
    return (
        <div className="appMenuBar">
            {apogeeView.getMenuItems().map(menuItem => <SelectMenu key={menuItem.text} text={menuItem.text} items={menuItem.items}/>)}
        </div>
    )
}