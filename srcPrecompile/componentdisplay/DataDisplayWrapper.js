import DATA_DISPLAY_CONSTANTS from "/apogeejs-app-lib/src/datadisplay/dataDisplayConstants.js"

export function ViewModeElement({component,viewModeIndex,showing}) {

    //Store previous "showing" value (maybe in data display too?)
    let wasShowingRef = React.useRef(false)
    const madeVisible = (showing != wasShowingRef.current)
    wasShowingRef.current = showing

    //get display info
    let viewModeInfo = component.getComponentConfig().viewModes[viewModeIndex]

    //Get the mutable object for the vanilla javascript display
    let vanillaRef = React.useRef(null)
    let dataDisplay = vanillaRef.current
    if(!dataDisplay) {
        dataDisplay = viewModeInfo.getDataDisplay(component)
        dataDisplay.setComponent(component)
        vanillaRef.current = dataDisplay     
    }

    //set edit mode state
    let [editMode,setEditMode] = React.useState(false)
    dataDisplay.setEditModeState(editMode,setEditMode)

    //update if the component changes
    if(dataDisplay.getComponent() != component) { 
        dataDisplay.setComponent(component)
        let {reloadData,reloadDataDisplay,removeView} = dataDisplay.doUpdate();

        //NEED TO PUT THIS BACK IN
        //set the remove view flag
        // let removeViewBool = removeView ? true : false; //account for no removeView returned
        // if(removeViewBool != this.isViewRemoved) {
        //     this.isViewRemoved = removeViewBool;
        //     this._updateViewState();
        // }
        // else if(this.isViewRemoved) {
        //     //if we are still removed, skip further procsseing
        //     return;
        // }

        if(reloadDataDisplay) {
            //this will also reload data
            let oldContentElement = dataDisplay.getContent()
            let parent = oldContentElement.parent
            parent.removeChild(oldContentElement)

            if(dataDisplay.onUnload) dataDisplay.onUnload()
            if(dataDisplay.destroy) dataDisplay.destroy()

            dataDisplay = viewModeInfo.getDataDisplay(component)
            dataDisplay.setEditModeState(editMode,setEditMode)

            let newContentElement = dataDisplay.getContent()
            parent.appendChild(newContentElement)

            dataDisplay.onLoad()
            dataDisplay.showData()
        }
        else if(reloadData) {
            //only update data in display if we are not in edit mode
            if(!dataDisplay.isInEditMode()) {
                dataDisplay.showData()
            }
        }
    }
    else if(madeVisible) {
        //I think we need to do this because of react internal logic - refresh display if we are made visible 
        //(other wise it seems changes made while not visible are not kept)
        dataDisplay.showData()
    }

    //manage adding and removing the vanilla display element
    const viewRef = React.useRef()
    React.useEffect(() => {
        viewRef.current.appendChild(dataDisplay.getContent())
        dataDisplay.onLoad()

        //cleanup function
        return () => {
            //figure out how this should work - load unload
            if(dataDisplay.onUnload) dataDisplay.onUnload()
            if(dataDisplay.destroy) dataDisplay.destroy()
        }

    },[])
    
    //render the display
    const msgText = dataDisplay.getMessage()
    const showMsgBar = dataDisplay.getMessageType() != DATA_DISPLAY_CONSTANTS.MESSAGE_TYPE_NONE
    const hideDisplay = dataDisplay.getHideDisplay()

    const onSave = () => dataDisplay.save()
    const onCancel = () => dataDisplay.cancel()

    return (
        <div >
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

