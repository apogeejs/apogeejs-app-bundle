import {IconWithStatus} from "./IconwithStatus.js"
import {SelectMenu} from "./SelectMenu.js"
import {addComponentMenuItems} from "./componentUtils.js"
import DataDisplayWrapper from "/apogeejs-app-bundle/src/componentdisplay/DataDisplayWrapper.js"

export function ComponentCell({apogeeView,component,showing}) {

    const viewModes = component.getComponentConfig().viewModes
    const [openedViews,setOpenedViews] = React.useState(() => viewModes.map(viewModeInfo => viewModeInfo.isActive))

    //need to work out how I want to do the styling
    const bannerVisible = false
    const bannerColor = ""
    const bannerBackground = ""

    return (
        <div className="visiui_pageChild_mainClass">
            <div className="visiui_pageChild_titleBarClass">
                <CellHeading component={component} />
                <DataViewControls component={component} openedViews={openedViews} setOpenedViews={setOpenedViews} />
                <span className="visiui_pageChild_cellTypeLabelClass">{component.getComponentTypeDisplayName()}</span>
            </div>
            {bannerVisible ? <div className="visiui_pageChild_bannerContainerClass" style={{color: bannerColor, backgroundColor: bannerBackground}}>{bannerContent}</div> : ''}
            <div className="visiui_pageChild_viewContainerClass" >
                {viewModes.map((viewModeInfo,index) => 
                    //using index into fixed array of view modes for key and for reference to view mode
                    openedViews[index] ? <ViewModeElement key={index} apogeeView={apogeeView} 
                        component={component} index={index} /> : ''
                )}
            </div>
        </div>
    )
}

/** This is the icon, name and properties menu */
function CellHeading({component}) {

    const text = component.getDisplayName()
    const iconUrl = component.getIconUrl()
    const status = "normal" //fix this

    // @TODO - update this (maybe just the comment) - the function hsed here comes from a global file workspaceObject.js
    let menuItems =  []
    addComponentMenuItems(menuItems,component)

    let menuImageUrl = apogeeui.uiutil.getResourcePath("/menuDots16_darkgray.png","ui-lib")

    return (
        <>
            <IconWithStatus iconSrc={iconUrl} status={status} />
            <span className="visiui_pageChild_titleBarNameClass">{text}</span>
            <SelectMenu text="Menu" image={menuImageUrl} items={menuItems} />
        </>
    )
}

/** This holds the selectors for the visible data views */
function DataViewControls({component, openedViews, setOpenedViews}) {

    const viewModes = component.getComponentConfig().viewModes

    return (
        <div className="visiui_pageChild_titleBarViewsClass">
            {viewModes.map( (viewModeInfo,index) => 
                <DataViewControl key={viewModeInfo.name} viewModeInfo={viewModeInfo} index={index} openedViews={openedViews} setOpenedViews={setOpenedViews} />
            )}
        </div>
    )
}

const VIEW_CLOSED_IMAGE_PATH = "/closed_black.png";
const VIEW_OPENED_IMAGE_PATH = "/opened_black.png";

/** This is a selector for a visible data view */
function DataViewControl({viewModeInfo, index, openedViews, setOpenedViews}) {

    const viewOpened = openedViews[index]
    const setViewOpened = opened => {
        let newOpenedViews = openedViews.slice()
        newOpenedViews[index] = opened
        setOpenedViews(newOpenedViews)
    }

    const imgSrc = viewOpened ? 
        apogeeui.uiutil.getResourcePath(VIEW_OPENED_IMAGE_PATH,"ui-lib") :       
        apogeeui.uiutil.getResourcePath(VIEW_CLOSED_IMAGE_PATH,"ui-lib") 

    const handleClick = () => setViewOpened(!viewOpened)

    //note - here I don't include wrapper div with class visiui_displayContainer_viewSelectorContainerClass, which holds hover etc

    return (
        <a className="visiui_displayContainer_viewSelectorLinkClass" onClick={handleClick}>
            <img src={imgSrc} className="visiui_displayContainer_expandContractClass" />
            <span className="visiui_displayContainer_viewSelectorClass">{viewModeInfo.label}</span>
        </a>
    )
}

function getViewCacheKey(component,index) {
    return component.getId() + "|" + index
}

function _getMsgLabel(component,viewModeInfo) {
    return `component ${component.getName()} view mode ${viewModeInfo.label} at ${Date.now() % 1000000}`
}

//DO WE WANT APOGEEVIEW OR SOME OBJECT THAT HAS NO OBSERVABLE CHANGE INTERNALLY (LIKE A CLOSURE WITH INTERNAL STATE)
function ViewModeElement({apogeeView,component,index}) {

    let [editMode,setEditMode] = React.useState(false)

    let viewModeInfo = component.getComponentConfig().viewModes[index]

    console.log('In view mode render for ' + _getMsgLabel(component,viewModeInfo))

    /////////////////////////
    //is this the right thing to do???
    let dataDisplayWrapper = apogeeView.getCacheObject(getViewCacheKey(component,index))
    if(!dataDisplayWrapper) {
        console.log('Creating display wrapper for ' + _getMsgLabel(component,viewModeInfo))
        dataDisplayWrapper = new DataDisplayWrapper(component,index)
        apogeeView.setCacheObject(getViewCacheKey(component,index),dataDisplayWrapper)
        dataDisplayWrapper.init()
        dataDisplayWrapper.showData()
    }

    dataDisplayWrapper.setEditModeState(editMode,setEditMode)
    if(dataDisplayWrapper.getComponent() != component) {
        console.log('Updating component for ' + _getMsgLabel(component,viewModeInfo))
        dataDisplayWrapper.updateComponent(component)
    }

    const msgText = dataDisplayWrapper.getMessage()
    const showMsgBar = msgText != null
    const hideDisplay = dataDisplayWrapper.getHideDisplay()

    const onSave = () => dataDisplayWrapper.save()
    const onCancel = () => dataDisplayWrapper.cancel()
    /////////////////////////////

    //add the element and clean up on destruction
    const viewRef = React.useRef()
    React.useEffect(() => {
        console.log('In use effect for ' + _getMsgLabel(component,viewModeInfo))

        viewRef.current.appendChild(dataDisplayWrapper.getElement())
        dataDisplayWrapper.onLoad()

        //cleanup function
        return () => {
            console.log('In use effect cleanup for ' + _getMsgLabel(component,viewModeInfo))

            //figure out how this should work - load unload
            dataDisplayWrapper.onUnload()

            dataDisplayWrapper.destroy()
            apogeeView.clearCacheObject(getViewCacheKey(component,index))
        }

    },[])
    
    //note - does this manage it correctly, or should we just se display none it if it is not showing???
    return (
        <div className="visiui_displayContainerClass_mainClass">
            <div>{viewModeInfo.label}</div>
            {showMsgBar ? <div>{msgText}</div> : ''}
            {editMode ?
                <div>
                    <button type="button" onClick={onSave}>Save</button>
                    <button type="button" onClick={onCancel}>Cancel</button>
                </div> : ''}
            {hideDisplay ? '' : <div ref={viewRef} className="visiui_displayContainer_viewContainerClass"/>}
        </div>
    )
}