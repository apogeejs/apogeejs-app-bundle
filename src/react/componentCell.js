
function getComponentCell(componentView) {
    return <ComponentCell key={componentView.getId()} componentView={componentView} />
}

function ComponentCell({componentView}) {

    const viewModes = componentView.getViewModeEntries();
    const [openedViews,setOpenedViews] = React.useState(() => componentView.getDefaultOpenedViews())

    //need to work out how I want to do the styling
    const bannerVisible = false
    const bannerColor = ""
    const bannerBackground = ""

    return (
        <div className="visiui_pageChild_mainClass">
            <div className="visiui_pageChild_titleBarClass">
                <CellHeading componentView={componentView} />
                <DataViewControls componentView={componentView} openedViews={openedViews} setOpenedViews={setOpenedViews} />
                <span className="visiui_pageChild_cellTypeLabelClass">{componentView.getComponent().getComponentTypeDisplayName()}</span>
            </div>
            {bannerVisible ? <div className="visiui_pageChild_bannerContainerClass" style={{color: bannerColor, backgroundColor: bannerBackground}}>{bannerContent}</div> : ''}
            <div className="visiui_pageChild_viewContainerClass" >
                {viewModes.map((viewModeInfo,index) => 
                    openedViews[index] ? <ViewModeElement key={index} componentView={componentView} index={index}/> : ''
                )}
            </div>
        </div>
    )
}

/** This is the icon, name and properties menu */
function CellHeading({componentView}) {
    let menuImageUrl = apogeeui.uiutil.getResourcePath("/menuDots16_darkgray.png","ui-lib")

    return (
        <>
            <IconWithStatus iconObject={componentView} />
            <span className="visiui_pageChild_titleBarNameClass">{componentView.getDisplayName()}</span>
            <SelectMenu text="Menu" image={menuImageUrl} items={componentView.getMenuItems()} />
        </>
    )
}

/** This holds the selectors for the visible data views */
function DataViewControls({componentView, openedViews, setOpenedViews}) {

    const viewModes = componentView.getViewModeEntries();

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

function ViewModeElement({componentView,index}) {

    let dataDisplay = componentView.getDataDisplay(index)

    let [editMode,setEditMode] = React.useState(false)
    dataDisplay.setEditModeState(editMode,setEditMode)

    const viewRef = React.useRef();
    React.useEffect(() => {

        //we need to add the getElement member - now it goes to data container instead
        //I think we don't need to empthy the ref element because it was just created.
        viewRef.current.appendChild(dataDisplay.getContent())
        dataDisplay.onLoad()
        dataDisplay.showData()

        //cleanup function
        return () => {
            //I don't check if this is correct
            dataDisplay.setEditModeState(false,undefined)

            //here we get rid of the cached element
            componentView.closeDataDisplay(index)
        }
    },[])

    const msgText = dataDisplay.getMessage()
    const showMsgBar = msgText != null
    const hideDisplay = dataDisplay.getHideDisplay()

    const onSave = () => dataDisplay.save()
    const onCancel = () => dataDisplay.cancel()
    
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