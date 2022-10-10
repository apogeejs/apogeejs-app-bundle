import componentViewManager from "/apogeejs-app-bundle/src/viewmanager/componentViewManager.js"
import arrayContentsInstanceMatch from "/apogeejs-app-bundle/src/viewmanager/arrayContentsInstanceMatch.js"

export default class CellStateManager {

    constructor(apogeeView) {
        this.apogeeView = apogeeView
        this.cellStateMap = {}
        this.cellJsonMap = {}
    }

    getState(objectId) {
        let workspaceObject = this.apogeeView.getWorkspaceObject(objectId)
        let oldCellState = this.cellStateMap[objectId]
        let cellStateJson = this.cellJsonMap[objectId]
        if(workspaceObject) {
            if(cellStateJson) {
                //remove the cellStateJson once we apply it
                delete this.cellJsonMap[objectId]
            }

            let newCellState = this._createCellState(objectId,oldCellState,cellStateJson)
            this.cellStateMap[objectId] = newCellState

            return newCellState
        }
        else {
            //object not found - remove cached states
            if(oldCellState) delete this.cellStateMap[objectId]
            if(cellStateJson) delete this.cellJsonMap[objectId]
            return null
        }
    }

    //----------------------------------
    // State Change Functions
    //----------------------------------

    /** This opens/closes the view of the given name for the given object */
    setOpened(objectId,viewModeName,opened) {
        //get the current cell json
        //if none if found, create one by loading from the active state
        let oldCellJson = this.cellJsonMap[objectId]
        let newCellJson
        if(oldCellJson) {
            newCellJson = this._copyCellJson(oldCellJson)
        }
        else {
            //create cell json, whether or not we have an associated active cell state data 
            newCellJson = this._createCellJson(objectId,false)
        }

        if(!newCellJson) {
            //not a valid object id
            return
        }

        let cellJsonUpdated = false
        if(opened) {
            //insert a view into opened array
            if(!newCellJson.opened.includes(viewModeName)) {
                newCellJson.opened.push(viewModeName)
                cellJsonUpdated = true
            }
        }
        else {
            //remove view from opened array
            let index = newCellJson.opened.indexOf(viewModeName)
            if(index >= 0) {
                newCellJson.opened.splice(index,1)
                cellJsonUpdated = true
            }
        }


        if(cellJsonUpdated) {
            this.cellJsonMap[objectId] = newCellJson

            this._updateState()
            this.apogeeView.render()
        }
    }

    //----------------------------------
    // Serialization
    //----------------------------------

    setStateJson(stateJson) {
        this.cellJsonMap = stateJson
        
        this._updateState()
        this.apogeeView.render()
    }

    getStateJson() {
        let stateJson = {}
        let addCellJson = workspaceObject => {
            let objectId = workspaceObject.getId()
            let cellJson = this.cellJsonMap[objectId]
            if(cellJson) {
                stateJson[objectId] = cellJson
            }
            else {
                //create a cell json, only if we have active state info present
                cellJson = this._createCellJson(objectId,true)
                if(cellJson) {
                    stateJson[objectId] = cellJson
                }
            }
        }
        this.apogeeView.runOverAllWorkspaceObjects(addCellJson)

        return stateJson
    }

    //===============================
    // Private Methods
    //===============================

    /** This does an update to all the view cell state, by calling for 
     * un update to the complete tab list state. */
    _updateState() {
        //update the state of the tab list
        let tabListStateManager = this.apogeeView.getTabListStateManager()
        tabListStateManager.updateState()
    }

    /** This creates a cell json, loading the current state. It may return null if 
     * this given object is not a component with a cell.
     */
    _createCellJson(objectId,onlyWithState) {
        //lookup component - make sure this is a component with a cell
        let component = this.apogeeView.getWorkspaceObject(objectId)
        let componentConfig
        if( (component)&&(component.getFieldObjectType() == "component") ) {
            componentConfig = component.getComponentConfig()
        }
        if(!componentConfig || !componentConfig.viewModes) {
            //not a component with a cell
            return null
        }

        let cellJson = {}

        //see if we have any active cell state for this id
        let cellState = this.cellStateMap[objectId]

        //is we flag "only with state", we will only create the cell json if we have state info
        if( !cellState && onlyWithState ) return null

        //we only have one state item in the json now - opened
        cellJson.opened = []
        if(cellState.viewModeControlStates) {
            cellState.viewModeControlStates.forEach( (viewModeControlState,viewModeIndex) => {
                let viewModeInfo = componentConfig.viewModes[viewModeIndex]
                if(viewModeControlState.opened) cellJson.opened.push(viewModeInfo.name)
            })
        }
        
        return cellJson
    }

    /** The creates a shallow copy of the cellJson, such as so it can be udpated with a modified state. */
    _copyCellJson(cellJson) {
        let newCellJson = {}
        Object.apply(newCellJson,cellJson)
        return newCellJson
    }
    
    _createCellState(componentId,oldCellState,cellStateJson) {
        //for now, only components can have cells. And I can't imagine why something else would (even if we add other types of tabs)
        let component = this.apogeeView.getWorkspaceObject(componentId)
        let displayName = component.getDisplayName()
        let status = component.getState()
        let statusMessage = component.getStateMessage()

        //get new cell data
        let newCellData
        let oldCellData = oldCellState ? oldCellState.cellData : null
        let dataUpdated
        if((!oldCellData)||(displayName != oldCellData.displayName)||(status != oldCellData.status)||(statusMessage != oldCellData.statusMessage)) {
            newCellData = {}
            newCellData.id = componentId
            newCellData.displayName = displayName
            newCellData.iconSrc = oldCellData ? oldCellData.iconSrc : component.getIconUrl()
            newCellData.status = status
            newCellData.statusMessage = statusMessage
            newCellData.componentTypeName = component.getComponentConfig().displayName
            newCellData.menuItems = oldCellData ? oldCellData.menuItems : componentViewManager.getMenuItems(this.apogeeView,component) //these don't change. Reuse them 
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
            if((!oldViewModeControlState)||(oldViewModeControlState.hidden != sourceState.hidden)||(cellStateJson)) {

                let isOpened
                if(cellStateJson && cellStateJson.opened) {
                    isOpened = cellStateJson.opened.includes(viewModeInfo.name)
                }
                else {
                    isOpened = oldViewModeControlState ? oldViewModeControlState.opened : viewModeInfo.isActive
                }

                newViewModeControlState = {
                    hidden: sourceState.hidden,
                    name: viewModeInfo.label,
                    style: viewModeInfo.tabStyle,
                    opened: isOpened,
                    setOpened: oldViewModeControlState ? oldViewModeControlState.setOpened : opened => this.setOpened(componentId,viewModeInfo.name,opened)
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
                newViewModeState.viewModeInfo = viewModeInfo
                newViewModeState.sourceState = sourceState
            }
            else {
                newViewModeState = oldViewModeState
            }
            newViewModeStates[index] = newViewModeState

        })

        //get new cell state
        let vmcsUpdated = oldViewModeControlStates ? !arrayContentsInstanceMatch(newViewModeControlStates,oldViewModeControlStates) : true
        let vmsUpdated = oldViewModeStates ? !arrayContentsInstanceMatch(newViewModeStates,oldViewModeStates) : true

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
}

