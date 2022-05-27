import {IconWithStatus} from "./IconwithStatus.js"

/** TabView 
 * TabObjectInfo: {tabObject, getTabElement(tabObject,showing)}
 * TabObject functions:
 * - int/string getId() - a unique id for the tab object
 * - string getName() - the name for the tab
 * - element getTabElement() - Returns the tab content element
 * - status getStatus() - returns the status
 * - getIconUrl() - gets the url for the icon
*/
export function TabView({tabObjectInfos, selectedTabId, closeTab, selectTabId}) {

    return (
        <div className="tabView">
            <div className="tabView_head">
                {tabObjectInfos.map(tabObjectInfo => {
                    let tabObject = tabObjectInfo.tabObject
                    return <TabTab 
                        key={tabObject.getId()} 
                        tabObject={tabObject}
                        closeTab={closeTab} 
                        selectTabId={selectTabId} 
                        selected={selectedTabId == tabObject.getId()}
                    />
                })}
            </div>
            <div className="tabView_body">
                {tabObjectInfos.map(tabObjectInfo => {
                    let tabObject = tabObjectInfo.tabObject
                    let getTabElement = tabObjectInfo.getTabElement
                    return <TabFrame
                        key={tabObject.getId()} 
                        tabObject={tabObject}
                        getTabElement={getTabElement} 
                        showing={selectedTabId == tabObject.getId()}
                    />
                })}
            </div>
        </div>
    )
}

/** The argument tabObject is the component or other workspace object that is displayed in the tab. */
function TabTab({tabObject, closeTab, selectTabId, selected}) {
    function closeClicked(event) {
        closeTab(tabObject.getId())
        event.stopPropagation() //prevent click from going to tab
    }

    function tabClicked(event) {
        selectTabId(tabObject.getId())
        event.stopPropagation()
    }

    let className = "tabView_tab " + (selected ? "tabView_selected" : "tabView_deselected")
    let imageUrl = apogeeui.uiutil.getResourcePath("/close_gray.png","ui-lib");

    return (
        <div onClick={tabClicked} className={className}>
        <IconWithStatus iconSrc={tabObject.getIconUrl()} status={tabObject.getStatus()} />
            <span>{tabObject.getName()}</span>
            <input type="image" onClick={closeClicked} src={imageUrl}/>    
        </div>
    )
}

function TabFrame({tabObject, getTabElement, showing}) {
    return (
        <div style={{display: showing ? '' : "none"}} className="tabView_frame">
            {getTabElement(tabObject,showing)}
        </div>
    )
}