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

        this.tabFunctions = {
            openTab: (tabId,isSelected = true) => this._openTab(tabId,isSelected),
            closeTab: (tabId) => this._closeTab(tabId),
            selectTab: (tabId) => this._selectTab(tabId)
        }

        /////////////////////////////
        //state

        this.objectMap = {}
        this.tabStateMap = {}
        this.treeEntryStateMap = {}

        this.tabListState = {
            selectedId: INVALID_OBJECT_ID,
            tabStateArray: [],
            tabFunctions: this.tabFunctions
        }

        this.workspaceTreeState = null

        
        /////////////////////////////////

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
        let oldTabStateMap = this.tabStateMap
        let oldTreeEntryStateMap = this.treeEntryStateMap

        let newObjectMap = {}
        let newTabStateMap = {}
        let newTreeEntryStateMap = {}

        if(this.workspaceManager) {
            this._loadObjectMap(this.workspaceManager,newObjectMap)
            this.tabListState = this._createTabListState(oldTabListState,newObjectMap)
            this.workspaceTreeState = this._createObjectTreeState(this.workspaceManager,oldObjectMap,newTreeEntryStateMap,oldTreeEntryStateMap)
        }

        this.objectMap = newObjectMap
        this.tabStateMap = newTabStateMap
        this.treeEntryStateMap = newTreeEntryStateMap

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
        let oldTabStateArray = oldTabListState.tabStateArray

        if(oldTabStateArray.find(tabState => tabState.tabData.id == tabId)) return //tab already opened

        let component = this.objectMap[tabId]
        if(!component) return //component not found

        let newTabStateArray = oldTabStateArray.slice()
        let newTabState = this._getTabState(component)
        newTabStateArray.push(newTabState)

        let newSelectedId = (selectTab || (oldTabStateArray.length == 0)) ? tabId : oldTabListState.selectedId

        let newTabListState = {
            selectedId: newSelectedId,
            tabStateArray: newTabStateArray,
            tabFunctions: this.tabFunctions
        }
        this.tabListState = newTabListState

        if(!supressRerender) {
            this.render()
        } 
    }

    _closeTab(tabId,supressRerender) {
        let oldTabListState = this.tabListState
        let oldTabStateArray = oldTabListState.tabStateArray

        if(!oldTabStateArray.find(tabState => tabState.tabData.id == tabId)) return //tab not opened

        let newTabStateArray = oldTabStateArray.filter(tabState => tabState.tabData.id != tabId)
        let newSelectedId
        if(oldTabListState.selectedId == tabId) {
            newSelectedId = newTabStateArray.length > 0 ? newTabStateArray[0].tabData.id : INVALID_OBJECT_ID
        }
        else {
            newSelectedId = oldTabListState.selectedId 
        }
        
        let newTabListState = {
            selectedId: newSelectedId,
            tabStateArray: newTabStateArray,
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
        if(!oldTabListState.tabStateArray.find(tabState => tabState.tabData.id == tabId)) return //tab not opened

        let newTabListState = {
            selectedId: tabId,
            tabStateArray: oldTabListState.tabStateArray,
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

    _createTabListState(oldTabListState,newObjectMap) {
        let newTabListState = {
            selectedId: oldTabListState.selectedId,
            tabStateArray: [],
            tabFunctions: this.tabFunctions
        }
        let selectionDeleted = false
        
        //update the tab state for each opened tab component (that still exists()
        let oldTabStateArray = oldTabListState.tabStateArray
        let newTabStateArray = []
        oldTabStateArray.forEach(oldTabState => {
            let newComponent = newObjectMap[oldTabState.tabData.id]
            if(newComponent) {
                //get new tab state
                let newTabState = this._getTabState(newComponent,oldTabState)
                newTabStateArray.push(newTabState)
            }
            else {
                //component deleted - make sure this is not selected
                if(oldTabListState.selectedId == oldTabState.tabData.id) {
                    selectionDeleted = true;
                }
            }
        })
        let tabStateArrayUpdated = !_arrayContentsMatch(oldTabStateArray,newTabStateArray)

        //selection (this only changes if the state array changes)
        let newSelectedId
        let selectedIdUpdated
        if(selectionDeleted) {
            selectedIdUpdated = true
            if(newTabStateArray.length > 0) {
                newSelectedId = newTabStateArray[0].tabData.id
            }
            else {
                newSelectedId = INVALID_OBJECT_ID
            }
        }
        else {
            selectedIdUpdated = false
            newSelectedId = oldTabListState.selectedId
        }

        //update
        if( tabStateArrayUpdated || selectedIdUpdated ) {
            newTabListState = {
                selectedId: newSelectedId,
                tabStateArray: tabStateArrayUpdated ? newTabStateArray : oldTabStateArray,
                tabFunctions: this.tabFunctions
            }
        }
        else {
            newTabListState = oldTabListState
        }


        return newTabListState
    }

    _getTabState(component,oldTabState) { 

        //tab data
        let label = component.getName()
        let status = component.getState()
        let statusMessage = component.getStateMessage()

        let oldTabData = oldTabState ? oldTabState.tabData : null
        let newTabData
        let dataUpdated
        if( (!oldTabData) || (label != oldTabData.label) || (status != oldTabData.status) || (statusMessage != oldTabData.statusMessage)) {
            newTabData = {}
            newTabData.id = component.getId()
            newTabData.label = label
            newTabData.iconSrc = oldTabData ? oldTabData.iconSrc : component.getIconUrl()
            newTabData.status = status
            newTabData.statusMessage = statusMessage
            newTabData.addChildComponent = oldTabState ? oldTabState.addChildComponent : 
                (componentConfig) => this.addComponent(componentConfig,component.getId()) //we can reuse since this doesn't change
                newTabData.getTabElement = getComponentTab
            dataUpdated = true
        }
        else {
            newTabData = oldTabData
            dataUpdated = false
        }

        //cells state array
        const viewHelper = this._getViewHelper(component)
        let childrenWithCells = viewHelper.getChildren(this.workspaceManager,component).filter(child => (child.getComponentConfig().viewModes !== undefined))
        let oldCellStateArray = oldTabState ? oldTabState.cellStateArray : null
        let newCellStateArray = childrenWithCells.map(child => {
            let oldCellState = oldCellStateArray ? oldCellStateArray.find(cellState => cellState.cellData.id == child.getId()) : null
            return this._getCellState(child,viewHelper,oldCellState)
        })

        let stateArrayUpdated = oldCellStateArray ? !_arrayContentsMatch(newCellStateArray,oldCellStateArray) : true

        let newTabState
        if(dataUpdated || stateArrayUpdated) {
            newTabState = {
                tabData: dataUpdated ? newTabData : oldTabData,
                cellStateArray : stateArrayUpdated ? newCellStateArray : oldCellStateArray
            }
        }
        else {
            newTabState = oldTabState
        }

        return newTabState
    }

    _getCellState(component,viewHelper,oldCellState) {

        let displayName = component.getDisplayName()
        let status = component.getState()
        let statusMessage = component.getStateMessage()

        //get new cell data
        let newCellData
        let oldCellData = oldCellState ? oldCellState.cellData : null
        let dataUpdated
        if((!oldCellData)||(displayName != oldCellData.displayName)||(status != oldCellData.status)||(statusMessage != oldCellData.statusMessage)) {
            newCellData = {}
            newCellData.id = component.getId()
            newCellData.displayName = displayName
            newCellData.iconSrc = oldCellData ? oldCellData.iconSrc : component.getIconUrl()
            newCellData.status = status
            newCellData.statusMessage = statusMessage
            newCellData.componentTypeName = component.getComponentConfig().displayName
            newCellData.menuItems = oldCellData ? oldCellData.menuItems : viewHelper.getMenuItems(this,component) //these don't change. Reuse them 
            dataUpdated = true
        }
        else {
            newCellData = oldCellData
            dataUpdated = false
        }

        //get new view mode states
        let viewModes = component.getComponentConfig().viewModes
        let oldViewModeControlStates = oldCellState ? oldCellState.viewModeControlStates : null
        let oldViewModeStates = oldCellState ? oldCellState.viewModeStates : null
        let newViewModeControlStates = []
        let newViewModeStates = []
        viewModes.forEach((viewModeInfo,index) => {

            let oldViewModeControlState = oldViewModeControlStates ? oldViewModeControlStates[index] : null
            let oldViewModeState = oldViewModeStates ? oldViewModeStates[index] : null
            let oldSourceState = oldViewModeState ? oldViewModeState.sourceState : null

            let sourceState = viewModeInfo.getSourceState(component,oldSourceState)

            //view mode control state
            let newViewModeControlState
            if((!oldViewModeControlState)||(oldViewModeControlState.hidden != sourceState.hidden)) {
                newViewModeControlState = {
                    hidden: sourceState.hidden,
                    name: viewModeInfo.label,
                    opened: oldViewModeControlState ? oldViewModeControlState.opened : viewModeInfo.isActive
                }
            }
            else {
                newViewModeControlState = oldViewModeControlState
            }

            newViewModeControlStates[index] = newViewModeControlState
            
            //view mode state
            let newViewModeState
            if(sourceState != oldSourceState) {
                newViewModeState = {}
                newViewModeState.viewName = viewModeInfo.label
                if(viewModeInfo.sizeCommandInfo) newViewModeState.sizeCommandInfo = viewModeInfo.sizeCommandInfo

                Object.assign(newViewModeState,sourceState)

                newViewModeState.getViewModeElement = viewModeInfo.getViewModeElement
                if(viewModeInfo.getViewStatusElement) newViewModeState.getViewStatusElement = viewModeInfo.getViewStatusElement
            }
            else {
                newViewModeState = oldViewModeState
            }
            newViewModeStates[index] = newViewModeState

        })

        //get new cell state
        let vmcsUpdated = oldViewModeControlStates ? !_arrayContentsMatch(newViewModeControlStates,oldViewModeControlStates) : true
        let vmsUpdated = oldViewModeStates ? !_arrayContentsMatch(newViewModeStates,oldViewModeStates) : true

        let newCellState
        if(dataUpdated || vmcsUpdated || vmsUpdated ) {
            newCellState = {
                cellData: dataUpdated ? newCellData : oldCellData,
                viewModeControlStates : vmcsUpdated ? newViewModeControlStates : oldViewModeControlStates,
                viewModeStates : vmsUpdated ? newViewModeStates : oldViewModeStates
            }
        }
        else {
            newCellState = oldCellState
        }


        return newCellState
    }


    //////////////////////////////////////////////////////

    /////////////////////////////////////////////////
    // tree state

    _createObjectTreeState(newObject,oldObjectMap,newTreeEntryStateMap,oldTreeEntryStateMap) {
        
        //I am storing the old object and old state to facilitate change comparisons

        const oldObject = oldObjectMap[newObject.getId()]
        const oldTreeEntryState = oldTreeEntryStateMap[newObject.getId()]
        const viewHelper = this._getViewHelper(newObject)

        // check for "data" updates
        let dataUpdated = false
        let newData
        if(newObject != oldObject) {
            let label = viewHelper.getLabel(newObject)
            let nameUpdated = (!oldTreeEntryState) || (oldTreeEntryState.data.text == label)
            let statusUpdated = (!oldTreeEntryState) || (oldTreeEntryState.data.status == newObject.getState())
            let statusMsgUpdated = (!oldTreeEntryState) || (oldTreeEntryState.data.statusMsg == newObject.getStateMessage())
            dataUpdated = (nameUpdated)||(statusUpdated)||(statusMsgUpdated)
            if(dataUpdated) {
                newData = {
                    id: newObject.getId(),
                    text: label,
                    iconSrc: oldTreeEntryState ? oldTreeEntryState.data.iconSrc : viewHelper.getIconUrl(newObject), //doesn't change
                    status: newObject.getState(),
                    statusMsg: newObject.getStateMessage(),
                    menuItems: oldTreeEntryState ? oldTreeEntryState.data.menuItems : viewHelper.getMenuItems(this,newObject) //doesn't change
                }
            }
        }

        //uiState is not updated here

        //check for children updates
        let children = viewHelper.getChildren(this.workspaceManager,newObject)
        let newChildTreeEntries = children.map(childObject => this._createObjectTreeState(childObject,oldObjectMap,newTreeEntryStateMap,oldTreeEntryStateMap))
        let childrenUpdated = oldTreeEntryState ? !_arrayContentsMatch(newChildTreeEntries,oldTreeEntryState.childTreeEntries) : true

        //geneterate the new state if needed
        let newTreeEntryState
        if((!dataUpdated)&&(!childrenUpdated)) {
            newTreeEntryState = oldTreeEntryState
        }
        else {
            newTreeEntryState = {
                data: dataUpdated ? newData : oldTreeEntryState.data,
                uiState: oldTreeEntryState ? oldTreeEntryState.uiState : null,
                childTreeEntries: childrenUpdated ? newChildTreeEntries : oldTreeEntryState.childTreeEntries
            }
        }

        newTreeEntryStateMap[newObject.getId()] = newTreeEntryState

        return newTreeEntryState

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