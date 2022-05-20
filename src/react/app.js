///////////////////////////////////////////
//Application
///////////////////////////////////////////



/** This funtion renders the app
 * I have it here because all jsx code, for now, must be in the global files rather than modules
 * The variable is defined in the html file
 */
function renderApp(appObject,moduleHelper) {
    ReactDOM.render(<App appObject={appObject} moduleHelper={moduleHelper} />,document.getElementById(appObject.containerId))
}

//constant - should be defined elsewhere
const INVALID_OBJECT_ID = 0

///////////////////////////////////////////////
//UI
///////////////////////////////////////////////
function App({appObject, moduleHelper}) {
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

    const workspaceManager = appObject.getApp().getWorkspaceManager();

    const childTreeEntries = workspaceManager ? 
            [<WorkspaceTreeEntry key={workspaceManager.getId()} workspaceManager={workspaceManager} openTab={openTab} moduleHelper={moduleHelper}/>]
            : undefined

    return (
        <>
            <MenuBar appObject={appObject} />
            <SplitFrame
                leftContent={<TreeView childTreeEntries={childTreeEntries}/>}
                rightContent={<TabView appObject={appObject} tabObjectIds={tabObjectIds} 
                        selectedTabId={selectedTabId} closeTab={closeTab} selectTabId={selectTabId} moduleHelper={moduleHelper}/>} 
            />
        </>
    )
}

function MenuBar({appObject}) {
    return (
        <div className="appMenuBar">
            {appObject.getMenuItems().map(menuItem => <SelectMenu key={menuItem.text} text={menuItem.text} items={menuItem.items}/>)}
        </div>
    )
}