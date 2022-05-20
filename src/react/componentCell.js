
function getComponentCell(apogeeView,component,showing,moduleHelper) {
    return <ComponentCell key={component.getId()} apogeeView={apogeeView} component={component} moduleHelper={moduleHelper}/>
}

function ComponentCell({apogeeView,component,moduleHelper}) {

    const viewModes = component.getComponentConfig().viewModes
    const [openedViews,setOpenedViews] = React.useState(() => viewModes.map(viewModeInfo => viewModeInfo.isActive))

    //need to work out how I want to do the styling
    const bannerVisible = false
    const bannerColor = ""
    const bannerBackground = ""

    return (
        <div className="visiui_pageChild_mainClass">
            <div className="visiui_pageChild_titleBarClass">
                <CellHeading component={component} moduleHelper={moduleHelper} />
                <DataViewControls component={component} openedViews={openedViews} setOpenedViews={setOpenedViews} />
                <span className="visiui_pageChild_cellTypeLabelClass">{component.getComponentTypeDisplayName()}</span>
            </div>
            {bannerVisible ? <div className="visiui_pageChild_bannerContainerClass" style={{color: bannerColor, backgroundColor: bannerBackground}}>{bannerContent}</div> : ''}
            <div className="visiui_pageChild_viewContainerClass" >
                {viewModes.map((viewModeInfo,index) => 
                    //using index into fixed array of view modes for key and for reference to view mode
                    openedViews[index] ? <ViewModeElement key={index} apogeeView={apogeeView} 
                        component={component} index={index} moduleHelper={moduleHelper} /> : ''
                )}
            </div>
        </div>
    )
}

/** This is the icon, name and properties menu */
function CellHeading({component, moduleHelper}) {

    const text = component.getDisplayName()
    const iconUrl = component.getIconUrl()
    const status = "normal" //fix this

    // @TODO - update this (maybe just the comment) - the function hsed here comes from a global file workspaceObject.js
    let menuItems =  []
    moduleHelper.addComponentMenuItems(menuItems,component)

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
    const setViewOpened = () => {
        let newOpenedViews = openedViews.slice()
        newOpenedViews[index] = !openedViews[index]
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

//DO WE WANT APOGEEVIEW OR SOME OBJECT THAT HAS NO OBSERVABLE CHANGE INTERNALLY (LIKE A CLOSURE WITH INTERNAL STATE)
function ViewModeElement({apogeeView,component,index,moduleHelper}) {

    let [editMode,setEditMode] = React.useState(false)

    /////////////////////////
    //is this the right thing to do???
    let dataDisplayWrapper = apogeeView.getCacheObject(component.getId())
    if(!dataDisplayWrapper) {
        dataDisplayWrapper = moduleHelper.getDataDisplayWrapper(component,index)
        apogeeView.setCacheObject(component.getId(),dataDisplayWrapper)
        dataDisplayWrapper.init()
    }

    dataDisplayWrapper.setEditModeState(editMode,setEditMode)
    if(dataDisplayWrapper.getComponent() != component) {
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
        viewRef.current.appendChild(dataDisplayWrapper.getElement())
        dataDisplayWrapper.onLoad()

        //cleanup function
        return () => {
            //figure out how this should work - load unload
            dataDisplayWrapper.onUnload()

            dataDisplayWrapper.destroy()
            apogeeView.clearCachObject(component.getId())
        }

    },[])
 
    
    //note - does this manage it correctly, or should we just se display none it if it is not showing???
    return (
        <div className="visiui_displayContainerClass_mainClass">
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