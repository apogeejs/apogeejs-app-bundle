import {uiutil,TreeEntry} from "/apogeejs-ui-lib/src/apogeeUiLib.js";

export default class ReferenceEntryView {

    constructor(app,referenceEntry,viewConfig) {
        this.app = app;
        this.referenceEntry = referenceEntry;
        this.viewConfig = viewConfig;
        this.treeEntry = this._createTreeEntry();
    }


/** This method loads the link onto the page. It returns a promise that
     * resolves when the link is loaded. */
    getTreeEntry() {
        return this.treeEntry;
    }

    onLinkUpdated(referenceEntry) {
        //make sure this is the right entry 
        if(referenceEntry.getId() != this.referenceEntry.getId()) return;
        
        this.referenceEntry = referenceEntry;
        if(referenceEntry.isFieldUpdated("data")) {
            var displayName = this.referenceEntry.getDisplayName();
            if(!displayName) displayName = this.referenceEntry.getId();
            this.treeEntry.setLabel(displayName);
        }

        if((referenceEntry.isFieldUpdated("state"))||(referenceEntry.isFieldUpdated("stateMsg"))) {
            this.treeEntry.setBannerState(this.referenceEntry.getState(),this.referenceEntry.getStateMsg());
        }
    }

    //===========================================
    // Private Methods
    //===========================================

    _createTreeEntry() {
        var iconUrl = uiutil.getResourcePath(this.viewConfig.entryIconPath,"app");
        var displayName = this.referenceEntry.getDisplayName();
        var menuItemsCallback = () => this._getMenuItems();

        var treeEntry = new TreeEntry(displayName, iconUrl, null, menuItemsCallback, false);
        treeEntry.setBannerState(this.referenceEntry.getState(),this.referenceEntry.getStateMsg());
        return treeEntry;
    }

    _getMenuItems() {
        return this.viewConfig.entryMenuItems.map(menuItemConfig => {
            let itemInfo = {};
            itemInfo.title = menuItemConfig.text;
            itemInfo.callback = () => menuItemConfig.callback(this.app,this.referenceEntry);
            return itemInfo;
        })
    }

}