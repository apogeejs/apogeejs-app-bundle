import arrayContentsInstanceMatch from "/apogeejs-app-bundle/src/viewmanager/arrayContentsInstanceMatch.js"
import {getViewManagerByObject} from "/apogeejs-app-bundle/src/viewmanager/getViewManager.js"

export default class TreeState {

    constructor(apogeeView) {
        this.apogeeView = apogeeView
        this.workspaceTreeState = null
        this.treeEntryStateMap = {}
    }


    getState() {
        return this.workspaceTreeState
    }

    updateState(workspaceManager,oldObjectMap) {
        let oldTreeEntryStateMap = this.treeEntryStateMap
        let newTreeEntryStateMap = {}

        if(workspaceManager) {
            this.workspaceTreeState = this._createTreeEntryState(this.apogeeView,workspaceManager,oldObjectMap,newTreeEntryStateMap,oldTreeEntryStateMap)
        }

        this.treeEntryStateMap = newTreeEntryStateMap
    }

    getStateJson() {
        return null
    }

    setStateJson(stateJson) {

    }

    
    _createTreeEntryState(apogeeView,newObject,oldObjectMap,newTreeEntryStateMap,oldTreeEntryStateMap) {
            
        //I am storing the old object and old state to facilitate change comparisons

        const oldObject = oldObjectMap[newObject.getId()]
        const oldTreeEntryState = oldTreeEntryStateMap[newObject.getId()]
        const viewManager = getViewManagerByObject(newObject)

        // check for "data" updates
        let dataUpdated = false
        let newData
        if(newObject != oldObject) {
            let label = viewManager.getLabel(newObject)
            let nameUpdated = (!oldTreeEntryState) || (oldTreeEntryState.data.text == label)
            let statusUpdated = (!oldTreeEntryState) || (oldTreeEntryState.data.status == newObject.getState())
            let statusMsgUpdated = (!oldTreeEntryState) || (oldTreeEntryState.data.statusMsg == newObject.getStateMessage())
            dataUpdated = (nameUpdated)||(statusUpdated)||(statusMsgUpdated)
            if(dataUpdated) {
                newData = {
                    id: newObject.getId(),
                    text: label,
                    iconSrc: oldTreeEntryState ? oldTreeEntryState.data.iconSrc : viewManager.getIconUrl(newObject), //doesn't change
                    status: newObject.getState(),
                    statusMsg: newObject.getStateMessage(),
                    menuItems: oldTreeEntryState ? oldTreeEntryState.data.menuItems : viewManager.getMenuItems(apogeeView,newObject) //doesn't change
                }
            }
        }

        //uiState is not updated here

        //check for children updates
        let children = viewManager.getChildren(apogeeView.getWorkspaceManager(),newObject)
        let newChildTreeEntries = children.map(childObject => this._createTreeEntryState(apogeeView,childObject,oldObjectMap,newTreeEntryStateMap,oldTreeEntryStateMap))
        let childrenUpdated = oldTreeEntryState ? !arrayContentsInstanceMatch(newChildTreeEntries,oldTreeEntryState.childTreeEntries) : true

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

}