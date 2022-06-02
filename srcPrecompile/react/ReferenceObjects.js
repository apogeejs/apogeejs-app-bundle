import {TreeEntry} from "./TreeView.js"
import {referenceViewConfigList} from "/apogeejs-app-bundle/src/referenceViewConfig.js"
import {uiutil} from "/apogeejs-ui-lib/src/apogeeUiLib.js"


/** This file contains the functions to generate the tree objects for the references. */

export function ReferencesTreeEntry({referenceManager}) {

    const childTreeEntries = referenceViewConfigList.map(referenceViewConfig => 
        <ReferenceListTreeEntry key={referenceViewConfig.referenceType} referenceManager={referenceManager} 
            referenceViewConfig={referenceViewConfig} />)

    var iconUrl = uiutil.getResourcePath(REFERENCES_ICON_PATH,"app");

    return <TreeEntry 
        iconSrc={iconUrl} 
        text={REFERENCES_TREE_LABEL} 
        status={referenceManager.getState()} 
        childTreeEntries={childTreeEntries} />
}

const REFERENCES_ICON_PATH = "/icons3/folderIcon.png";
const REFERENCES_TREE_LABEL = "Libraries"


function ReferenceListTreeEntry({referenceManager, referenceViewConfig}) {

    const app = referenceManager.getApp()

    const menuItems = referenceViewConfig.listMenuItems.map(menuItem => {
        return {
                text: menuItem.text,
                action: () => menuItem.callback(app)
            }
        }
    )

    let entryDataList = referenceManager.getModuleList(referenceViewConfig.referenceType)
    const childTreeEntries = entryDataList.map(entryData => { 
        let referenceEntry = referenceManager.getRefEntryById(entryData.entryId)
        return <ReferenceEntryTreeEntry key={referenceEntry.getId()} app={app} referenceEntry={referenceEntry} referenceViewConfig={referenceViewConfig} />
    })

    var iconUrl = uiutil.getResourcePath(referenceViewConfig.listIconPath,"app");

    return <TreeEntry 
        iconSrc={iconUrl} 
        text={referenceViewConfig.listName} 
        menuItems={menuItems} 
        status={"normal"} 
        childTreeEntries={childTreeEntries} />
}

function ReferenceEntryTreeEntry({app,referenceEntry, referenceViewConfig}) {

    const menuItems = referenceViewConfig.entryMenuItems.map(menuItem => {
        return {
                text: menuItem.text,
                action: () => menuItem.callback(app,referenceEntry)
            }
        }
    )

    var iconUrl = uiutil.getResourcePath(referenceViewConfig.entryIconPath,"app");

    return <TreeEntry 
        key={referenceViewConfig.referenceType}
        iconSrc={iconUrl} 
        text={referenceEntry.getDisplayName()} 
        menuItems={menuItems} 
        status={"normal"} />
}