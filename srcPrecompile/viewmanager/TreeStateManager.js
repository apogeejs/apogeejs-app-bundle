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
        //update the stored state
        this._updateTreeEntryJson(objectId,"opened",opened)

        //recalculate the view state and rerender
        this.updateState()
        this.apogeeView.render()
    }

    //-------------------------
    // Serialization
    //-------------------------

    getStateJson() {
        let stateMapJson = {}
        for(let objectId in this.treeEntryStateMap) {
            let treeEntryState = this.treeEntryStateMap[objectId]
            stateMapJson[objectId] = treeEntryState.uiState
        }
        return stateMapJson
    }

    setStateJson(objectStateMapJson) {
        let stateMapJson = {}
        for(let objectId in objectStateMapJson) {
            stateMapJson[objectId] = objectStateMapJson[objectId].tree
        }
        this.treeEntryJsonMap = stateMapJson

        this.updateState()
    }
    
    //==========================
    // Private Methods
    //==========================
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
                opened = entryJson.opened 
            }
            else if(oldTreeEntryState) {
                opened = oldTreeEntryState.ui.opened
            }
            else if(viewManager.getDefaultJson){
                objectJson = viewManager.getDefaultJson()
                opened =  objectJson.ui ? objectJson.ui.opened : false 
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