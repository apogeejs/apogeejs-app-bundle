import {uiutil,TreeEntry} from "/apogeejs-ui-lib/src/apogeeUiLib.js";

import ReferenceListView from "/apogeejs-app-bundle/src/references/ReferenceListView.js";

export default class ReferenceView {

    constructor(app, referenceManager) {
        this.app = app;
        this.referenceManager = referenceManager;

        //get the view state
        let viewState = this.referenceManager.getCachedViewState();
        let listViewStates = ((viewState)&&(viewState.lists)) ? viewState.lists : {};

        //create the tree entry
        this.treeEntry = this._createTreeEntry(viewState);

        //initailize the child list views
        this.referenceListViews = {};
        let referenceClassArray = referenceManager.constructor.getReferenceClassArray();
        referenceClassArray.forEach( referenceClass => {
            let entryType = referenceClass.REFERENCE_TYPE;
            let referenceListView = this._createReferenceListView(entryType,listViewStates[entryType]); 
            this.referenceListViews[entryType] = referenceListView;
            let childTreeEntry = referenceListView.getTreeEntry();
            this.treeEntry.addChild(childTreeEntry);
        });

        app.addListener("referenceEntry_created",referenceEntry => this._onLinkCreated(referenceEntry));
        app.addListener("referenceEntry_updated",referenceEntry => this._onLinkUpdated(referenceEntry));
        app.addListener("referenceEntry_deleted",referenceEntry => this._onLinkDeleted(referenceEntry));
        app.addListener("referenceManager_updated",referenceManager => this._onReferenceManagerUpdated(referenceManager));

        this.referenceManager.setViewStateCallback(() => this.getViewState());
    }

    /** This returns the tree entry to display the reference entry for this reference manager. */
    getTreeEntry() {
        return this.treeEntry;
    }

    closeWorkspace() {
        //no action in ui for references
    }

    static setReferenceViewConfigMap(referenceViewConfigMap) {
        ReferenceView.referenceViewConfigMap = referenceViewConfigMap
    }

    //-----------------------------------
    // Save methods
    //-----------------------------------
    
    getViewState() {
        let json = {};
        json.treeState = this.treeEntry.getState();
        json.lists = {};
        for(let entryType in this.referenceListViews) {
            let referenceList = this.referenceListViews[entryType];
            json.lists[entryType] = referenceList.getViewState();
        }
        return json;
    }

    //==================================
    // Private Methods
    //==================================

    _onLinkCreated(referenceEntry) {
        try {
            let referenceList = this.referenceListViews[referenceEntry.getEntryType()];
            if(referenceList) {
                referenceList.onLinkCreated(referenceEntry);
            }
        }
        catch(error) {
            if(error.stack) console.error(error.stack);

            apogeeUserAlert("Error updating display for created reference entry: " + error.toString());
        }
    }

    _onLinkUpdated(referenceEntry) {
        try {
            let referenceList = this.referenceListViews[referenceEntry.getEntryType()];
            if(referenceList) {
                referenceList.onLinkUpdated(referenceEntry);
            }
        }
        catch(error) {
            if(error.stack) console.error(error.stack);

            apogeeUserAlert("Error updating display for created reference entry: " + error.toString());
        }
    }

    _onLinkDeleted(referenceEntry) {
        try {
            let referenceList = this.referenceListViews[referenceEntry.getEntryType()];
            referenceList.onLinkDeleted(referenceEntry);
        }
        catch(error) {
            if(error.stack) console.error(error.stack);

            apogeeUserAlert("Error updating display for reference entry: " + error.toString());
        }
    }

    _onReferenceManagerUpdated(referenceManager) {
        try {
            this.referenceManager = referenceManager;
            this.referenceManager.setViewStateCallback(() => this.getViewState());
        }
        catch(error) {
            if(error.stack) console.error(error.stack);

            apogeeUserAlert("Error updating display for deleted reference entry: " + error.toString());
        }
    }

    /** @private */
    _createTreeEntry(viewState) {
        var iconUrl = uiutil.getResourcePath(REFERENCES_ICON_PATH,"app");
        let treeEntry = new TreeEntry("Libraries", iconUrl, null, null, false);

        if((viewState)&&(viewState.treeState !== undefined)) {
            treeEntry.setState(viewState.treeState)
        }

        return treeEntry;
    }

    _createReferenceListView(entryType,viewState) {
        let listDisplayInfo = ReferenceView.referenceViewConfigMap[entryType];
        if(!listDisplayInfo) {
            apogeeUserAlert(`Error: The display for the reference type ${entryType} was not found!`)
        }
        return new ReferenceListView(this.app,entryType,listDisplayInfo,viewState);
    }

}

let REFERENCES_ICON_PATH = "/icons3/folderIcon.png";

//these are the reference views we have
ReferenceView.referenceViewConfigMap = {};

/** This is the UI definition data for the added reference lists.
 * This should be placed somewhere else to make it easier for people to 
 * add additional reference types.
 */
let LIST_DISPLAY_INFO = {

    "css link": {
        "REFERENCE_TYPE": "css link",
        "LIST_NAME": "CSS Links",
        "DISPLAY_NAME":"CSS Link",
        "PROPERTY_FORM_LAYOUT": [
            {
                "type": "textField",
                "label": "URL: ",
                "key": "url",
                "size": 100
            },
            {
                "type": "textField",
                "label": "Display Name: ",
                "key": "name",
                "hint": "optional",
                "size": 25
            }
        ],
        "LIST_ICON_PATH":"/icons3/folderIcon.png",
        "ENTRY_ICON_PATH": "/icons3/cssLinkIcon.png"
    },

    "npm module": {
        "REFERENCE_TYPE": "npm module",
        "LIST_NAME": "NPM Modules",
        "DISPLAY_NAME":"NPM Module",
        "FORM_BODY": [
        ],
        "LIST_ICON_PATH":"/icons3/folderIcon.png",
        "ENTRY_ICON_PATH":"/icons3/npmModuleIcon.png"
    },

    "es module": {
        "REFERENCE_TYPE": "es module",
        "LIST_NAME": "ES Modules",
        "DISPLAY_NAME":"ES Module",
        "PROPERTY_FORM_LAYOUT": [
            {
                "type": "textField",
                "label": "Module Name: ",
                "key": "name",
                "hint": "name to use in loadModule()",
                "size": 50
            },
            {
                "type": "textField",
                "label": "URL: ",
                "key": "url",
                "size": 100
            }
        ],
        "LIST_ICON_PATH":"/icons3/folderIcon.png",
        "ENTRY_ICON_PATH":"/icons3/esModuleIcon.png"
    },
    "js link": {
        "REFERENCE_TYPE": "js link",
        "LIST_NAME": "JS Scripts",
        "DISPLAY_NAME":"JS Script Link",
        "PROPERTY_FORM_LAYOUT": [
            {
                "type": "textField",
                "label": "URL: ",
                "key": "url",
                "size": 100
            },
            {
                "type": "textField",
                "label": "Display Name: ",
                "key": "name",
                "hint": "optional",
                "size": 25
            }
        ],
        "LIST_ICON_PATH":"/icons3/folderIcon.png",
        "ENTRY_ICON_PATH":"/icons3/jsLinkIcon.png"
    }
}

//if this is used, replace the reference type and list name
let DEFAULT_LIST_DISPLAY_INFO = {
    "REFERENCE_TYPE": "PUT THE ENTRY TYPE HERE!",
    "LIST_NAME": "PUT THE LIST NAME HERE!",
    "DISPLAY_NAME":"PUT THE DISPLAY NAME HERE!",
    "FORM_BODY": [
        {
            type: "textField",
            label: "URL: ",
            size: 100,
            key: "url"
        },
        {
            type: "textField",
            label: "Display Name: ",
            size: 50,
            key: "nickname"
        }
    ],
    "LIST_ICON_PATH":"/icons3/folderIcon.png",
    "ENTRY_ICON_PATH":"/icons3/javascriptLink.png"
}

