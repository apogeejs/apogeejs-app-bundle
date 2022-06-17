import {Apogee} from "/apogeejs-app-lib/src/apogeeAppLib.js";

import {AppElement} from "/apogeejs-app-bundle/src/react/app.js";

import {closeWorkspace} from "/apogeejs-app-bundle/src/commandseq/closeworkspaceseq.js";
import {createWorkspace} from "/apogeejs-app-bundle/src/commandseq/createworkspaceseq.js";
import {openWorkspace} from "/apogeejs-app-bundle/src/commandseq/openworkspaceseq.js";
import {saveWorkspace} from "/apogeejs-app-bundle/src/commandseq/saveworkspaceseq.js";

import {showSimpleActionDialog} from "/apogeejs-ui-lib/src/apogeeUiLib.js";

import {getComponentTab} from "/apogeejs-app-bundle/src/react/ComponentTab.js"


export default class ApogeeView {

    /** This creates the app view, which in turn creates the contained app.
     * - containerId - This is the DOM element ID in which the app view should be created. If this is set
     * to null (or other false value) the UI will not be created.
     * - appConfigManager - This is the app config managerm which defines some needed functionality. 
     */
    constructor(containerId) {
        this.workspaceManager = null
        this.containerId = containerId
        this.app = new Apogee(this)

        //app menu
        this.menuData = null;
        this.fileMenuData = this._getFileMenuData(this.app,this.workspaceManager)
        this.editMenuData = this._getEditMenuData(this.app)
        this.aboutMenuData = this._getAboutMenuData()
        this.packageMenuData()

        /////////////////////////////
        //view state
        this.tabDataList = []
        this.selectedTabId = null
        this.viewState = null
        this.viewStateDirty = true

        this.tabFunctions = {
            openTab: (tabId,isSelected = true) => this._openTab(tabId,isSelected),
            closeTab: (tabId) => this._closeTab(tabId),
            selectTab: (tabId) => this._selectTab(tabId)
        }
        /////////////////////////////////

        this._subscribeToAppEvents()

        //for react UI
        this.cacheObjects = {}
    }

    ////////////////////////////////////
    // React Version additions section
    render() {

        if(this.viewStateDirty) {
            this._updateViewState()
        }

        const appElement = <AppElement 
            workspaceManager={this.workspaceManager}
            menuData={this.menuData}
            viewState={this.viewState} 
        />
        ReactDOM.render(appElement,document.getElementById(this.containerId))
    }

    /** This is a lookup function for a workspace object that has a tab (it just does components now)
     * @TODO this needs to be cleaned up. This was just a temporary implementation
     */
    getTabObject(tabObjectId) {
        if(this.workspaceManager) {
            return this.workspaceManager.getModelManager().getComponentByComponentId(tabObjectId)
        }
        else {
            alert("No workspace present")
        }
    }


    //end react version additions section
    /////////////////////////////

    ////////////////////////////////
    //start view state interface

    getViewStateJson() {
        return null
        //throw new Error("implement view state accessors")
        // return {
        //     tabDataList: this.tabDataList,
        //     selectedTabId: selectedTabId
        // }
    }

    setViewStateJson(viewStateJson) {
        //throw new Error("implement view state accessors")
        // this.viewState = viewState
        // this.render()
    }

    //end view state interface
    //////////////////////////////////

    getApp() {
        return this.app
    }

    //===============================
    // Protected
    //===============================

    /** @TODO I don't think the menu items are efficient. See how much overhead we have from redefining them
         * and see if it is worth making this more effiecient, such as making a single menu object that only changes
         * when the menu changes. (First, this probably doesn't matter. Second, is this even the criteria rect usees for a rerender?)
         */
     packageMenuData() {
        this.menuData = [
            this.fileMenuData,
            this.editMenuData,
            this.aboutMenuData
        ]
    }

    //==============================
    // Private Methods
    //==============================

    //-----------------------------------
    // workspace event handling
    //-----------------------------------

    /** This method subscribes to workspace events to update the UI. It is called out as a separate method
     * because we must reload it each time the app is created. */
    _subscribeToAppEvents() {
        //workspace change events
        this.app.addListener("workspaceManager_created",workspaceManager => this._onWorkspaceCreated(workspaceManager))
        this.app.addListener("workspaceManager_deleted",workspaceManager => this._onWorkspaceClosed(workspaceManager))
        this.app.addListener("workspaceManager_updated",workspaceManager => this._onWorkspaceUpdated(workspaceManager))

        //componet update and delete - for the tab state (since only components have tabs now)
        this.app.addListener("component_deleted",component => this._onComponentDeleted(component))
        this.app.addListener("component_updated",component => this._onComponentUpdated(component))
    }

    _onWorkspaceCreated(workspaceManager) {
        if(this.workspaceManager != null) {
            //discard an old view if there is one
            this._onWorkspaceClosed()
        }

        //create the new workspace view
        this.workspaceManager = workspaceManager

        this._updateFileMenu()

        this.render()
    }

    _onWorkspaceClosed(workspaceManager) {

        //rather than rely on people to clear their own workspace handlers from the app
        //I clear them all here
        //I haven't decided the best way to do this. In the app? Here? I see problems
        //with all of them.
        //for now I clear all here and then resubscribe to events here and in the app, since those
        //objects live on.
        this.app.clearListenersAndHandlers()
        this._subscribeToAppEvents()

        //clear the cache objects
        this.cacheObjects = {}

        this._updateFileMenu()

        this.render()
    }

    _onWorkspaceUpdated(workspaceManager) {
        this.workspaceManager = workspaceManager

        //update menu if the file metadata changed
        //(we may want to make the menu depend on the is dirty flag too)
        if(workspaceManager.isFieldUpdated("fileMetadata")) {
            this._updateFileMenu()
        }

        this.render()
    }

    _onComponentUpdated(component) {
        let index = this.tabDataList.findIndex(tabDataObject => tabDataObject.tabObject.getId() == component.getId())
        if(index >= 0) {
            //replace the component of the old entry with the new component
            const newTabDataList = this.tabDataList.map( (listTabDataObject,listIndex) => {
                if(listIndex == index) return this._getComponentTabDataObject(component,listTabDataObject)
                else return listTabDataObject
            })
            
            this.tabDataList = newTabDataList
            this.viewStateDirty = true
        }

        this.render()
        
    }

    _onComponentDeleted(component) {
        if(this.tabDataList.find(tabDataObject => tabDataObject.tabObject.getId() == component.getId())) {
            this._closeTab(component.getId())
        }
    }

    
    //---------------------------------
    // Menu Bar
    //---------------------------------

    /** This should be called when the workspace is created or deleted. */
    _updateFileMenu() {
        this.fileMenuData = this._getFileMenuData(this.app,this.workspaceManager)
        this.packageMenuData()
    }

    /** This method gets the workspace menu items. */
    _getFileMenuData(app,workspaceManager) {

        let menuItems = [];
        let menuData = {
            text: "File",
            items: menuItems
        }

        let fileAccessObject = apogeeplatform.getFileAccessObject()

        menuItems.push({
            text: "New",
            action: () => {
                console.log("In create workspace!")
                createWorkspace(app)
            }
        })

        menuItems.push({
            text: "Open",
            action: () => openWorkspace(app,fileAccessObject)
        })

        if(workspaceManager) {
            var fileMetadata = workspaceManager.getFileMetadata()

            if(fileAccessObject.directSaveOk(fileMetadata)) {
                menuItems.push({
                    text: "Save",
                    action: () => saveWorkspace(app,fileAccessObject,true)
                })
            }

            menuItems.push({
                text: "Save as",
                action: () => saveWorkspace(app,fileAccessObject,false)
            })
        }  

        menuItems.push({
            text: "Close",
            action: () => closeWorkspace(app)
        })
        
        return menuData;
    }

    /** This method gets the workspace menu items. */
    _getEditMenuData(app) {
        
        var menuItems = []
        let menuData = {
            text: "Edit",
            items: menuItems
        }

        let commandManager = app.getCommandManager()
        let commandHistory = commandManager.getCommandHistory()
        
        //populate the undo menu item
        var undoLabel
        var undoCallback
        var nextUndoDesc = commandHistory.getNextUndoDesc()
        if(nextUndoDesc === null) {
            undoLabel = "-no undo-"
            undoCallback = null
        }
        else {
            if(nextUndoDesc == "") {
                undoLabel = "Undo"
            }
            else {
                undoLabel = "Undo: " + nextUndoDesc
            }
            undoCallback = () => commandHistory.undo()
        }

        menuItems.push({
            text: undoLabel,
            action: undoCallback
        })
        
        //populate the redo menu item
        var redoLabel;
        var redoCallback;
        var nextRedoDesc = commandHistory.getNextRedoDesc()
        if(nextRedoDesc === null) {
            redoLabel = "-no redo-"
            redoCallback = null;
        }
        else {
            if(nextRedoDesc == "") {
                redoLabel = "Redo"
            }
            else {
                redoLabel = "Redo: " + nextRedoDesc;
            }
            redoCallback = () => commandHistory.redo()
        }
        menuItems.push({
            text: redoLabel,
            action: redoCallback
        })
        
        return menuData;
    }

    _getAboutMenuData() {
        return {
            text: "About",
            items: [
                {
                    text: "Apogee Help",
                    action: helpCallback
                },
                {
                    text: "About",
                    action: aboutCallback
                }
            ] 
        }
    }


    //---------------------------------
    // Width resize events - for tab frame and tree frame
    //---------------------------------

    /** @TODO need to reimplement resize for the tab/cells!!! */

    _onSplitPaneResize() {
        this._triggerResizeWait()
    }

    _onWindowResize() {
        this._triggerResizeWait()
    }

    _triggerResizeWait() {
        //only do the slow resizde timer if we have listeners
        if(!this.app.hasListeners("frameWidthResize")) return

        //create a new timer if we don't already have one
        if(!this.resizeWaitTimer) {
            this.resizeWaitTimer =  setTimeout(() => this._resizeTimerExpired(),RESIZE_TIMER_PERIOD_MS)
        }
    }

    _resizeTimerExpired() {
        this.resizeWaitTimer = null
        this.app.dispatchEvent("frameWidthResize",null)
    }

    //====================================
    // UI state managements
    //====================================

    _openTab(tabId,selectTab,supressRerender) {
        let changeMade = false

        if(!this.tabDataList.find(tabDataObject => tabDataObject.tabObject.getId() == tabId)) {
            let tabObject = this.getTabObject(tabId)
            if(tabObject) {
                //update the tab data list
                const newTabDataList = this.tabDataList.concat(this._getComponentTabDataObject(tabObject))
                this.tabDataList = newTabDataList

                changeMade = true
            }
        }

        if((selectTab)&&(this.selectedTabId != tabId)) {
            this.selectedTabId = tabId
            
            changeMade = true
        }

        if((changeMade)&&(!supressRerender)) {
            this.viewStateDirty = true
            this.render()
        } 
    }

    _closeTab(tabId,supressRerender) {
        let changeMade = false

        const newTabDataList = this.tabDataList.filter(tabDataObject => tabDataObject.tabObject.getId() != tabId)
        if(newTabDataList.length != this.tabDataList.length) {
            //update the tab data list
            this.tabDataList = newTabDataList
            
            changeMade = true
        }

        if(tabId == this.selectedTabId) {
            if(this.tabDataList.length > 0) this.selectedTabId = this.tabDataList[0].tabObject.getId()
            
            changeMade = true
        }
        else {
            this.selectedTabId = INVALID_OBJECT_ID

            changeMade = true
        }

        if((changeMade)&&(!supressRerender)) {
            this.viewStateDirty = true
            this.render()
        } 
    }

    _selectTab(tabId,supressRerender) {
        let changeMade = false

        if((tabId != this.selectedTabId)&&(this.tabDataList.find(tabDataObject => tabDataObject.tabObject.getId() == tabId))) {
            this.selectedTabId = tabId

            changeMade = true
        }

        if((changeMade)&&(!supressRerender)) {
            this.viewStateDirty = true
            this.render()
        }    
    }

    _updateViewState() {
        this.viewState = {
            tabDataList: this.tabDataList,
            selectedTabId: this.selectedTabId,
            tabFunctions: this.tabFunctions
        }

        this.viewStateDirty = false
    }

    _getComponentTabDataObject(component,oldTabDataObject) {
        //if we have ui state we need to include it in the new object)
        const tabDataObject = {
            tabObject: component,
            getTabElement: getComponentTab
        }
        return tabDataObject
    }

}


const INVALID_OBJECT_ID = 0

const RESIZE_TIMER_PERIOD_MS = 500


//===================
// Callbacks for menu actions
//===================

function helpCallback() {
    let title = "Apogee Help"
    let message;
    //if we are in a browser, allow the user to open the link. Otherwise just print it.
    if(__browser__) {
        message = 'For help, please go to the website: <a href="https://www.apogeejs.com" target="_blank">https://www.apogeejs.com</a>'
    }
    else {
        message = 'For help, please go to the website: <b>https://www.apogeejs.com</b>'
    }
    showSimpleActionDialog(title,message,["OK"])
}

function aboutCallback() {
    let title = "Apogee Programming Environment"
    let message = "Version: " + __apogee_version__
    showSimpleActionDialog(title,message,["OK"])
}