///////////////////////////////////////////
//Application
///////////////////////////////////////////



/** This funtion renders the app
 * I have it here because all jsx code, for now, must be in the global files rather than modules
 * The variable is defined in the html file
 */
function renderApp(appObject) {
    ReactDOM.render(<App appObject={appObject}/>,document.getElementById(appObject.containerId))
}

//constant - should be defined elsewhere
const INVALID_OBJECT_ID = 0

///////////////////////////////////////////////
//UI
///////////////////////////////////////////////
function App({appObject}) {
    //Tab State
    //tab data = {text,contentElement,closeOkCallback}
    const [tabObjectIds,setTabObjectIds] = React.useState([])
    const [selectedTabId,setSelectedTabId] = React.useState(INVALID_OBJECT_ID)   //0 is invalid tab id

    function openTab(tabObject,isSelected = true) {
        //open if not already there
        if(tabObjectIds.find(existingTabObjectId => tabObject.getId() == existingTabObjectId) === undefined) {
            
            //notify open??? (probabl not necessary)
            tabObject.tabOpened();

            setTabObjectIds(tabObjectIds.concat(tabObject.getId()))
        }
        //select if specified
        if(isSelected) selectTabId(tabObject.getId())
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

        //notify close??? (I am not sure if this is the place for it)
        tabObject.tabClosed();
        
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

    return (
        <>
            <MenuBar appObject={appObject} />
            <SplitFrame
                leftContent={<TreeView treeObject={appObject} openTab={openTab}/>}
                rightContent={<TabView appObject={appObject} tabObjectIds={tabObjectIds} selectedTabId={selectedTabId} closeTab={closeTab} selectTabId={selectTabId}/>} 
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