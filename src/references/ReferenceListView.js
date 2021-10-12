import {uiutil,TreeEntry} from "/apogeejs-ui-lib/src/apogeeUiLib.js";

import ReferenceEntryView from "/apogeejs-app-bundle/src/references/ReferenceEntryView.js";

export default class ReferenceListView {

    constructor(app,viewConfig,viewState) {
        this.app = app;
        this.viewConfig = viewConfig;
        this.referenceType = viewConfig.referenceType;

        this.childViews = {};

        this._setTreeEntry(viewState);
    }

    getViewConfig() {
        return this.viewConfig;
    }

    getTreeEntry() {
        return this.treeEntry;
    }

    onLinkCreated(referenceEntry) {
        let referenceEntryView = new ReferenceEntryView(this.app,referenceEntry,this.viewConfig);
        this.childViews[referenceEntry.getId()] = referenceEntryView;
        this.treeEntry.addChild(referenceEntryView.getTreeEntry());
    }

    onLinkUpdated(referenceEntry) {
        let referenceEntryView = this.childViews[referenceEntry.getId()];
        if(referenceEntryView) {
            referenceEntryView.onLinkUpdated(referenceEntry);
        }
    }

    onLinkDeleted(referenceEntry) {
        let referenceEntryView = this.childViews[referenceEntry.getId()];
        if(referenceEntryView) {
            this.treeEntry.removeChild(referenceEntryView.getTreeEntry());
        }
    }

    getViewState() {
        if(this.treeEntry) {
            return {treeState: this.treeEntry.getState()};
        }
    }

    //===============================================
    // Private Methods
    //===============================================

    _setTreeEntry(viewState) {
        var iconUrl = uiutil.getResourcePath(this.viewConfig.listIconPath,"app");
        var menuItemCallback = () => this._getMenuItems();
        this.treeEntry = new TreeEntry(this.viewConfig.listName, iconUrl, null, menuItemCallback, false);

        if((viewState)&&(viewState.treeState !== undefined)) {
            this.treeEntry.setState(viewState.treeState)
        }
    }

    _getMenuItems() {
        return this.viewConfig.listMenuItems.map(menuItemConfig => {
            let itemInfo = {};
            itemInfo.title = menuItemConfig.text;
            itemInfo.callback = () => menuItemConfig.callback(this.app);
            return itemInfo;
        })
    }
}