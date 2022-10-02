import workspaceViewManager from "/apogeejs-app-bundle/src/viewmanager/workspaceViewManager.js"
import modelViewManager from "/apogeejs-app-bundle/src/viewmanager/modelViewManager.js"
import componentViewManager from "/apogeejs-app-bundle/src/viewmanager/componentViewManager.js"
import referenceViewManager from "/apogeejs-app-bundle/src/viewmanager/referenceViewManager.js"
import {referenceEntryViewManager, referenceListViewManager} from "/apogeejs-app-bundle/src/viewmanager/referenceTypeViewManagers.js"

export function getViewManagerByObject(workspaceObject) {
    return getViewManagerByType(workspaceObject.getWorkspaceObjectType())
}

export function getViewManagerByType(workspaceObjectType) {
    switch (workspaceObjectType) {
        case "WorkspaceManager":
            return workspaceViewManager

        case "ModelManager":
            return modelViewManager

        case "Component":
            return componentViewManager

        case "ReferenceManager":
            return referenceViewManager

        case "ReferenceList":
            return referenceListViewManager

        case "ReferenceEntry":
            return referenceEntryViewManager
            
        default:
            throw new Error("Unrocgnized workspace object: " + workspaceObject.getWorkspaceObjectType())

    }
}

