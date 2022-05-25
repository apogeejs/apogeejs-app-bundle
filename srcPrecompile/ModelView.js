import {uiutil,TreeEntry} from "/apogeejs-ui-lib/src/apogeeUiLib.js";
import {componentInfo} from "/apogeejs-app-lib/src/apogeeAppLib.js";
import {addComponent} from "/apogeejs-app-bundle/src/commandseq/addcomponentseq.js";
import ComponentView from "/apogeejs-app-bundle/src/componentdisplay/ComponentView.js";
import DocumentParentComponentView from "/apogeejs-app-bundle/src/componentdisplay/DocumentParentComponentView.js";

/** This class manages the user interface for a workspace object. */
export default class ModelView {

    constructor(workspaceView,modelManager) {

        //yes these
        this.modelManager = modelManager;
        this.workspaceView = workspaceView;

        //this.treeEntry = null;

        this.componentViewMap = {};

        this.init();

        //subscribe to events
        let app = this.modelManager.getApp();
        app.addListener("component_created",component => this.onComponentCreated(component));
        app.addListener("component_updated",component => this.onComponentUpdated(component));
        app.addListener("component_deleted",component => this.onComponentDeleted(component));
        app.addListener("modelManager_updated",modelManager => this.onModelManagerUpdated(modelManager));

        this.modelManager.setViewStateCallback(() => this.getViewState());
    }

    /////////////////////////////////////////////
    // REACT STUFF
    getId() { 
        return this.modelManager.getId()
    }
    getName() {
        return MODEL_FOLDER_LABEL
    }

    getStatus() {
        return "normal"
    }

    getIconUrl() {
        return apogeeui.uiutil.getResourcePath(ICON_RES_PATH,"app")
    }

    //tree interface
    hasChildren() {
        // @TODO this is really clumsy - i calcualte the same thing as getting the children
        let count = 0

        let model = this.modelManager.getModel();
        let childIdMap = model.getChildIdMap();
        for(let childKey in childIdMap) {
            let childMemberId = childIdMap[childKey];
            let childComponentView = this.getComponentViewByMemberId(childMemberId);
            if(childComponentView) {
                count++
            }
        }
        
        return count > 0
    }

    getChildren() {
        let childComponentViews = []

        let model = this.modelManager.getModel();
        let childIdMap = model.getChildIdMap();
        for(let childKey in childIdMap) {
            let childMemberId = childIdMap[childKey];
            let childComponentView = this.getComponentViewByMemberId(childMemberId);
            if(childComponentView) {
                childComponentViews.push(childComponentView)
            }
        }
        
        return childComponentViews
    }

    hasMenu() {
        return true
    }

    getMenuItems() {

        var menuItemList = [];
        var app = this.getApp();
        let initialValues = {parentId: this.getModelManager().getModel().getId()};
        let componentConfigs = componentInfo.getComponentConfigs();
        componentConfigs.forEach(componentConfig => {
            if((componentConfig.isParentOfChildEntries)&&(componentConfig.viewModes === undefined)) {
                let childMenuItem = {};
                childMenuItem.text = "Add Child " + componentConfig.displayName;
                childMenuItem.action = () => addComponent(this,app,componentConfig,initialValues);
                menuItemList.push(childMenuItem);
            }
        })

        return menuItemList
    }

    hasTab() { 
        return true
    }

    tabOpened() {
    }

    tabClosed() {
    }

    /** @TODO this is a dummy element for testing the ui */
    getTabElement() {
        return React.createElement("div",{key: this.modelManager.getId()},"This is Tom's tab")
    }

    // END REACT STUFF
    ///////////////////////////////////////////////

    getComponentViewByComponentId(componentId) {
        return this.componentViewMap[componentId];
    }

    getComponentViewByMemberId(memberId) {
        let componentId = this.modelManager.getComponentIdByMemberId(memberId);
        return this.getComponentViewByComponentId(componentId);
    }

    /** This method indicates that parent component displays are present in the UI. */
    hasParentDisplays() {
        return true;
    }

    getApp() {
        return this.workspaceView.getApp();
    }

    getWorkspaceView() {
        return this.workspaceView;
    }

    getModelManager() {
        return this.modelManager;
    }

    closeWorkspace() {
        for(let viewId in this.componentViewMap) {
            let componentView = this.componentViewMap[viewId];
            componentView.closeWorkspace();
        }
    }

    //================================
    // Event handlers
    //================================


    /** This is called on component created events. We only 
     * want to respond to the root folder event here.
     */
    onComponentCreated(component) {
        try {
            //create the component view
            let componentConfig = component.getComponentConfig()
            let componentView
            if(componentConfig.isParentOfChildEntries) {
                componentView = new DocumentParentComponentView(this,component)
            }
            else {
                componentView = new ComponentView(this,component)
            }

            this.componentViewMap[component.getId()] = componentView;


            if(this.hasParentDisplays()) {
                let parentComponent = component.getParentComponent(this.modelManager);
                if(parentComponent) {
                    //add to parent component
                    let parentComponentView = this.getComponentViewByComponentId(parentComponent.getId());
                    if(parentComponentView) {
                        parentComponentView.addChild(componentView);
                        componentView.setLastAssignedParentComponentView(parentComponentView);
                    }
                }
                else { 
                    //this is a root component
                    this.addChildToRoot(componentView)
                }
            }

            //do view state initialization
            componentView.loadViewStateFromComponent();
        }
        catch(error) {
            if(error.stack) console.error(error.stack);

            apogeeUserAlert("Error updating display for created component: " + error.toString());
        }
    }

    onComponentUpdated(component) {
        try {
            let componentView = this.getComponentViewByComponentId(component.getId());
            componentView.componentUpdated(component);
        }
        catch(error) {
            if(error.stack) console.error(error.stack);

            apogeeUserAlert("Error updating display for component: " + error.toString());
        }
    }

    onComponentDeleted(component) {
        try {
            let componentId = component.getId();

            let componentView = this.componentViewMap[componentId];
            if(componentView) {
                componentView.onDelete();

                if(this.hasParentDisplays) {
                    //remove from the parent parent
                    let parentComponentView = componentView.getLastAssignedParentComponentView();
                    if(parentComponentView) {
                        parentComponentView.removeChild(componentView);
                    }
                    else {
                        //this is a root component
                        this.removeChildFromRoot(componentView);
                    }
                }
            }

            delete this.componentViewMap[componentId];
        }
        catch(error) {
            if(error.stack) console.error(error.stack);

            apogeeUserAlert("Error updating display for delete component: " + error.toString());
        }
    }

    onModelManagerUpdated(modelManager) {
        try {
            this.modelManager = modelManager;
            let model = this.modelManager.getModel();
            //(this was to display the name on the workspace tree entry)
            // if(model.isFieldUpdated("name")) {
            //     this.workspaceView.setName(model.getName());
            // }
            
            this.modelManager.setViewStateCallback(() => this.getViewState());
        }
        catch(error) {
            if(error.stack) console.error(error.stack);

            apogeeUserAlert("Error updating display for model update: " + error.toString());
        }
    }

    addChildToRoot(componentView) {
    }

    removeChildFromRoot(componentView) {
    }

    //====================================
    // properties and display
    //====================================

    getViewState() {
    }

    init() {
    }
}

let MODEL_FOLDER_LABEL = "Code";

let ICON_RES_PATH = "/icons3/folderIcon.png";   