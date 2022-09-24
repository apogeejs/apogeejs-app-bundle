import getViewManager from "/apogeejs-app-bundle/src/viewmanager/getViewManager.js"
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

        let viewManager = getViewManager(component)
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
            //I am assuming these are all components for now
            let newComponent = this.apogeeView.getWorkspaceObject(oldTabState.tabData.id)
            if(newComponent) {
                //get new tab state
                let viewManager = getViewManager(newComponent)
                let newTabState = viewManager.getTabState(this.apogeeView,newComponent,oldTabState)
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
    
}


const INVALID_OBJECT_ID = 0