import {uiutil,TreeEntry} from "/apogeejs-ui-lib/src/apogeeUiLib.js";
import {componentInfo} from "/apogeejs-app-lib/src/apogeeAppLib.js";
import {addComponent} from "/apogeejs-view-lib/src/apogeeViewLib.js";
import {getComponentViewClass,ERROR_COMPONENT_VIEW_CLASS} from "/apogeejs-view-lib/src/apogeeViewLib.js";

/** This class manages the user interface for a workspace object. */
export default class ModelView {

    constructor(workspaceView,modelManager) {

        //yes these
        this.modelManager = modelManager;
        this.workspaceView = workspaceView;

        this.treeEntry = null;

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

    getTreeEntry() {
        return this.treeEntry;
    }

    getTabFrame() {
        return this.workspaceView.getTabFrame();
    }

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
            let componentViewClass = getComponentViewClass(component.getComponentType());
            let componentView;
            if(componentViewClass) {
                componentView = new componentViewClass(this,component);
            }

            if(!componentView) {
                componentView = new ERROR_COMPONENT_VIEW_CLASS(this,component);
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
            if(model.isFieldUpdated("name")) {
                this.workspaceView.setName(model.getName());
            }
            
            this.modelManager.setViewStateCallback(() => this.getViewState());
        }
        catch(error) {
            if(error.stack) console.error(error.stack);

            apogeeUserAlert("Error updating display for model update: " + error.toString());
        }
    }

    addChildToRoot(componentView) {
        this.treeEntry.addChild(componentView.getTreeEntry());
    }

    removeChildFromRoot(componentView) {
        this.treeEntry.removeChild(componentView.getTreeEntry());
    }

    //====================================
    // properties and display
    //====================================

    getViewState() {
        if(this.treeEntry) {
            return {treeState: this.treeEntry.getState()};
        }
    }

    init() {
        this.treeEntry = this.createTreeEntry();
        this.treeEntry.setState(TreeEntry.EXPANDED);

        let viewState = this.modelManager.getCachedViewState();
        if((viewState)&&(viewState.treeState !== undefined)) {
            this.treeEntry.setState(viewState.treeState)
        }
    }

    createTreeEntry() {

        //menu item callback
        var menuItemCallback = () => {
            //open menu item
            var menuItemList = [];
            var app = this.getApp();
            let initialValues = {parentId: this.getModelManager().getModel().getId()};
            let pageComponents = componentInfo.getPageComponentTypes();
            pageComponents.forEach(pageComponentType => {
                let childMenuItem = {};
                childMenuItem.title = "Add Child " + componentInfo.getComponentDislay(pageComponentType);
                childMenuItem.callback = () => addComponent(this,app,pageComponentType,initialValues);
                menuItemList.push(childMenuItem);
            })

            return menuItemList;
        }

        var iconUrl = uiutil.getResourcePath(ICON_RES_PATH,"app");
        var isRoot = true;
        return new TreeEntry(MODEL_FOLDER_LABEL, iconUrl, null, menuItemCallback, isRoot);
    }

}

let MODEL_FOLDER_LABEL = "Code";

let ICON_RES_PATH = "/icons3/folderIcon.png";   