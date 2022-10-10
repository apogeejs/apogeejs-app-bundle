import arrayContentsInstanceMatch from "/apogeejs-app-bundle/src/viewmanager/arrayContentsInstanceMatch.js"
import {getViewManagerByObject} from "/apogeejs-app-bundle/src/viewmanager/getViewManager.js"

export default class TreeState {

    constructor(apogeeView) {
        this.apogeeView = apogeeView
        this.workspaceTreeState = null //this is the top level tree entry (and contains the other tree entries)
        this.treeEntryStateMap = {} //this stores the entry state, by object id
        this.treeEntryJsonMap = {} //this stored serielized state, by object id (only the ui state)
    }

    getState() {
        return this.workspaceTreeState
    }

    /** This recalculates the current tree state */
    updateState() {
        let oldTreeEntryStateMap = this.treeEntryStateMap
        let newTreeEntryStateMap = {}

        let workspaceManager = this.apogeeView.getWorkspaceManager()
        if(workspaceManager) {
            this.workspaceTreeState = this._createTreeEntryState(workspaceManager,newTreeEntryStateMap,oldTreeEntryStateMap)
        }

        this.treeEntryStateMap = newTreeEntryStateMap
    }

    //-------------------------
    // State change functions
    //-------------------------

    /** This opens and closes the tree entry for the given object id. */
    setOpened(objectId,opened) {
        let treeEntryJson = this.treeEntryJsonMap[objectId]
        let newTreeEntryJson
        if(treeEntryJson) {
            newTreeEntryJson = this._copyTreeEntryJson(treeEntryJson)
        }
        else {
            newTreeEntryJson = this._createTreeEntryJson(objectId,false)
        }

        //set opened in the stored json state
        newTreeEntryJson.opened = opened
        this.treeEntryJsonMap[objectId] = newTreeEntryJson

        //recalculate the view state and rerender
        this.updateState()
        this.apogeeView.render()
    }

    //-------------------------
    // Serialization
    //-------------------------

    getStateJson() {
        let stateJson = {}
        let addTreeEntryJson = workspaceObject => {
            let objectId = workspaceObject.getId()
            let treeEntryJson = this.treeEntryJsonMap[objectId]
            if(treeEntryJson) {
                stateJson[objectId] = treeEntryJson
            }
            else {
                //create a cell json, only if we have active state info present
                treeEntryJson = this._createTreeEntryJson(objectId,true)
                if(treeEntryJson) {
                    stateJson[objectId] = treeEntryJson
                }
            }
        }
        this.apogeeView.runOverAllWorkspaceObjects(addTreeEntryJson)

        return stateJson





        // let stateMapJson = {}
        // for(let objectId in this.treeEntryStateMap) {
        //     let treeEntryState = this.treeEntryStateMap[objectId]
        //     let treeEntryJson = this.treeEntryJsonMap[objectId]

        //     //only one saved variables - opened
        //     let opened
        //     if(treeEntryJson && (treeEntryJson.opened !== undefined)) {
        //         opened = treeEntryJson.opened //this overrides the stored state if present
        //     }
        //     else if(treeEntryState && treeEntryState.uiState && (treeEntryState.uiState.opened !== undefined) ) {
        //         opened = treeEntryState.uiState.opened
        //     }

        //     if(opened !== undefined) {
        //         let stateJson = {
        //             opened: opened
        //         }
        //         stateMapJson[objectId] = stateJson
        //     }
        // }
        // return stateMapJson
    }

    setStateJson(stateMapJson) {
        this.treeEntryJsonMap = stateMapJson
        this.updateState()
    }
    
    //==========================
    // Private Methods
    //==========================
    
    /** This creates a cell json, loading the current state. It may return null if 
     * this given object is not a component with a cell.
     */
     _createTreeEntryJson(objectId,onlyWithState) {
        let workspaceObject = this.apogeeView.getWorkspaceObject(objectId)
        if(!workspaceObject) {
            //not a component with a cell
            return null
        }

        let treeEntryJson = {}

        //get the the active state for this id
        let treeEntryState = this.treeEntryStateMap[objectId]
        //is we flag "only with state", we will only create the cell json if we have state info
        if( !treeEntryState && onlyWithState ) return null

        //we only have one state item in the json now - opened
        if(treeEntryState.uiState) {
            treeEntryJson.opened = treeEntryState.uiState.opened ? true : false
        }

        return treeEntryJson
    }

    /** The creates a shallow copy of the cellJson, such as so it can be udpated with a modified state. */
    _copyTreeEntryJson(treeEntryJson) {
        let newTreeEntryJson = {}
        Object.apply(newTreeEntryJson,treeEntryJson)
        return newTreeEntryJson
    }

    /** This function updates/creates the storedtree entry json for the given object id
     * so the given property name holds the given property value. */
    _updateTreeEntryJson(objectId,propertyName,propertyValue) {
        let newEntryJson = {}

        const entryJson = this.treeEntryJsonMap[objectId]
        if(entryJson) {
            Object.assign(newEntryJson,entryJson)
        }

        newEntryJson[propertyName] = propertyValue

        this.treeEntryJsonMap[objectId] = newEntryJson
    }

    /** This function calculats the tree entry state for the given object, including its children. */
    _createTreeEntryState(newObject,newTreeEntryStateMap,oldTreeEntryStateMap) {

        const viewManager = getViewManagerByObject(newObject)
        const objectId = newObject.getId()
        const oldTreeEntryState = oldTreeEntryStateMap[objectId]
        const entryJson = this.treeEntryJsonMap[objectId]

        //once we apply the stored json, delete it
        delete this.treeEntryJsonMap[objectId]

        //------------------------
        // check for tree entry "data" updates
        //------------------------

        let newDataState

        if( (!oldTreeEntryState) || (newObject.getInstanceNumber() != oldTreeEntryState.data.instanceNumber) ) {
            let dataUpdated = false

            let label = viewManager.getLabel(newObject)
            let nameUpdated = (!oldTreeEntryState) || (oldTreeEntryState.data.text != label)
            let statusUpdated = (!oldTreeEntryState) || (oldTreeEntryState.data.status != newObject.getState())
            let statusMsgUpdated = (!oldTreeEntryState) || (oldTreeEntryState.data.statusMsg != newObject.getStateMessage())

            dataUpdated = (nameUpdated)||(statusUpdated)||(statusMsgUpdated)
            if(dataUpdated) {
                newDataState = {
                    id: newObject.getId(),
                    text: label,
                    iconSrc: oldTreeEntryState ? oldTreeEntryState.data.iconSrc : viewManager.getIconUrl(newObject), //doesn't change
                    status: newObject.getState(),
                    statusMsg: newObject.getStateMessage(),
                    menuItems: oldTreeEntryState ? oldTreeEntryState.data.menuItems : viewManager.getMenuItems(this.apogeeView,newObject), //doesn't change
                    instanceNumber: newObject.instanceNumber
                }
            }
        }
        if(!newDataState) {
            newDataState = oldTreeEntryState.data
        }

        //----------------------
        // check for ui updates
        //----------------------
        let newUiState
        if(!oldTreeEntryState || (entryJson && (entryJson.opened !== undefined)) ) {

            let opened
            if(entryJson && (entryJson.opened !== undefined))  {
                opened = entryJson.opened ? true : false
            }
            else if(oldTreeEntryState) {
                opened = oldTreeEntryState.ui.opened ? true : false
            }
            else if(viewManager.getDefaultStateJson){
                let defaultJson = viewManager.getDefaultStateJson(newObject)
                opened =  (defaultJson && defaultJson.treeEntryOpened) ? true : false 
            }

            let setOpened
            if(oldTreeEntryState && oldTreeEntryState.setOpened) {
                setOpened = oldTreeEntryState.setOpened
            }
            else {
                setOpened = opened => this.setOpened(objectId,opened)
            }

            newUiState = {
                opened: opened,
                setOpened: setOpened
            }
        }
        if(!newUiState) {
            //resort to old state if none created
            newUiState = oldTreeEntryState.ui
        }

        //-------------------------------
        //check for children updates
        //-------------------------------
        let children = viewManager.getChildren(this.apogeeView.getWorkspaceManager(),newObject)
        let newChildStates = children.map(childObject => this._createTreeEntryState(childObject,newTreeEntryStateMap,oldTreeEntryStateMap))
        let childrenUpdated = oldTreeEntryState ? !arrayContentsInstanceMatch(newChildStates,oldTreeEntryState.children) : true

        if(!childrenUpdated) newChildStates = null

        //-------------------------------
        //package state, if needed
        //-------------------------------
        let newTreeEntryState
        if((newDataState)||(newUiState)||(newChildStates)) {
            newTreeEntryState = {
                data: newDataState ? newDataState : oldTreeEntryState.data,
                uiState: newUiState ? newUiState : oldTreeEntryState.uiState,
                children: newChildStates ? newChildStates : oldTreeEntryState.children
            } 
        }
        else {
            newTreeEntryState = oldTreeEntryState
        }

        newTreeEntryStateMap[newObject.getId()] = newTreeEntryState

        return newTreeEntryState

    }

}