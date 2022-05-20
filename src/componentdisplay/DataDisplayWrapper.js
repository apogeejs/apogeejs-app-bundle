
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

    getElement() {
        return this.dataDisplay.getContent();
    }

    init() {
        this.dataDisplay = this.viewModeInfo.getDataDisplay(this.component /*,displayContainer*/)
    }

    updateComponent(component) {
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
        this.dataDisplay.showData()
    }

    getMessage() {
        this.dataDisplay.getMessage()
    }

    getHideDisplay() {
        return this.hideDisplay()
    }


    /** This is used to pass is and clear the setEditMode function */
    setEditModeState(editMode,setEditMode) {
        this.dataDisplay.setEditModeState(editMode,setEditMode)
    }

    save() {
        this.dataDisplay.save()
    }

    cancel() {
        this.dataDisplay.cancel()
    }

    onLoad() {
        this.dataDisplay.onLoad()
    }

    onUnload() {
        this.dataDisplay.onUnload()
    }

    destroy() {
        this.dataDisplay.destroy();
        this.dataDisplahy = null;
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
        this.dataDisplay.onUnload()
        let oldContentElement = this.dataDisplay.getContent()
        if(this.dataDisplay.destroy) {
            this.dataDisplay.destroy()
        }
        this.dataDisplay = null;
        this.init()
        let newContentElement = this.dataDisplay.getContent()

        let parent = oldContent.parent
        parent.removeChild(oldContentElement)
        parent.appendChild(newContentElement)
        this.dataDisplay.onLoad();


        //reload display
        //this._updateDataDisplayLoadedState();
        this.dataDisplay.showData();
    }
}