import workspaceViewManager from "/apogeejs-app-bundle/src/viewmanager/workspaceViewManager.js"
import modelViewManager from "/apogeejs-app-bundle/src/viewmanager/modelViewManager.js"
import componentViewManager from "/apogeejs-app-bundle/src/viewmanager/componentViewManager.js"
import referenceViewManager from "/apogeejs-app-bundle/src/viewmanager/referenceViewManager.js"
import {referenceEntryViewManager, referenceListViewManager} from "/apogeejs-app-bundle/src/viewmanager/referenceTypeViewManagers.js"

export function getViewManagerByObject(workspaceObject) {
    return getViewManagerByType(workspaceObject.getFieldObjectType())
}

export function getViewManagerByType(workspaceObjectType) {
    switch (workspaceObjectType) {
        case "workspaceManager":
            return workspaceViewManager

        case "modelManager":
            return modelViewManager

        case "component":
            return componentViewManager

        case "referenceManager":
            return referenceViewManager

        case "referenceList":
            return referenceListViewManager

        case "referenceEntry":
            return referenceEntryViewManager
            
        default:
            throw new Error("Unrecognized workspace object: " + workspaceObjectType)

    }
}

