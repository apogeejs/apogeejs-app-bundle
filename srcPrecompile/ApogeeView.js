import {closeWorkspace} from "/apogeejs-app-bundle/src/commandseq/closeworkspaceseq.js";
import {createWorkspace} from "/apogeejs-app-bundle/src/commandseq/createworkspaceseq.js";
import {openWorkspace} from "/apogeejs-app-bundle/src/commandseq/openworkspaceseq.js";
import {saveWorkspace} from "/apogeejs-app-bundle/src/commandseq/saveworkspaceseq.js";

import {showSimpleActionDialog} from "/apogeejs-ui-lib/src/apogeeUiLib.js";

import {Apogee} from "/apogeejs-app-lib/src/apogeeAppLib.js";

import {App} from "/apogeejs-app-bundle/src/react/app.js";

export default class ApogeeView {

    /** This creates the app view, which in turn creates the contained app.
     * - containerId - This is the DOM element ID in which the app view should be created. If this is set
     * to null (or other false value) the UI will not be created.
     * - appConfigManager - This is the app config managerm which defines some needed functionality. 
     */
    constructor(containerId,appConfigManager) {
        this.workspaceManager = null
        this.containerId = containerId
        this.app = new Apogee(appConfigManager)

        this._subscribeToAppEvents()

        //for react UI
        this.cacheObjects = {}
    }

    ////////////////////////////////////
    // React Version additions section
    render() {
        ReactDOM.render(<App apogeeView={this} />,document.getElementById(this.containerId))
    }

    /** @TODO I don't think the menu items are efficient. See how much overhead we have from redefining them
     * and see if it is worth making this more effiecient, such as making a single menu object that only changes
     * when the menu changes. (First, this probably doesn't matter. Second, is this even the criteria rect usees for a rerender?)
     */
    getMenuItems() {
        return [
            this._getWorkspaceMenuData(),
            this._getEditMenuData(),
            this._getAboutMenuData()
        ]
    }

    getChildren() {
        if(this.workspaceManager) {
            return [getWorkspaceViewObject(this, this.workspaceManager)]
        }
        else {
            return []
        }
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

    //-----------------
    // react-support private methods
    //-----------------

    /** This method gets the workspace menu items. This is created on the fly because the
     * items will change depending on the state of the workspace. */
    _getWorkspaceMenuData() {

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
                createWorkspace(this.app)
            }
        })

        menuItems.push({
            text: "Open",
            action: () => openWorkspace(this.app,fileAccessObject)
        })

        if(this.workspaceManager) {
            var fileMetadata = this.workspaceManager.getFileMetadata()

            if(fileAccessObject.directSaveOk(fileMetadata)) {
                menuItems.push({
                    text: "Save",
                    action: () => saveWorkspace(this.app,fileAccessObject,true)
                })
            }

            menuItems.push({
                text: "Save as",
                action: () => saveWorkspace(this.app,fileAccessObject,false)
            })
        }  

        menuItems.push({
            text: "Close",
            action: () => closeWorkspace(this.app)
        })
        
        return menuData;
    }

    /** This method gets the workspace menu items. This is created on the fly because the
     * items will change depending on the state of the workspace. */
    _getEditMenuData() {
        
        var menuItems = []
        let menuData = {
            text: "Edit",
            items: menuItems
        }

        let commandManager = this.app.getCommandManager()
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


    //end react version additions section
    /////////////////////////////

    getApp() {
        return this.app
    }

    /** This method should be implemented if custom menus or menu items are desired. 
    * @TODO needs to be reimplemented for new react menus
    //addToMenuBar(menuBar,menus);

    //==============================
    // Private Methods
    //==============================

    //---------------------------------
    // User Interface Creation Methods
    //---------------------------------

    //-----------------------------------
    // workspace event handling
    //-----------------------------------

    /** This method subscribes to workspace events to update the UI. It is called out as a separate method
     * because we must reload it each time the app is created. */
    _subscribeToAppEvents() {
        //subscribe to events
        this.app.addListener("workspaceManager_created",workspaceManager => this._onWorkspaceCreated(workspaceManager))
        this.app.addListener("workspaceManager_deleted",workspaceManager => this._onWorkspaceClosed(workspaceManager))
        this.app.addListener("workspaceManager_updated",workspaceManager => this._onWorkspaceUpdated(workspaceManager))
    }

    _onWorkspaceCreated(workspaceManager) {
        if(this.workspaceManager != null) {
            //discard an old view if there is one
            this._onWorkspaceClosed()
        }

        //create the new workspace view
        this.workspaceManager = workspaceManager

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
        this.app.subscribeToAppEvents()
        this._subscribeToAppEvents()

        //clear the cache objects
        this.cacheObjects = {}

        this.render()
    }

    _onWorkspaceUpdated(workspaceManager) {
        this.workspaceManager = workspaceManager
        this.render()
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

}

const RESIZE_TIMER_PERIOD_MS = 500

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