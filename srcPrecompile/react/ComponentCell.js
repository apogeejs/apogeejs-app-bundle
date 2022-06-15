import {IconWithStatus} from "./IconwithStatus.js"
import {SelectMenu} from "./SelectMenu.js"
import {addComponentMenuItems} from "./componentUtils.js"
import {bannerVisible,StateBanner} from "./StateBanner.js"
//oops - move this
import DATA_DISPLAY_CONSTANTS from "/apogeejs-app-lib/src/datadisplay/dataDisplayConstants.js"

export function ComponentCell({component,showing}) {

    const viewModes = component.getComponentConfig().viewModes
    const [openedViews,setOpenedViews] = React.useState(() => viewModes.map(viewModeInfo => viewModeInfo.isActive))

    //need to work out how I want to do the styling

    return (
        //<div key={component.getInstanceNumber()} className="visiui_pageChild_mainClass">
        <div className="visiui_pageChild_mainClass">
            <div className="visiui_pageChild_titleBarClass">
                <CellHeading component={component} />
                <DataViewControls component={component} openedViews={openedViews} setOpenedViews={setOpenedViews} />
                <span className="visiui_pageChild_cellTypeLabelClass">{component.getComponentTypeDisplayName()}</span>
            </div>
            {bannerVisible(component) ? <StateBanner component={component} /> : ''}
            <div className="visiui_pageChild_viewContainerClass" >
                {viewModes.map((viewModeInfo,viewModeIndex) => 
                    openedViews[viewModeIndex] ? <ViewModeFrame key={viewModeIndex} component={component} viewModeIndex={viewModeIndex} showing={showing} /> : ''
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

    //function to check if view mode should be removed
    const showViewTab = (viewModeInfo) => viewModeInfo.isViewRemoved ? !viewModeInfo.isViewRemoved(component) : true

    return (
        <div className="visiui_pageChild_titleBarViewsClass">
            {viewModes.map( (viewModeInfo,viewModeIndex) => 
                showViewTab(viewModeInfo) ? <DataViewControl key={viewModeInfo.name} viewModeInfo={viewModeInfo} 
                    viewModeIndex={viewModeIndex} openedViews={openedViews} setOpenedViews={setOpenedViews} /> : ''
            )}
        </div>
    )
}

const VIEW_CLOSED_IMAGE_PATH = "/closed_black.png";
const VIEW_OPENED_IMAGE_PATH = "/opened_black.png";

/** This is a selector for a visible data view */
function DataViewControl({viewModeInfo, viewModeIndex, openedViews, setOpenedViews}) {

    const viewOpened = openedViews[viewModeIndex]
    const setViewOpened = opened => {
        let newOpenedViews = openedViews.slice()
        newOpenedViews[viewModeIndex] = opened
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



function ViewModeFrame({component,viewModeIndex,showing}) {
    let viewModeInfo = component.getComponentConfig().viewModes[viewModeIndex]

    const [editModeData,setEditModeData] = React.useState(null)
    const [msgData,setMsgData] = React.useState(null)
    const [verticalSize,setVerticalSize] = React.useState(null)
    const [sizeCommandData,setSizeCommandData] = React.useState(null)

    const showMsg = (msgData)&&(msgData.type != DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE)
    const msgBarStyle = showMsg ? getMessageBarStyle(msgData.type) : null

    const onSave = () => editModeData.save ? editModeData.save() : null
    const onCancel = () => editModeData.cancel ? editModeData.cancel() : null

    return (
        <div className="visiui_displayContainerClass_mainClass">
            <div>
                <div className="visiui_displayContainer_viewHeadingClass visiui_hideSelection">{viewModeInfo.label}</div>
                {sizeCommandData ? <div className="visiui_displayContainer_viewSizingElementClass">
                    <ViewSizeElement sizeCommandData={sizeCommandData} size={verticalSize} setSize={setVerticalSize} />
                </div> : ''}
                {viewModeInfo.getViewStatusElement ? 
                    <div className="visiui_displayContainer_viewDisplayBarClass">
                        {viewModeInfo.getViewStatusElement(component)}
                    </div> : ''
                }
            </div>
            { showMsg ? <div className={msgBarStyle} >{msgData.msg}</div> : ''}
            { editModeData ?
                <div className="visiui_displayContainer_saveBarContainerClass">
                    Edit: 
                    <button type="button" onClick={onSave}>Save</button>
                    <button  type="button" onClick={onCancel}>Cancel</button>
                </div> : ''}
            {viewModeInfo.getViewModeElement(component,showing,setEditModeData,setMsgData,verticalSize,setSizeCommandData)}
        </div>
    )
}


function ViewSizeElement({sizeCommandData,size,setSize}) {
    
    let baseSize = (size === null) ? sizeCommandData.previous : size 

    const onSmaller = () => {
        let newSize = baseSize - sizeCommandData.increment
        if(newSize < sizeCommandData.min) newSize = settings.min
        setSize(newSize)
        console.log("new size = " + newSize)
    }

    const onBigger = () => {
        let newSize = baseSize + sizeCommandData.increment
        if(newSize > sizeCommandData.max) newSize = sizeCommandData.max
        setSize(newSize)
        console.log("new size = " + newSize)
    }

    const lessDisabled = baseSize <= sizeCommandData.min
    const moreDisabled = baseSize >= sizeCommandData.max
    const lessClassName = lessDisabled ? "visiui_displayContainer_disabledViewDisplaySizeButtonClass" : "visiui_displayContainer_viewDisplaySizeButtonClass"
    const moreClassName = moreDisabled ? "visiui_displayContainer_disabledViewDisplaySizeButtonClass" : "visiui_displayContainer_viewDisplaySizeButtonClass"

    return <div>
        <button className={lessClassName} type="button" disabled={lessDisabled} onClick={onSmaller}>less</button>
        <button className={moreClassName} type="button" disabled={moreDisabled} onClick={onBigger}>more</button>
    </div>
}


function getMessageBarStyle(messageType) {

    switch(messageType) {
        case DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_ERROR:
            return "visiui_displayContainer_messageContainerClass visiui_displayContainer_messageError"

        case DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_WARNING:
            return "visiui_displayContainer_messageContainerClass visiui_displayContainer_messageWarning"

        case DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_INFO:
            return "visiui_displayContainer_messageContainerClass visiui_displayContainer_messageInfo"

        case DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE:
        default:
            return "visiui_displayContainer_messageContainerClass"
    }
}