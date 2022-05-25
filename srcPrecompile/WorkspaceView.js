import {uiutil} from "/apogeejs-ui-lib/src/apogeeUiLib.js";

import {updateWorkspaceProperties} from "/apogeejs-app-bundle/src/commandseq/updateworkspaceseq.js";

import ReferenceView from "/apogeejs-app-bundle/src/references/ReferenceView.js";
import ModelView from "/apogeejs-app-bundle/src/ModelView.js";

/** This class manages the user interface for a workspace object. */
export default class WorkspaceView {

    constructor(workspaceManager,appView) {

        //yes these
        this.workspaceManager = workspaceManager;
        this.app = workspaceManager.getApp();
        this.appView = appView;
        this.modelView = null;

        this.init();

        this.app.addListener("workspaceManager_updated",workspaceManager => this.onWorkspaceUpdated(workspaceManager));

        //Thisis used to retieve UI state to save when the app is being saved
        this.workspaceManager.setViewStateCallback(() => this.getViewState());
    }

    /////////////////////////////////////////////
    // REACT STUFF
    getId() {
        return this.workspaceManager.getId()
    }
    getName() {
        let modelManager = this.workspaceManager.getModelManager()
        let model = modelManager.getModel()
        return model ? model.getName() : Workspace_OPENING_NAME
    }
    getStatus () {
        return "normal"
    }
    getIconUrl() {
        return uiutil.getResourcePath(ICON_RES_PATH,"app")
    }

    //tree interface
    hasChildren() {
        return true
    }

    getChildren() {
        return [this.modelView]
    }

    hasMenu() {
        return true
    }

    getMenuItems() {
        return [
            {text: "Edit Properties", action: () => updateWorkspaceProperties(this.getWorkspaceManager()) },
            {text: "Print Dependencies", action: () => this.showDependencies() }
        ]
    }

    hasTab() {
        return false
    }

    // END REACT STUFF
    ///////////////////////////////////////////////

    getModelView() {
        return this.modelView;
    }

    getApp() {
        return this.app;
    }

    getWorkspaceManager() {
        return this.workspaceManager;
    }

    /** This method takes any actions on workspace close. */
    close() {
        if(this.modelView) {
            this.modelView.closeWorkspace();
        }
        if(this.referenceView) {
            this.referenceView.closeWorkspace();
        }
    }

    onWorkspaceUpdated(workspaceManager) {
        try {
            this.workspaceManager = workspaceManager;
            this.workspaceManager.setViewStateCallback(() => this.getViewState());
            
            //@TODO should this go somwhere else?
            // @TODO FIX THIS!!! - the downstream components are not updated yet.
            setTimeout(() => this.appView.render(),10)
            //this.appView.render()
        }
        catch(error) {
            if(error.stack) console.error(error.stack);

            apogeeUserAlert("Error updating display for workspace update: " + error.toString());
        }
    }

    //====================================
    // properties and display
    //====================================

    /** Thie methor retrieves a serialized UI state, to be used during save. */
    getViewState() {
    }

    init() {
        //model manager
        this.modelView = new ModelView(this,this.workspaceManager.getModelManager());

        //reference mamageger
        this.referenceView = new ReferenceView(this.app,this.workspaceManager.getReferenceManager());

        //set the view state
        let viewState = this.workspaceManager.getCachedViewState();

        if((viewState)&&(viewState.treeState !== undefined)) {
            //(initialize tree open close??)
        }
        else {
            //(initialize tree open close??)
        }
    }
}

const Workspace_OPENING_NAME = "opening...";

const ICON_RES_PATH = "/icons3/workspaceIcon.png";   