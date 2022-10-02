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
        
        this.tabStateMap = {}
        this.tabListState = {
            selectedId: INVALID_OBJECT_ID,
            tabStateArray: [],
            tabFunctions: this.tabFunctions
        }
    }

    getState() {
        return this.tabListState
    }

    updateState() {
        let oldTabListState = this.tabListState
        //let oldTabStateMap = this.tabStateMap
        this.tabListState = this._createTabListState(oldTabListState)
    }

    /** Returns serialized information for the tab state. If none is available
     * null is returned. */
    getStateJson() {
        let stateJson = {} 
        if(this.tabListState.tabStateArray) {
            this.tabListState.tabStateArray.forEach( tabState => {
                let tabJson = this._getTabJson(tabState)
                if(tabJson) {
                    if(!stateJson.tabs) stateJson.tabs = []
                    stateJson.tabs.push(tabJson)

                    //set the selected tab data if this is selected
                    if(this.tabListState.selectedId == tabState.tabData.id) {
                        stateJson.selectedIndex = stateJson.tabs.length - 1 
                    }
                }
            })
        }

        if(_.size(stateJson) > 0) return stateJson
        else return null
    }

    setStateJson(stateJson) {
        let newTabListState = {
            selectedId: INVALID_OBJECT_ID,
            tabStateArray: [],
            tabFunctions: this.tabFunctions
        }

        if(stateJson.tabs) {
            stateJson.tabs.forEach( (tabJson,index) => {
                let tabState = this._deserializeTabState(tabJson)
                if(tabState) {
                    newTabListState.tabStateArray.push(tabState)

                    //set selected index
                    if(stateJson.selectedIndex == index) {
                        newTabListState.selectedId = tabState.tabData.id
                    }
                }
            })
        }

        //ugh, this is ugly
        this.tabListState = newTabListState
    }

    //-----------------------------
    // state update functions
    //-----------------------------
    
    openTab(tabId,selectTab=true,supressRerender) {
        let oldTabListState = this.tabListState
        let oldTabStateArray = oldTabListState.tabStateArray

        if(oldTabStateArray.find(tabState => tabState.tabData.id == tabId)) return //tab already opened

        let component = this.apogeeView.getWorkspaceObject(tabId)  //assume all components for now
        if(!component) return //component not found

        let newTabStateArray = oldTabStateArray.slice()

        let viewManager = getViewManagerByObject(component)
        let newTabState = viewManager.getTabState(this.apogeeView,component)
        newTabStateArray.push(newTabState)

        let newSelectedId = (selectTab || (oldTabStateArray.length == 0)) ? tabId : oldTabListState.selectedId

        let newTabListState = {
            selectedId: newSelectedId,
            tabStateArray: newTabStateArray,
            tabFunctions: this.tabFunctions
        }
        this.tabListState = newTabListState

        if(!supressRerender) {
            this.apogeeView.render()
        } 
    }

    closeTab(tabId,supressRerender) {
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
            this.apogeeView.render()
        } 
    }

    selectTab(tabId,supressRerender) {
        let oldTabListState = this.tabListState

        if(oldTabListState.selectedId == tabId) return //already selected
        if(!oldTabListState.tabStateArray.find(tabState => tabState.tabData.id == tabId)) return //tab not opened

        let newTabListState = {
            selectedId: tabId,
            tabStateArray: oldTabListState.tabStateArray,
            tabFunctions: this.tabFunctions
        }
        this.tabListState = newTabListState

        this.apogeeView.render()
    }


    //=======================
    // Private methods
    //=======================

    _createTabListState(oldTabListState) {
        let selectionDeleted = false
        
        //update the tab state for each opened tab component (that still exists()
        let oldTabStateArray = oldTabListState.tabStateArray
        let newTabStateArray = []
        oldTabStateArray.forEach(oldTabState => {
            let workspaceObject = this.apogeeView.getWorkspaceObject(oldTabState.tabData.id)
            if(workspaceObject) {
                //get new tab state
                let viewManager = getViewManagerByObject(workspaceObject)
                let newTabState = viewManager.getTabState(this.apogeeView,workspaceObject,oldTabState)
                newTabStateArray.push(newTabState)
            }
            else {
                //component deleted - make sure this is not selected
                if(oldTabListState.selectedId == oldTabState.tabData.id) {
                    selectionDeleted = true;
                }
            }
        })
        let tabStateArrayUpdated = !arrayContentsInstanceMatch(oldTabStateArray,newTabStateArray)

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

    _getTabJson(tabState) {
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
    
}


const INVALID_OBJECT_ID = 0