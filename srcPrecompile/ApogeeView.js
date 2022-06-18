import {Apogee} from "/apogeejs-app-lib/src/apogeeAppLib.js";

import {AppElement} from "/apogeejs-app-bundle/src/react/app.js";

import {closeWorkspace} from "/apogeejs-app-bundle/src/commandseq/closeworkspaceseq.js";
import {createWorkspace} from "/apogeejs-app-bundle/src/commandseq/createworkspaceseq.js";
import {openWorkspace} from "/apogeejs-app-bundle/src/commandseq/openworkspaceseq.js";
import {saveWorkspace} from "/apogeejs-app-bundle/src/commandseq/saveworkspaceseq.js";
import { addComponent } from "/apogeejs-app-bundle/src/commandseq/addcomponentseq.js"
import { updateComponentProperties } from "/apogeejs-app-bundle/src/commandseq/updatecomponentseq.js"
import { deleteComponent } from "/apogeejs-app-bundle/src/commandseq/deletecomponentseq.js"
import {updateWorkspaceProperties} from "/apogeejs-app-bundle/src/commandseq/updateworkspaceseq.js"
import {componentInfo} from "/apogeejs-app-lib/src/apogeeAppLib.js";

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

        //////////////////////////////
        // tree state
        this.treeStateMap = {}



        //////////////////////////////////

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

        let workspaceTreeState
        if(this.workspaceManager) {
            let workspaceTreeEntry = this.treeStateMap[this.workspaceManager.getId()]
            if(workspaceTreeEntry) workspaceTreeState = workspaceTreeEntry.state
        }

        const appElement = <AppElement 
            workspaceTreeState={workspaceTreeState}
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
        //Do I want to do this, or expolicitly not do this?
        if(this.viewStateDirty) {
            this._updateViewState()
        }

        let json = {
            openTabs: []
        }

        let modelManager = this.workspaceManager.getModelManager()

        this.tabDataList.forEach(tabDataObject => {
            let fullName = tabDataObject.tabObject.getFullName(modelManager)
            json.openTabs.push(fullName)
            if(this.selectedTabId == tabDataObject.tabObject.getId()) {
                json.selectedTab = fullName
            }
        })

        return json.openTabs.length > 0 ? json : undefined
    }

    setViewStateJson(viewStateJson) {
        if((viewStateJson)&&(viewStateJson.openTabs)) {
            let modelManager = this.workspaceManager.getModelManager()
            let model = modelManager.getModel()

            let tabDataList = []
            let selectedTabId

            viewStateJson.openTabs.forEach(fullName => {
                let member = model.getMemberByFullName(model,fullName)
                let componentId = modelManager.getComponentIdByMemberId(member.getId())
                if(componentId) {
                    let component = modelManager.getComponentByComponentId(componentId)
                    let tabDataObject = this._getComponentTabDataObject(component)
                    tabDataList.push(tabDataObject)

                    if(viewStateJson.selectedTab == fullName) {
                        selectedTabId = component.getId()
                    }
                }
            })

            this.tabDataList = tabDataList
            this.selectedTabId = selectedTabId
            this.viewStateDirty = true

            this.render()
        }
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

        this.app.addListener("modelManager_created",modelManager => this._onModelCreated(modelManager))
        this.app.addListener("modelManager_deleted",modelManager => this._onModelDeleted(modelManager))
        this.app.addListener("modelManager_updated",modelManager => this._onModelUpdated(modelManager))

        //componet update and delete - for the tab state (since only components have tabs now)
        this.app.addListener("component_created",component => this._onComponentCreated(component))
        this.app.addListener("component_deleted",component => this._onComponentDeleted(component))
        this.app.addListener("component_updated",component => this._onComponentUpdated(component))

        this.app.addListener("update_completed",() => this._updateCompleted())
    }

    _updateCompleted() {
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

        //tab state
        this.tabDataList = []
        this.selectedTabId = INVALID_OBJECT_ID
        this.viewStateDirty = true;

        // tree state
        this.treeState = {}
        this._updateTreeStateEntry(workspaceManager)
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

        //tab state
        this.tabDataList = []
        this.selectedTabId = INVALID_OBJECT_ID
        this.viewStateDirty = true;

        // tree state
        this.treeState = {}

    }

    _onWorkspaceUpdated(workspaceManager) {
        this.workspaceManager = workspaceManager

        //update menu if the file metadata changed
        //(we may want to make the menu depend on the is dirty flag too)
        if(workspaceManager.isFieldUpdated("fileMetadata")) {
            this._updateFileMenu()
        }

        //tree state
        this._updateTreeStateEntry(workspaceManager)
    }

    _onComponentCreated(component) {
        //tree state
        this._updateTreeStateEntry(component)
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

        //tree state
        this._updateTreeStateEntry(component)
    }

    _onComponentDeleted(component) {
        if(this.tabDataList.find(tabDataObject => tabDataObject.tabObject.getId() == component.getId())) {
            this._closeTab(component.getId())
        }

        this._removeTreeStateEntry(component)
    }

    _onModelCreated(modelManager) {
        //tree state
        this._updateTreeStateEntry(modelManager)
    }
    
    _onModelUpdated(modelManager) {
        //tree state
        this._updateTreeStateEntry(modelManager)
    }

    _onModelDeleted(modelManager) {
        //tree state
        this._removeTreeStateEntry(modelManager)
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

    /////////////////////////////////////////////////
    // tree state

    _getTreeStateData(workspaceObject) {
        let treeStateData = {
            id: workspaceObject.getId(),
            name: workspaceObject.getName(),
            iconSrc: workspaceObject.getIconUrl(),
            status: workspaceObject.getState(),
        }

        let menuItems = this._getTreeMenuItems(workspaceObject)
        if(menuItems) treeStateData.menuItems = menuItems

        return treeStateData
    }

    _getTreeStateParent(workspaceObject) {
        switch(workspaceObject.getType()) {
            case "workspaceManager":
                return null

            case "modelManager":
                return this.workspaceManager
            
            case "component": 
                let modelManager = this.workspaceManager.getModelManager()
                let parentComponent = workspaceObject.getParentComponent(modelManager)
                return parentComponent ? parentComponent : modelManager

            default:
                return null
        }
    }

    _getTreeMenuItems(workspaceObject) {
        switch(workspaceObject.getType()) {
            case "workspaceManager":
                return this._workspaceManagerTreeMenuItems(workspaceObject)
            
            case "component": 
                return this._componentTreeMenuItems(workspaceObject)

            default:
                return null
        }
    }

    _workspaceManagerTreeMenuItems(workspaceManager) {
        return [
            {text: "Edit Properties", action: () => updateWorkspaceProperties(workspaceManager) },
        ]
    }

    _componentTreeMenuItems(component) {
        //menu items
        let menuItems = []
        //open tab
        if(component.getComponentConfig().isParentOfChildEntries) {
            menuItems.push({text: "Open", action: () => this.tabFunctions.openTab(component.getId())})
        }
        //component properties
        this._addComponentMenuItems(menuItems,component)

        //add children
        if(component.getComponentConfig().isParentOfChildEntries) {
            this._addParentMenuItems(menuItems,component.getParentFolderForChildren())
        }

        return menuItems
    }

    _updateTreeStateEntry(workspaceObject) {
        let newData = this._getTreeStateData(workspaceObject)

        let oldEntry = this.treeStateMap[newData.id]
        let newEntry
        if(!oldEntry) {
            newEntry = {
                state: {
                    data: newData,
                    uiState: {},
                    childTreeEntries: []
                },
                stateDirty: true,
                dataDirty: true,
                uiStateDirty: true,
                childrenDirty: true
            }
        }
        else {
            //set new data for the state
            let newState = {}
            Object.assign(newState,oldEntry.state)
            newState.data = newData
            
            //craete new entry with updated state
            newEntry = {}
            Object.assign(newEntry,oldEntry)
            newEntry.state = newState
            newEntry.stateDirty = true
            newEntry.dataDirty = true
        }

        //set the new entry
        this.treeStateMap[workspaceObject.getId()] = newEntry

        this._addToParentTreeStateEntry(workspaceObject,newEntry)
    }

    _addToParentTreeStateEntry(workspaceObject,treeStateEntry) {
        let parentWorkspaceObject = this._getTreeStateParent(workspaceObject)
        if(!parentWorkspaceObject) return

        let parentEntry = this.treeStateMap[parentWorkspaceObject.getId()]

        //get the new state entry
        let newStateEntry
        if(parentEntry.stateDirty) {
            newStateEntry = parentEntry.state
        }
        else {
            newStateEntry = {}
            Object.assign(newStateEntry,parentEntry.state)
            parentEntry.state = newStateEntry
            parentEntry.stateDirty = true
        }

        //add the child
        let index = newStateEntry.childTreeEntries.findIndex(childTreeEntry => childTreeEntry.data.id == workspaceObject.getId())
        if(index >= 0) {
            newStateEntry.childTreeEntries[index] = treeStateEntry.state
        }
        else {
            newStateEntry.childTreeEntries.push(treeStateEntry.state)
        }

        parentEntry.childrenDirty = true

        this._addToParentTreeStateEntry(parentWorkspaceObject,parentEntry)
    }

    _removeTreeStateEntry(workspaceObject) {
        throw new Error("implement!")
    }

    _removeFromParentTreeStateEntry(workspaceObject) {
        throw new Error("implement!")
    }

    //utilities 
    _addComponentMenuItems(menuItems,component) {
        menuItems.push({text: "Edit Properties", action: () => updateComponentProperties(component)})
        menuItems.push({text: "Delete", action: () => deleteComponent(component)})
    }
    
    _addParentMenuItems(menuItems,memberParent) {
        let initialValues = memberParent ? {parentId:memberParent.getId()} : {}
        const parentComponentConfigs = componentInfo.getParentComponentConfigs()
        parentComponentConfigs.forEach(componentConfig => {
            let childMenuItem = {};
            childMenuItem.text = "Add Child " + componentConfig.displayName;
            childMenuItem.action = () => addComponent(this.app,componentConfig,initialValues);
            menuItems.push(childMenuItem);
        })
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