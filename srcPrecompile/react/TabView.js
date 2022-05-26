import {ComponentTab} from "./ComponentTab.js"
import {IconWithStatus} from "./IconwithStatus.js"

/** TabView 
* TabObject functions:
* - int/string getId() - a unique id for the tab object
* - string getName() - the name for the tab
* - element getTabElement() - Returns the tab content element
*/
export function TabView({apogeeView, tabObjectIds, selectedTabId, closeTab, selectTabId}) {

    let tabObjects = tabObjectIds.map(tabId => apogeeView.getTabObject(tabId))

    return (
        <div className="tabView">
            <div className="tabView_head">
                {tabObjects.map(tabObject => <TabTab 
                        key={tabObject.getId()} 
                        tabObject={tabObject} 
                        closeTab={closeTab} 
                        selectTabId={selectTabId} 
                        selected={selectedTabId == tabObject.getId()}
                    />)
                }
            </div>
            <div className="tabView_body">
                {tabObjects.map(tabObject => <TabFrame
                        key={tabObject.getId()} 
                        tabObject={tabObject} 
                        showing={selectedTabId == tabObject.getId()}
                    />)
                }
            </div>
        </div>
    )
}

/** The argument tabObject is the component or other workspace object that is displayed in the tab. */
function TabTab({tabObject, closeTab, selectTabId, selected}) {
    function closeClicked(event) {
        closeTab(tabObject)
        event.stopPropagation() //prevent click from going to tab
    }

    function tabClicked(event) {
        selectTabId(tabObject.getId())
        event.stopPropagation()
    }

    let className = "tabView_tab " + (selected ? "tabView_selected" : "tabView_deselected")
    let imageUrl = apogeeui.uiutil.getResourcePath("/close_gray.png","ui-lib");

    return (
        <div key={tabObject.getId()} onClick={tabClicked} className={className}>
        <IconWithStatus iconSrc={tabObject.getIconUrl()} status={tabObject.getStatus()} />
            <span>{tabObject.getName()}</span>
            <input type="image" onClick={closeClicked} src={imageUrl}/>    
        </div>
    )
}

//only for components!
function TabFrame({tabObject, showing}) {
    return (
        <div key={tabObject.getId()} style={{display: showing ? '' : "none"}} className="tabView_frame">
            <ComponentTab component={tabObject} showing={showing} />
        </div>
    )
}