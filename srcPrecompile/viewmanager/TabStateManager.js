import {getViewManagerByObject} from "/apogeejs-app-bundle/src/viewmanager/getViewManager.js"

export default class TabStateManager {

    constructor(apogeeView) {
        this.apogeeView = apogeeView
        this.tabStateMap = {}

        //no tab state json for now
    }

    getState(objectId) {
        let workspaceObject = this.apogeeView.getWorkspaceObject(objectId)
        if(workspaceObject) {
            
            //get new tab state
            let oldTabState = this.tabStateMap[objectId]
            let viewManager = getViewManagerByObject(workspaceObject)
            let newTabState = viewManager.getTabState(this.apogeeView,workspaceObject,oldTabState)
            if(newTabState) {
                this.tabStateMap[objectId] = newTabState
                return newTabState
            }
        }

        //we failed to get a valid tab state
        delete this.tabStateMap[objectId]
        return null
    }

    setStateJson(stateJson) {

    }

    getStateJson() {
        return {}
    }

}