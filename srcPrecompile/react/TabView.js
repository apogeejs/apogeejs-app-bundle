import {IconWithStatus} from "./IconwithStatus.js"

/** TabView 
 * TabObjectInfo: {tabObject, getTabElement(tabObject,showing)}
 * TabObject functions:
 * - int/string getId() - a unique id for the tab object
 * - string getName() - the name for the tab
 * - element getTabElement() - Returns the tab content element
 * - status getState() - returns the status
 * - getIconUrl() - gets the url for the icon
*/
export function TabView({tabListState}) {

    let selectedId = tabListState.selectedId
    let tabStateArray = tabListState.tabStateArray
    let selectTab = tabListState.tabFunctions.selectTab
    let closeTab = tabListState.tabFunctions.closeTab

    return (
        <div className="tabView">
            <div className="tabView_head">
                {tabStateArray.map(tabState => {
                    return <TabTab 
                        key={tabState.tabData.id} 
                        tabId={tabState.tabData.id} 
                        label={tabState.tabData.label}
                        status={tabState.tabData.status}
                        statusMessage={tabState.tabData.statusMessage}
                        iconSrc={tabState.tabData.iconSrc}
                        closeTab={closeTab} 
                        selectTab={selectTab} 
                        isSelected={selectedId == tabState.tabData.id}
                    />
                })}
            </div>
            <div className="tabView_body">
                {tabStateArray.map(tabState => {
                    return <TabFrame
                        key={tabState.tabData.id} 
                        tabState={tabState} 
                        showing={selectedId == tabState.tabData.id}
                    />
                })}
            </div>
        </div>
    )
}

/** The argument tabObject is the component or other workspace object that is displayed in the tab. */
function TabTab({tabId, label, status, iconSrc, closeTab, selectTab, isSelected}) {
    function closeClicked(event) {
        closeTab(tabId)
        event.stopPropagation() //prevent click from going to tab
    }

    function tabClicked(event) {
        selectTab(tabId)
        event.stopPropagation()
    }

    let className = "tabView_tab " + (isSelected ? "tabView_selected" : "tabView_deselected")
    let imageUrl = apogeeui.uiutil.getResourcePath("/close_gray.png","ui-lib");

    return (
        <div onClick={tabClicked} className={className}>
        <IconWithStatus iconSrc={iconSrc} status={status} />
            <span>{label}</span>
            <input type="image" onClick={closeClicked} src={imageUrl}/>    
        </div>
    )
}

function TabFrame({tabState, showing}) {
    return (
        <div style={{display: showing ? '' : "none"}} className="tabView_frame">
            {tabState.tabData.getTabElement(tabState,showing)}
        </div>
    )
}