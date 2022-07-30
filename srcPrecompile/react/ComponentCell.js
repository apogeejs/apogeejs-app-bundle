import {IconWithStatus} from "./IconwithStatus.js"
import {SelectMenu} from "./SelectMenu.js"
import {bannerVisible,StateBanner} from "./StateBanner.js"
//oops - move this
import DATA_DISPLAY_CONSTANTS from "/apogeejs-app-lib/src/datadisplay/dataDisplayConstants.js"

export function ComponentCell({cellState,cellShowing}) {

    //LATER THIS STATE WILL BE KEPT ETERNALLY
    const [openedViews,setOpenedViews] = React.useState(() => cellState.viewModeControlStates.map(state => state.opened))

    //need to work out how I want to do the styling

    return (
        //<div key={component.getInstanceNumber()} className="visiui_pageChild_mainClass">
        <div className="visiui_pageChild_mainClass">
            <div className="visiui_pageChild_titleBarClass">
                <CellHeading label={cellState.cellData.displayName} iconSrc={cellState.cellData.iconSrc} 
                    status={cellState.cellData.status} statusMessage={cellState.cellData.statusMessage} menuItems={cellState.cellData.menuItems} />
                <DataViewControls viewModeControlStates={cellState.viewModeControlStates} openedViews={openedViews} setOpenedViews={setOpenedViews} />
                <span className="visiui_pageChild_cellTypeLabelClass">{cellState.cellData.componentTypeName}</span>
            </div>
            {bannerVisible(cellState.cellData.status) ? <StateBanner status={cellState.cellData.status} text={cellState.cellData.statusMessage} /> : ''}
            <div className="visiui_pageChild_viewContainerClass" >
                {cellState.viewModeStates.map((viewModeState,viewModeIndex) => 
                    openedViews[viewModeIndex] && (!cellState.viewModeControlStates[viewModeIndex].hidden) ? <ViewModeFrame key={viewModeIndex} componentId={cellState.cellData.id} 
                        viewModeState={viewModeState} cellShowing={cellShowing} /> : ''
                )}
            </div>
        </div>
    )
}


/** This is the icon, name and properties menu */
function CellHeading({label,iconSrc,status,statusMessage,menuItems}) {
    let menuImageUrl = apogeeui.uiutil.getResourcePath("/menuDots16_darkgray.png","ui-lib")

    return (
        <>
            <IconWithStatus iconSrc={iconSrc} status={status} />
            <span className="visiui_pageChild_titleBarNameClass">{label}</span>
            <SelectMenu text="Menu" image={menuImageUrl} items={menuItems} />
        </>
    )
}

/** This holds the selectors for the visible data views */
function DataViewControls({viewModeControlStates, openedViews, setOpenedViews}) {

    return (
        <div className="visiui_pageChild_titleBarViewsClass">
            {viewModeControlStates.map( (state,viewModeIndex) => state.hidden ? '' : <DataViewControl key={state.name} label={state.name}  
                    style={state.style} viewModeIndex={viewModeIndex} openedViews={openedViews} setOpenedViews={setOpenedViews} />
            )}
        </div>
    )
}

const VIEW_CLOSED_IMAGE_PATH = "/closed_black.png";
const VIEW_OPENED_IMAGE_PATH = "/opened_black.png";

/** This is a selector for a visible data view */
function DataViewControl({label, style, viewModeIndex, openedViews, setOpenedViews}) {

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
            <span className="visiui_displayContainer_viewSelectorClass" style={style}>{label}</span>
        </a>
    )
}


/** This is the container for the display element provided by the view mode */
function ViewModeFrame({componentId,viewModeState,cellShowing}) {

    let viewModeInfo = viewModeState.viewModeInfo
    let sourceState = viewModeState.sourceState

    const [editModeData,setEditModeData] = React.useState(null) //set to null or {data: data} or {getData: getData}
    const [verticalSize,setVerticalSize] = React.useState(null)
    const inEditMode = editModeData ? true : false

    const showMsg = (sourceState.messageType)&&(sourceState.messageType != DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE)
    const msgBarStyle = showMsg ? getMessageBarStyle(sourceState.messageType) : null

    const onSave = () =>  {
        if(sourceState.save) {
            let data
            if(editModeData.data) {
                data = editModeData.data
            } 
            else if(editModeData.getData) {
                data = editModeData.getData()
            }
            else {
                //no data - save not possible
                return
            }
            let success = sourceState.save(data)
        }
        setEditModeData(null) //end edit mode
    }
    const onCancel = () => setEditModeData(null)

    return (
        <div className="visiui_displayContainerClass_mainClass">
            <div>
                <div className="visiui_displayContainer_viewHeadingClass visiui_hideSelection">{viewModeInfo.label}</div>
                {viewModeInfo.sizeCommandData ? <div className="visiui_displayContainer_viewSizingElementClass">
                    <ViewSizeElement sizeCommandData={viewModeInfo.sizeCommandData} size={verticalSize} setSize={setVerticalSize} />
                </div> : ''}
                {viewModeInfo.getViewStatusElement ? 
                    <div className="visiui_displayContainer_viewDisplayBarClass">
                        {viewModeInfo.getViewStatusElement(sourceState.statusState)}
                    </div> : ''
                }
            </div>
            { showMsg ? <div className={msgBarStyle} >{sourceState.message}</div> : ''}
            { editModeData ?
                <div className="visiui_displayContainer_saveBarContainerClass">
                    Edit: 
                    <button type="button" onClick={onSave}>Save</button>
                    <button  type="button" onClick={onCancel}>Cancel</button>
                </div> : ''}
            {viewModeInfo.getViewModeElement(sourceState,inEditMode,setEditModeData,verticalSize,cellShowing)}
        </div>
    )
}


function ViewSizeElement({sizeCommandData,size,setSize}) {
    
    let baseSize = (size === null) ? sizeCommandData.default : size 

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