
export default class DataDisplayWrapper {

    constructor(component,index) {
        this.component = component
        this.index = index
        this.viewModeInfo = component.getComponentConfig().viewModes[index]

        this.dataDisplay = null;
    }

    getComponent() {
        return this.component
    }

    getDataDisplay() {
        return this.dataDisplay
    }

    getElement() {
        if(this.dataDisplay) return this.dataDisplay.getContent()
        else return null
    }

    init() {
        this.dataDisplay = this.viewModeInfo.getDataDisplay(this)
    }

    updateComponent(component) {
        if(this.component == component) return
        
        this.component = component
        if(this.dataDisplay) {

            let {reloadData,reloadDataDisplay,removeView} = this.dataDisplay.doUpdate();

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
                this._reloadDataDisplay();
            }
            else if(reloadData) {
                this._updateDataDisplay();
            }

        }

        //COPIED FROM PAGE DISPLAY CONTAINER
        //update name label on view heading if needed
        // if( (this.hasViewSourceText) && (this.mainComponentId == component.getId()) && (component.isMemberFieldUpdated("member","name"))) {
        //     this.viewSource.innerHTML = this._getViewSourceText();
        // }
    }

    showData() {
        if(this.dataDisplay) this.dataDisplay.showData()
    }

    getMessage() {
        if(this.dataDisplay) return this.dataDisplay.getMessage()
        else return ""
    }

    getHideDisplay() {
        if(this.dataDisplay) return this.dataDisplay.getHideDisplay()
        else return true
    }


    /** This is used to pass is and clear the setEditMode function */
    setEditModeState(editMode,setEditMode) {
        if(this.dataDisplay) this.dataDisplay.setEditModeState(editMode,setEditMode)
    }

    save() {
        if(this.dataDisplay) this.dataDisplay.save()
    }

    cancel() {
        if(this.dataDisplay) this.dataDisplay.cancel()
    }

    onLoad() {
        if((this.dataDisplay)&&(this.dataDisplay.onLoad)) this.dataDisplay.onLoad()
    }

    onUnload() {
        if((this.dataDisplay)&&(this.dataDisplay.onUnload)) this.dataDisplay.onUnload()
    }

    destroy() {
        if((this.dataDisplay)&&(this.dataDisplay.destroy))  this.dataDisplay.destroy();
        this.dataDisplay = null;
    }

    //=========================
    // Private Methods
    //=========================

    _updateDataDisplay() {
        //don't reload data if we are in edit mode. It will reload after completion, whether through cancel or save.
        if(this.inEditMode) return;
        this.dataDisplay.showData();
    }

    _reloadDataDisplay() {

        //put this back in?
        //update the stored UI state json
        //this.savedUiState = this.getStateJson();

        //NOTE: This is probably not optimal treatment of edit mode
        //We restrict reloading to data when we are in edit mode. Reloading of the display is not as simple 
        //as currently coded. So we will just kick the display out of edit mode.
        //It would be nive to get a better treatment 
        // if(this.inEditMode) {
        //     this.endEditMode();
        // }

        //was in page display container
        //reset any data display specific parts of the ui
        //this._cleanupDataDisplayUI();

        //this destrpys the data display, not the container - bad name
        //this._deleteDataDisplay();
        //I DON"T KNOW IF THIS IS RIGHT?? FIX IT
        let oldContentElement = this.dataDisplay.getContent()
        this.onUnload()
        this.destroy()
        this.init()
        let newContentElement = this.dataDisplay.getContent()

        let parent = oldContentElement.parent
        parent.removeChild(oldContentElement)
        parent.appendChild(newContentElement)
        this.onLoad();


        //reload display
        //this._updateDataDisplayLoadedState();
        this.showData()
    }
}