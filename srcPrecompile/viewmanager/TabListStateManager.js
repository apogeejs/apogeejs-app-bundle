import {getViewManagerByObject,getViewManagerByType} from "/apogeejs-app-bundle/src/viewmanager/getViewManager.js"
import arrayContentsInstanceMatch from "/apogeejs-app-bundle/src/viewmanager/arrayContentsInstanceMatch.js"

export default class TabListStateManager {
    constructor(apogeeView) {
        this.apogeeView = apogeeView

        this.tabFunctions = {
            openTab: (tabId,isSelected = true) => this.openTab(tabId,isSelected),
            closeTab: (tabId) => this.closeTab(tabId),
            selectTab: (tabId) => this.selectTab(tabId)
        }
        
        //This is the active state for the tab, used in rendering
        //this value should always be set, the tabStateArray should always be present
        //and the tab functions should always be present
        //for each element tabState in the tabStateArray, there should always be an element tabState.tabData.id
        this.tabListState = {
            selectedId: INVALID_OBJECT_ID,
            tabStateArray: [],
            tabFunctions: this.tabFunctions
        }

        //This is a json holding cached state
        //It should always be set. Both its fields however may be empty.
        //It has two fields - the opened tabs (tabs, array of tab ids) and the selected tab (selectedId, a tabId)
        //These values, if present, will override the values in the active state
        //This is a mutable object and its contents will be removed once they are applied
        this.tabListJson = {
        }
    }

    getState() {
        return this.tabListState
    }

    /** This function recalculates the tab list state for when the workspace is updated.
     * This function does not call render. */
    updateState() {
        let oldTabListState = this.tabListState
        this.tabListState = this._createTabListState(oldTabListState)
    }

    
    //-----------------------------
    // state update functions
    //-----------------------------
    
    openTab(tabId,selectTab=true,supressRerender) {

        //update the tab list json for this command
        if(!this.tabListJson.tabs) {
            let tabs = []
            this.tabListState.tabStateArray.forEach(tabState => {
                if(tabState && (tabState.tabData != undefined)) {
                    tabs.push(tabState.tabData.id)
                }
            })
            this.tabListJson.tabs = tabs
        }

        if(!this.tabListJson.tabs.includes(tabId)) {
            this.tabListJson.tabs.push(tabId)
        }

        if(selectTab) {
            this.tabListJson.selectedId = tabId
        }

        //update the tab state for the new tab list json
        this.updateState()

        if(!supressRerender) {
            this.apogeeView.render()
        } 
    }

    closeTab(tabId,supressRerender) {
        //update the tab list json for this command
        if(!this.tabListJson.tabs) {
            let tabs = []
            this.tabListState.tabStateArray.forEach(tabState => {
                if(tabState && (tabState.tabData != undefined) && (tabState.tabData.id != tabId)) {
                    tabs.push(tabState.tabData.id)
                }
            })
            this.tabListJson.tabs = tabs
        }
        else {
            let newTabs = []
            this.tabListJson.tabs.forEach(heldTabId => {
                if(heldTabId != tabId) {
                    newTabs.push(heldTabId)
                }
            })
            this.tabListJson.tabs = newTabs
        }
        if(this.tabListJson.selectedId == tabId) {
            this.tabListJson.selectedId = this.tabListJson.tabs.length > 0 ? this.tabListJson.tabs[0] : INVALID_OBJECT_ID
        }

        //update the tab state for the new tab list json
        this.updateState()

        if(!supressRerender) {
            this.apogeeView.render()
        } 
    }

    selectTab(tabId,supressRerender) {
        this.tabListJson.selectedId = tabId
        this.updateState()

        if(!supressRerender) {
            this.apogeeView.render()
        }
    }

    // /** Returns the tab state for a specific tab. */
    // getTabState(tabId) {
    //     let index = this.tabListState.tabStateArray.findIndex(heldTabState => heldTabState.tabData.id == tabId)

    //     if(index >= 0) {
    //         return this.tabListState.tabStateArray[index]
    //     }
    //     else {
    //         return null
    //     }
    // }

    // /** This function updates the state for a given tab. This also calls render for the UI. */
    // setTabState(tabState) {
    //     //make sure we have an identifier for the tab
    //     if(!tabState.tabData || !tabState.tabData.id) return

    //     let index = this.tabListState.tabStateArray.findIndex(heldTabState => {
    //         if(heldTabState.tabData) {
    //             return heldTabState.tabData.id == tabState.tabData.id
    //         }
    //         else {
    //             return false
    //         }
    //     })

    //     if(index >= 0) {
    //         this.tabListState.tabStateArray[index] = tabState
    //     }

    //     this.apogeeView.render()
    // }


    //----------------------------
    // Serialization
    //----------------------------
/*
    getStateJson() {
        //DOH! We should use the tree entry json map if any entries are present!!!
        let stateMapJson = {}
        for(let objectId in this.treeEntryStateMap) {
            let treeEntryState = this.treeEntryStateMap[objectId]
            let treeEntryJson = this.treeEntryJsonMap[objectId]

            //only one saved variables - opened
            let opened
            if(treeEntryJson && (treeEntryJson.opened !== undefined)) {
                opened = treeEntryJson.opened //this overrides the stored state if present
            }
            else if(treeEntryState && treeEntryState.uiState && (treeEntryState.uiState.opened !== undefined) ) {
                opened = treeEntryState.uiState.opened
            }

            if(opened !== undefined) {
                let stateJson = {
                    opened: opened
                }
                stateMapJson[objectId] = stateJson
            }
        }
        return stateMapJson
    }

    setStateJson(stateMapJson) {
        this.treeEntryJsonMap = stateMapJson
        this.updateState()
    }
*/

    ///////////////////////

    /** Returns serialized information for the tab state. If none is available
     * null is returned. */
    getStateJson() {
        let tabIds, selectedTabId

        //use data present in the tabListJson
        if(this.tabListJson) {
            if(this.tabListJson.tabs !== undefined) tabIds = this.tabListJson.tabs
            if(this.tabListJson.selectedId !== undefined) selectedTabId = this.tabListJson.selectedId
        }
        
        //add any needed data from the current state
        if(tabIds === undefined) {
            tabIds = []
            if(this.tabListState.tabStateArray) {
                this.tabListState.tabStateArray.forEach( tabState => {
                    if(tabState.tabData && (tabState.tabData.id != undefined)) {
                        tabIds.push(tabState.tabData.id)

                        //if this tab present and it is selected, set it to selected tab id.
                        if( (selectedTabId === undefined) && (this.tabListState.selectedId == tabState.tabData.id) ) {
                            selectedTabId = this.tabListState.selectedId
                        }
                    }
                })
            }
        }

        //convert these to the serialized format
        let stateJson
        tabIds.forEach(tabId => {
            let workspaceObject = this.apogeeView.getWorkspaceObject(tabId)
            if(workspaceObject) {
                let viewManager = getViewManagerByObject(workspaceObject)
                let globalIdentifier = viewManager.getGlobalIdentifier(this.apogeeView,workspaceObject)
                if(globalIdentifier) {
                    if(!stateJson ) stateJson = {}
                    if(!stateJson.tabs) stateJson.tabs = []

                    stateJson.tabs.push(globalIdentifier)

                    if(tabId == selectedTabId) {
                        stateJson.selectedIndex = stateJson.tabs.length - 1 
                    }
                }
            }
        })
        
        return stateJson
    }

    setStateJson(stateJson) {
        //clear the state values to start
        let tabListJson = {
            tabs: []
        }
        let tabListState = {
            selectedId: INVALID_OBJECT_ID,
            tabStateArray: [],
            tabFunctions: this.tabFunctions
        }

        if(stateJson.tabs) {
            stateJson.tabs.forEach( (tabIdentifier,index) => {
                //for state json held here, convert from global identifier to id
                let viewManager = getViewManagerByType(tabIdentifier.type)
                if(viewManager) {
                    let workspaceObject = viewManager.getObjectByIdentifier(this.apogeeView,tabIdentifier)
                    tabListJson.tabs.push(workspaceObject.getId())

                    if(index == stateJson.selectedIndex) {
                        tabListJson.selectedId = workspaceObject.getId()
                    }
                }
            })
        }

        this.tabListJson = tabListJson
        this.tabListState = tabListState
        this.updateState()
    }

    //=======================
    // Private methods
    //=======================

    _createTabListState(oldTabListState) {
        //update the tab state for each opened tab component (that still exists()
        let oldTabStateArray = oldTabListState.tabStateArray
        let newTabStateArray = []

        //----------------------------------
        // get the active tab list and selected tab
        //----------------------------------
        let tabIds
        if(this.tabListJson.tabs !== undefined) {
            tabIds = this.tabListJson.tabs
            //clear this data once we use it
            delete this.tabListJson.tabs
        }
        else {
            tabIds = oldTabStateArray.map(tabState => tabState.tabData ? tabState.tabData.id : INVALID_OBJECT_ID) 
        }

        let newSelectedId
        if(this.tabListJson.selectedId !== undefined) {
            newSelectedId = this.tabListJson.selectedId
            //clear this data once we use it
            delete this.tabListJson.selectedId
        }
        else {
            newSelectedId = oldTabListState.selectedId
        }

        //------------------------------------------
        // load the tab states
        //------------------------------------------
        let selectedTabPresent = false
        let tabStateManager = this.apogeeView.getTabStateManager()
        tabIds.forEach(tabId => {
            let newTabState = tabStateManager.getState(tabId)
            if(newTabState) {
                newTabStateArray.push(newTabState)
                if(tabId == newSelectedId) {
                    selectedTabPresent = true
                }
            }
        })
        let tabStateArrayUpdated = !arrayContentsInstanceMatch(oldTabStateArray,newTabStateArray)

        //------------------
        //selection
        //------------------
        if(!selectedTabPresent) {
            if(newTabStateArray.length > 0) {
                //set the first tab as selected
                newSelectedId = newTabStateArray[0].tabData.id
            }
        }

        let selectedIdUpdated = oldTabListState.selectedId != newSelectedId

        //update
        let newTabListState
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

    //--------------------------
    // serialization
    //--------------------------
/*
    _serializeTabState(tabState) {
        //tab state should have a field tabData, with field id
        let workspaceObject = this.apogeeView.getWorkspaceObject(tabState.tabData.id)
        if(workspaceObject) {
            let viewManager = getViewManagerByObject(workspaceObject)
            if(viewManager) {
                return viewManager.serializeTabState(this.apogeeView,workspaceObject,tabState)
            }
        }
    }

    _deserializeTabState(tabStateJson) {
        //Tab state json should have a field "identifier" with the workspace object type.
        //Pass the state to this view manager to deserialize
        if(tabStateJson.identifier) {
            let viewManager = getViewManagerByType(tabStateJson.identifier.type)
            if(viewManager) {
                return viewManager.deserializeTabState(this.apogeeView,tabStateJson)
            }
        }
        
        return null
    }
*/  
}


const INVALID_OBJECT_ID = 0