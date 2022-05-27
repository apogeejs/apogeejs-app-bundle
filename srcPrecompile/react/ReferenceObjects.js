import {TreeEntry} from "./TreeView.js"
import {uiutil} from "/apogeejs-ui-lib/src/apogeeUiLib.js"


/** This file contains the functions to generate the tree objects for the workspace. */

export function ReferencesTreeEntry({referenceManager, openTab}) {

    const childTreeEntries = [
    ]

    var iconUrl = uiutil.getResourcePath(REFERENCES_ICON_PATH,"app");

    return <TreeEntry 
        key={referenceManager.getId()}
        iconSrc={iconUrl} 
        text={REFERENCES_TREE_LABEL} 
        status={referenceManager.getStatus()} 
        childTreeEntries={childTreeEntries} />
}

const REFERENCES_ICON_PATH = "/icons3/folderIcon.png";
const REFERENCES_TREE_LABEL = "Libraries"