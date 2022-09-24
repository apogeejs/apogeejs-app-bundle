import {componentInfo} from "/apogeejs-app-lib/src/apogeeAppLib.js"
import {getComponentTab} from "/apogeejs-app-bundle/src/react/ComponentTab.js"
import arrayContentsInstanceMatch from "/apogeejs-app-bundle/src/viewmanager/arrayContentsInstanceMatch.js"


const componentViewManager = {
    getLabel(component) {
        return component.getName()
    },

    getIconUrl(component) {
        return component.getIconUrl()
    },

    getChildren(workspaceManager,component) {
        if(component.getComponentConfig().isParentOfChildEntries) {
            let modelManager = workspaceManager.getModelManager()
            let parentMember = component.getParentFolderForChildren()
            let childComponents = []
            let childIdMap = parentMember.getChildIdMap()
            for(let childKey in childIdMap) {
                let childMemberId = childIdMap[childKey]
                let childComponentId = modelManager.getComponentIdByMemberId(childMemberId)
                if(childComponentId) {
                    let childComponent = modelManager.getComponentByComponentId(childComponentId)
                    childComponents.push(childComponent)
                }
            }
            return childComponents
        }
        else {
            return []
        }
    },

    /** note - menu items should not change for component updates - call back to apogeeView */
    getMenuItems(apogeeView,component) {
        //menu items
        let menuItems = []
        //open tab
        if(component.getComponentConfig().isParentOfChildEntries) {
            menuItems.push({text: "Open", action: () => apogeeView.openTab(component.getId())})
        }

        //component properties
        menuItems.push({text: "Edit Properties", action: () => apogeeView.updateComponentProperties(component.getId())})
        menuItems.push({text: "Delete", action: () => apogeeView.deleteComponent(component.getId())})

        //add children
        if(component.getComponentConfig().isParentOfChildEntries) {
            let memberParent = component.getParentFolderForChildren()
            const parentComponentConfigs = componentInfo.getParentComponentConfigs()
            parentComponentConfigs.forEach(componentConfig => {
                let childMenuItem = {};
                childMenuItem.text = "Add Child " + componentConfig.displayName
                childMenuItem.action = () => apogeeView.addComponent(componentConfig,memberParent.getId())
                menuItems.push(childMenuItem);
            })
        }

        return menuItems
        
    },

    getTabState(apogeeView,component,oldTabState) { 

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
                (componentConfig) => apogeeView.addComponent(componentConfig,component.getMember().getId()) //we can reuse since it doesn't change
                newTabData.getTabElement = getComponentTab
            dataUpdated = true
        }
        else {
            newTabData = oldTabData
            dataUpdated = false
        }

        //cells state array
        let childrenWithCells = componentViewManager.getChildren(apogeeView.workspaceManager,component).filter(child => (child.getComponentConfig().viewModes !== undefined))
        let oldCellStateArray = oldTabState ? oldTabState.cellStateArray : null
        let newCellStateArray = childrenWithCells.map(child => {
            let oldCellState = oldCellStateArray ? oldCellStateArray.find(cellState => cellState.cellData.id == child.getId()) : null
            return componentViewManager.getCellState(apogeeView,child,oldCellState)
        })

        let stateArrayUpdated = oldCellStateArray ? !arrayContentsInstanceMatch(newCellStateArray,oldCellStateArray) : true

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
    },

    getCellState(apogeeView,component,oldCellState) {

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
            newCellData.menuItems = oldCellData ? oldCellData.menuItems : componentViewManager.getMenuItems(apogeeView,component) //these don't change. Reuse them 
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
                    style: viewModeInfo.tabStyle,
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

export default componentViewManager
