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
        const appElement = <App app={this.app} workspaceManager={this.workspaceManager} />
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