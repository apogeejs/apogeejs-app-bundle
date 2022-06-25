import {Apogee} from "/apogeejs-app-lib/src/apogeeAppLib.js"

import {AppElement} from "/apogeejs-app-bundle/src/react/App.js"

import workspaceManagerHelper from "/apogeejs-app-bundle/src/viewHelper/workspaceManagerHelper.js"
import modelManagerHelper from "/apogeejs-app-bundle/src/viewHelper/modelManagerHelper.js"
import componentHelper from "/apogeejs-app-bundle/src/viewHelper/componentHelper.js"
import referenceManagerHelper from "/apogeejs-app-bundle/src/viewHelper/referenceManagerHelper.js"
import {referenceEntryHelper, referenceListHelper} from "/apogeejs-app-bundle/src/viewHelper/referenceTypeHelper.js"

import {closeWorkspace} from "/apogeejs-app-bundle/src/commandseq/closeworkspaceseq.js"
import {createWorkspace} from "/apogeejs-app-bundle/src/commandseq/createworkspaceseq.js"
import {openWorkspace} from "/apogeejs-app-bundle/src/commandseq/openworkspaceseq.js"
import {saveWorkspace} from "/apogeejs-app-bundle/src/commandseq/saveworkspaceseq.js"

import { addComponent } from "/apogeejs-app-bundle/src/commandseq/addcomponentseq.js"
import { updateComponentProperties } from "/apogeejs-app-bundle/src/commandseq/updatecomponentseq.js"
import { deleteComponent } from "/apogeejs-app-bundle/src/commandseq/deletecomponentseq.js"
import {updateWorkspaceProperties} from "/apogeejs-app-bundle/src/commandseq/updateworkspaceseq.js"
//import {componentInfo} from "/apogeejs-app-lib/src/apogeeAppLib.js"

import {showSimpleActionDialog} from "/apogeejs-ui-lib/src/apogeeUiLib.js"

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

        /////////////////////////////////////
        //app menu
        this.menuData = null;
        this.fileMenuData = this._getFileMenuData(this.app,this.workspaceManager)
        this.editMenuData = this._getEditMenuData(this.app)
        this.aboutMenuData = this._getAboutMenuData()
        this.packageMenuData()
        ///////////////////////////////////////

        /////////////////////////////
        //tab state
        this.tabFunctions = {
            openTab: (tabId,isSelected = true) => this._openTab(tabId,isSelected),
            closeTab: (tabId) => this._closeTab(tabId),
            selectTab: (tabId) => this._selectTab(tabId)
        }

        this.tabListState = {
            selectedId: INVALID_OBJECT_ID,
            stateArray: [],
            tabFunctions: this.tabFunctions
        }
        /////////////////////////////////

        //////////////////////////////
        // tree state
        this.objectMap = {}
        this.objectStateMap = {}
        this.workspaceTreeState = null

        //////////////////////////////////

        this._subscribeToAppEvents()
    }

    ////////////////////////////////////
    // React Version additions section
    render() {
        const appElement = <AppElement 
            workspaceTreeState={this.workspaceTreeState}
            menuData={this.menuData}
            tabListState={this.tabListState} 
        />

        ReactDOM.render(appElement,document.getElementById(this.containerId))
    }

    /** This is a lookup function for a workspace object that has a tab (it just does components now)
     * @TODO this needs to be cleaned up. This was just a temporary implementation
     */
    getWorkspaceObject(objectId) {
        return this.objectMap[objectId]
    }


    //end react version additions section
    /////////////////////////////

    //////////////////////////////////////////
    // function callbacks
    // These are called based on the current workspaceManager value. It should be used
    // for UI callbacks and not in the middle of a workspace udpate.

    openTab(componentId) {
        //do we need two functions here???
        this._openTab(componentId)
    }

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

    ////////////////////////////////
    //start view state interface

    getViewStateJson() {
        // let json = {
        //     openTabs: []
        // }

        // let modelManager = this.workspaceManager.getModelManager()

        // this.tabListState.forEach(tabDataObject => {
        //     let fullName = tabDataObject.tabObject.getFullName(modelManager)
        //     json.openTabs.push(fullName)
        //     if(this.selectedTabId == tabDataObject.tabObject.getId()) {
        //         json.selectedTab = fullName
        //     }
        // })

        // return json.openTabs.length > 0 ? json : undefined
    }

    setViewStateJson(viewStateJson) {
        // if((viewStateJson)&&(viewStateJson.openTabs)) {
        //     let modelManager = this.workspaceManager.getModelManager()
        //     let model = modelManager.getModel()

        //     let tabDataList = []
        //     let selectedTabId

        //     viewStateJson.openTabs.forEach(fullName => {
        //         let member = model.getMemberByFullName(model,fullName)
        //         let componentId = modelManager.getComponentIdByMemberId(member.getId())
        //         if(componentId) {
        //             let component = modelManager.getComponentByComponentId(componentId)
        //             let tabDataObject = this._getComponentTabDataObject(component)
        //             tabDataList.push(tabDataObject)

        //             if(viewStateJson.selectedTab == fullName) {
        //                 selectedTabId = component.getId()
        //             }
        //         }
        //     })

        //     this.tabDataList = tabDataList
        //     this.selectedTabId = selectedTabId
        //     this.viewStateDirty = true

        //     this.render()
        // }
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

        this.app.addListener("update_completed",() => this._updateCompleted())
    }

    _updateCompleted() {

        let oldObjectMap = this.objectMap
        let oldTabListState = this.tabListState
        let oldObjectStateMap = this.objectStateMap

        let newObjectMap = {}
        let newObjectStateMap = {}

        if(this.workspaceManager) {
            this._loadObjectMap(this.workspaceManager,newObjectMap)
            this.tabListState = this._createTabListState(newObjectMap,oldObjectMap,oldTabListState)
            this.workspaceTreeState = this._createObjectTreeState(this.workspaceManager,newObjectStateMap,oldObjectMap,oldObjectStateMap)
        }

        this.objectMap = newObjectMap
        this.objectStateMap = newObjectStateMap

        this.render()
    }

    _onWorkspaceCreated(workspaceManager) {
        if(this.workspaceManager != null) {
            //discard an old view if there is one
            this._onWorkspaceClosed()
        }

        //create the new workspace view
        this.workspaceManager = workspaceManager

        this._updateFileMenu()
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

        this._updateFileMenu()
    }

    _onWorkspaceUpdated(workspaceManager) {
        this.workspaceManager = workspaceManager

        //update menu if the file metadata changed
        //(we may want to make the menu depend on the is dirty flag too)
        if(workspaceManager.isFieldUpdated("fileMetadata")) {
            this._updateFileMenu()
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

    _openTab(tabId,selectTab=true,supressRerender) {
        let oldTabListState = this.tabListState
        let oldStateArray = oldTabListState.stateArray

        if(oldStateArray.find(tabState => tabState.id == tabId)) return //tab already opened

        let component = this.objectMap[tabId]
        if(!component) return //component not found

        let newStateArray = oldStateArray.slice()
        let newTabState = this._getTabState(component)
        newStateArray.push(newTabState)

        let newSelectedId = (selectTab || (oldStateArray.length == 0)) ? tabId : oldTabListState.selectedId

        let newTabListState = {
            selectedId: newSelectedId,
            stateArray: newStateArray,
            tabFunctions: this.tabFunctions
        }
        this.tabListState = newTabListState

        if(!supressRerender) {
            this.render()
        } 
    }

    _closeTab(tabId,supressRerender) {
        let oldTabListState = this.tabListState
        let oldStateArray = oldTabListState.stateArray

        if(!oldStateArray.find(tabState => tabState.id == tabId)) return //tab not opened

        let newStateArray = oldStateArray.filter(tabState => tabState.id != tabId)
        let newSelectedId
        if(oldTabListState.selectedId == tabId) {
            newSelectedId = newStateArray.length >= 0 ? newStateArray[0].id : INVALID_OBJECT_ID
        }
        else {
            newSelectedId = oldTabListState.selectedId 
        }
        
        let newTabListState = {
            selectedId: newSelectedId,
            stateArray: newStateArray,
            tabFunctions: this.tabFunctions
        }
        this.tabListState = newTabListState

        if(!supressRerender) {
            this.render()
        } 
    }

    _selectTab(tabId,supressRerender) {
        let oldTabListState = this.tabListState

        if(oldTabListState.selectedId == tabId) return //already selected
        if(!oldTabListState.stateArray.find(tabState => tabState.id == tabId)) return //tab not opened

        let newTabListState = {
            selectedId: tabId,
            stateArray: oldTabListState.stateArray,
            tabFunctions: this.tabFunctions
        }
        this.tabListState = newTabListState

        this.render()
    }
 
    ///////////////////////////////////////////////
    // create object map

    
    _loadObjectMap(newObject,newObjectMap) {
        newObjectMap[newObject.getId()] = newObject
        const viewHelper = this._getViewHelper(newObject)
        let children = viewHelper.getChildren(this.workspaceManager,newObject)
        children.forEach(child => this._loadObjectMap(child,newObjectMap))
    }


    /////////////////////////////////////////////

    ////////////////////////////////////////////////////
    // tab state

    _createTabListState(newObjectMap,oldObjectMap,oldTabListState) {
        let newTabListState = {
            selectedId: oldTabListState.selectedId,
            stateArray: [],
            tabFunctions: this.tabFunctions
        }
        let selectionDeleted = false
        
        oldTabListState.stateArray.forEach(oldTabState => {
            let newComponent = newObjectMap[oldTabState.id]
            let oldComponent = oldObjectMap[oldTabState.id]
            if(newComponent) {
                //get new tab state
                let newTabState = this._getTabState(newComponent,oldComponent,oldTabState)
                newTabListState.stateArray.push(newTabState)
            }
            else {
                //component deleted - make sure this is not selected
                if(oldTabListState.selectedId == oldTabState.id) {
                    selectionDeleted = true;
                }
            }
        })

        if(selectionDeleted) {
            if(newTabListState.stateArray.length > 0) {
                newTabListState.selectedId = newTabListState.stateArray[0].id
            }
            else {
                newTabListState.selectedId = INVALID_OBJECT_ID
            }
        }

        return newTabListState
    }

    _getTabState(component,oldComponent,oldTabState) {
        //LATER UDPATE ONLY WHAT IS NEEDED

        let tabState = {}
        tabState.id = component.getId()
        tabState.label = component.getName()
        tabState.iconSrc = component.getIconUrl()
        tabState.status = component.getState()
        tabState.statusMessage = component.getStateMessage()

        tabState.addChildComponent = (componentConfig) => this.addComponent(componentConfig,component.getId()) //reuse, don't recreate instance
        tabState.getTabElement = getComponentTab

        const viewHelper = this._getViewHelper(component)
        let children = viewHelper.getChildren(this.workspaceManager,component);
        tabState.cellStateArray = children.filter(child => (child.getComponentConfig().viewModes !== undefined))
            .map(child => this._getCellState(child,viewHelper))

        return tabState
    }

    _getCellState(component,viewHelper) {
        let cellState = {}
        cellState.id = component.getId()
        cellState.displayName = component.getDisplayName()
        cellState.iconSrc = component.getIconUrl()
        cellState.status = component.getState()
        cellState.statusMessage = component.getStateMessage()
        cellState.componentTypeName = component.getComponentConfig().displayName

        cellState.menuItems = viewHelper.getMenuItems(this,component) //THESE ARE THE WRONG ITEMS! (and I should reuse them)

        cellState.viewModeControlStates = component.getComponentConfig().viewModes.map(viewModeInfo => {
            return {
                hidden: false,
                name: viewModeInfo.label,
                opened: viewModeInfo.isActive
            }
        })

        //view modes
        cellState.viewModes = component.getComponentConfig().viewModes.map(viewModeInfo => {
            let viewState = {}
            viewState.viewName = viewModeInfo.label
            if(viewModeInfo.sizeCommandInfo) viewState.sizeCommandInfo = viewModeInfo.sizeCommandInfo
            viewState.sourceState = viewModeInfo.getSourceState(component)
            viewState.getViewModeElement = viewModeInfo.getViewModeElement
            if(viewModeInfo.getViewStatusElement) viewState.getViewStatusElement = viewModeInfo.getViewStatusElement
            return viewState
        })

        return cellState
    }


    //////////////////////////////////////////////////////

    /////////////////////////////////////////////////
    // tree state

    _createObjectTreeState(newObject,newObjectStateMap,oldObjectMap,oldObjectStateMap) {
        
        //add a comment about why I am storing these extra object (as a side effect)

        const oldObject = oldObjectMap[newObject.getId()]
        const oldObjectState = oldObjectStateMap[newObject.getId()]
        const viewHelper = this._getViewHelper(newObject)

        // check for "data" updates
        let dataUpdated = false
        let newData
        if(newObject != oldObject) {
            let label = viewHelper.getLabel(newObject)
            let nameUpdated = (!oldObjectState) || (oldObjectState.data.text == label)
            let statusUpdated = (!oldObjectState) || (oldObjectState.data.status == newObject.getState())
            let statusMsgUpdated = (!oldObjectState) || (oldObjectState.data.statusMsg == newObject.getStateMessage())
            dataUpdated = (nameUpdated)||(statusUpdated)||(statusMsgUpdated)
            if(dataUpdated) {
                newData = {
                    id: newObject.getId(),
                    text: label,
                    iconSrc: oldObjectState ? oldObjectState.data.iconSrc : viewHelper.getIconUrl(newObject), //doesn't change
                    status: newObject.getState(),
                    statusMsg: newObject.getStateMessage(),
                    menuItems: oldObjectState ? oldObjectState.data.menuItems : viewHelper.getMenuItems(this,newObject) //doesn't change
                }
            }
        }

        //uiState is not updated here

        //check for children updates
        let children = viewHelper.getChildren(this.workspaceManager,newObject)
        let newChildTreeEntries = children.map(childObject => this._createObjectTreeState(childObject,newObjectStateMap,oldObjectMap,oldObjectStateMap))
        let childrenUpdated = oldObjectState ? !_arrayContentsMatch(newChildTreeEntries,oldObjectState.childTreeEntries) : true

        //geneterate the new state if needed
        let newObjectState
        if((!dataUpdated)&&(!childrenUpdated)) {
            newObjectState = oldObjectState
        }
        else {
            newObjectState = {
                data: dataUpdated ? newData : oldObjectState.data,
                uiState: oldObjectState ? oldObjectState.uiState : null,
                childTreeEntries: childrenUpdated ? newChildTreeEntries : oldObjectState.childTreeEntries
            }
        }

        newObjectStateMap[newObject.getId()] = newObjectState

        return newObjectState

    }

    _getViewHelper(workspaceObject) {
        switch (workspaceObject.getWorkspaceObjectType()) {
            case "WorkspaceManager":
                return workspaceManagerHelper

            case "ModelManager":
                return modelManagerHelper

            case "Component":
                return componentHelper

            case "ReferenceManager":
                return referenceManagerHelper

            case "ReferenceList":
                return referenceListHelper

            case "ReferenceEntry":
                return referenceEntryHelper
                
            default:
                throw new Error("Unrocgnized workspace object: " + workspaceObject.getWorkspaceObjectType())

        }
    }

}

/** This function returns true if the two arrays contain entries that are equal. */
function _arrayContentsMatch(array1,array2) {
    if(array1.length != array2.length) return false
    for(let i = 0; i < array1.length; i++) {
        if(array1[i] != array2[i]) return false
    }
    return true;
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