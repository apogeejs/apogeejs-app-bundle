import {Apogee} from "/apogeejs-app-lib/src/apogeeAppLib.js"
import FieldObject from "/apogeejs-base-lib/src/FieldObject.js"

import {AppElement} from "/apogeejs-app-bundle/src/react/App.js"

import {getViewManagerByObject} from "/apogeejs-app-bundle/src/viewmanager/getViewManager.js"
import MenuStateManager from "/apogeejs-app-bundle/src/viewmanager/MenuStateManager.js"
import TreeStateManager from "/apogeejs-app-bundle/src/viewmanager/TreeStateManager.js"
import TabListStateManager from "/apogeejs-app-bundle/src/viewmanager/TabListStateManager.js"

import { addComponent } from "/apogeejs-app-bundle/src/commandseq/addcomponentseq.js"
import { updateComponentProperties } from "/apogeejs-app-bundle/src/commandseq/updatecomponentseq.js"
import { deleteComponent } from "/apogeejs-app-bundle/src/commandseq/deletecomponentseq.js"
import {updateWorkspaceProperties} from "/apogeejs-app-bundle/src/commandseq/updateworkspaceseq.js"
//import {componentInfo} from "/apogeejs-app-lib/src/apogeeAppLib.js"


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

   
        this.menuStateManager = new MenuStateManager(this.app,this.workspaceManager)
        this.treeStateManager = new TreeStateManager(this)
        this.tabListStateManager = new TabListStateManager(this)

        this._subscribeToAppEvents()
    }

    getApp() {
        return this.app
    }

    /** This is a lookup function for a workspace objectd by id */
    getWorkspaceObject(objectId) {
        let fieldObjectType = FieldObject.getTypeFromId(objectId)
        switch(fieldObjectType) {
            case "workspaceManager":
                return objectId == this.workspaceManager.getId() ? this.workspaceManager : null

            case "modelManager":
                {
                    let modelManager = this.workspaceManager.getModelManager()
                    return objectId == modelManager.getId() ? modelManager : null
                }

            case "component":
                {
                    let modelManager = this.workspaceManager.getModelManager()
                    return modelManager.getComponentByComponentId(objectId)
                }

            case "referenceManager":
                {
                    let referenceManager = this.workspaceManager.getReferenceManager()
                    return objectId == referenceManager.getId() ? referenceManager : null
                }

            case "referenceList":
                {
                    let referenceManager = this.workspaceManager.getReferenceManager()
                    return referenceManager.getReferenceListById(objectId)
                }

            case "referenceEntry":
                {
                    let referenceManager = this.workspaceManager.getReferenceManager()
                    return referenceManager.getReferenceEntryById(objectId)
                }

            default:
                return null
        }

    }

    getWorkspaceManager() {
        return this.workspaceManager
    }

    getTabListStateManager() {
        return this.tabListStateManager
    }

    getTreeStateManager() {
        return this.treeStateManager
    }

    getMenuStateManager() {
        return this.menuStateManager
    }


    render() {
        const appElement = <AppElement 
            workspaceTreeState={this.treeStateManager.getState()}
            menuData={this.menuStateManager.getState()}
            tabListState={this.tabListStateManager.getState()} 
        />

        ReactDOM.render(appElement,document.getElementById(this.containerId))
    }

    //////////////////////////////////////////
    // app state callback functions

    addComponent(componentConfig,parentMemberId) {
        let initialValues = parentMemberId? {parentId:parentMemberId} : {}
        addComponent(this.app,componentConfig,initialValues)
    }

    updateComponentProperties(componentId) {
        let component = this.getWorkspaceObject(componentId)
        updateComponentProperties(component)
    }

    deleteComponent(componentId) {
        let component = this.getWorkspaceObject(componentId)
        deleteComponent(component)
    }

    editWorkspaceProperties() {
        updateWorkspaceProperties(this.workspaceManager)
    }

    addLink(referenceType,addPropConfig) {
        addLinkSeq(this.app,referenceType,addPropConfig)
    }

    editRefEntryProperties(referenceEntryId,editPropConfig) {
        let referenceEntry = this.getWorkspaceObject(referenceEntryId)
        updateLinkSeq(this.app,referenceEntry,entryConfig.referenceType,updatePropConfig)
    }

    deleteRefEntry(referenceEntryId,deleteMsg) {
        let referenceEntry = this.getWorkspaceObject(referenceEntryId)
        removeLinkSeq(this.app,referenceEntry,deleteMsg)
    }

    manageModules() {
        this.app.openModuleManager()
    }

    //end app state callback functions
    //////////////////////////////

    //////////////////////////////
    // start ui state callback functions

    openTab(componentId) {
        this.tabListStateManager.openTab(componentId)
    }

    setTabState(tabId,tabState) {
        this.tabListStateManager.setTabState(tabId,tabState)
        this.render()
    }

    //end UI state callback functions
    ///////////////////////////////////////

    //-------------------------------------
    //Serialization
    //-------------------------------------

    /** This retrieves the json to serielize the ui state */
    getViewStateJson() {     
        let viewStateJson = {}     
        //----------------------
        // get the workspace object state json
        //----------------------  
        if(this.workspaceManager) {
            let objectViewStateJson = {}

            let objectMgrJsonMap = {
                tree: this.treeStateManager.getStateJson()
            }

            this._packObjectViewStateJson(this.workspaceManager,objectMgrJsonMap,objectViewStateJson)

            viewStateJson["objects"] = objectViewStateJson
        }

        //-------------------------
        // get the tab list state json
        //--------------------------
        viewStateJson.tabList = this.tabListStateManager.getStateJson()

        return viewStateJson
    }

    _packObjectViewStateJson(workspaceObject,objectMgrJsonMap,objectViewStateJson) {
        let outputJson = {}

        //get the state json for this workspace object
        let stateJson = {}
        //the key represents the state managers (tab, tree, etc) There is a state for each
        for(let mgrKey in objectMgrJsonMap) {
            let partialJson = objectMgrJsonMap[mgrKey][workspaceObject.getId()]
            if(partialJson) {
                stateJson[mgrKey] = partialJson
            }
        }
        if(_.size(stateJson) > 0) outputJson.state = stateJson

        //get the child state jsons for this workspace object
        let viewManager = getViewManagerByObject(workspaceObject)
        let children = viewManager.getChildren(this.workspaceManager,workspaceObject)
        if(children) {
            let childrenJson = {}
            children.forEach(childObject => {
                this._packObjectViewStateJson(childObject,objectMgrJsonMap,childrenJson)
            })
            if(_.size(childrenJson) > 0) {
                outputJson.children = childrenJson
            }
        }

        if(_.size(outputJson) > 0) {
            let objectKey = viewManager.getLabel(workspaceObject)
            objectViewStateJson[objectKey] = outputJson
        }            
    }

    /** This method deserializes the view state. It should be called after the workspace is fully loaded. */
    setViewStateJson(viewJson) {
        //--------------------------------------
        //convert the json state for the objects
        //--------------------------------------
        let objectMgrJsonMap = {
            tree: {}
        }
        if(this.workspaceManager && viewJson.objects) {
            this._unpackObjectViewStateJson(this.workspaceManager,viewJson.objects,objectMgrJsonMap)
        }
        //pass it to the state managers
        this.treeStateManager.setStateJson(objectMgrJsonMap.tree)

        //-----------------------------------------------
        //get the json state for the tab list (top level)
        //-----------------------------------------------
        if(viewJson.tabList) {
            this.tabListStateManager.setStateJson(viewJson.tabList)
        }

        //render
        this.render()
    }

    _unpackObjectViewStateJson(workspaceObject,objectMapViewJson,objectMgrJsonMap) {
        let viewManager = getViewManagerByObject(workspaceObject)
        let label = viewManager.getLabel(workspaceObject) 
        let objectViewJson = objectMapViewJson[label]
        if(objectViewJson) {
            if(objectViewJson.state) {
                for(let key in objectMgrJsonMap) {
                    if(objectViewJson.state[key]) {
                        objectMgrJsonMap[key][workspaceObject.getId()] = objectViewJson.state[key]
                    }
                }
            }

            let childObjects = viewManager.getChildren(this.workspaceManager,workspaceObject)
            if(childObjects && objectViewJson.children) {
                childObjects.forEach(childObject => {
                    this._unpackObjectViewStateJson(childObject,objectViewJson.children,objectMgrJsonMap)
                })
            }
        }
    }

    //----
    //(end serialization)
    //----

    //===============================
    // Protected
    //===============================

  
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

        this.app.addListener("update_completed",() => this._updateCompleted())
    }

    _updateCompleted() {
        this.treeStateManager.updateState()
        this.tabListStateManager.updateState()

        this.render()
    }

    _onWorkspaceCreated(workspaceManager) {
        if(this.workspaceManager != null) {
            //discard an old view if there is one
            this._onWorkspaceClosed()
        }

        //create the new workspace view
        this.workspaceManager = workspaceManager

        this.menuStateManager.updateState(this.app,this.workspaceManager)
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

        this.menuStateManager.updateState(this.app,null)
    }

    _onWorkspaceUpdated(workspaceManager) {
        this.workspaceManager = workspaceManager

        //update menu if the file metadata changed
        //(we may want to make the menu depend on the is dirty flag too)
        if(workspaceManager.isFieldUpdated("fileMetadata")) {
            this.menuStateManager.updateState(this.app,null)
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

}



const RESIZE_TIMER_PERIOD_MS = 500


