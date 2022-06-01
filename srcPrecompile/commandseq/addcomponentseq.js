import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";
import {validateMemberName} from "/apogeejs-model-lib/src/apogeeModelLib.js"; 

import {getPropertiesDialogLayout,getPropertyJsons} from "/apogeejs-app-bundle/src/commandseq/updatecomponentseq.js";
import {showConfigurableDialog} from "/apogeejs-ui-lib/src/apogeeUiLib.js";

//=====================================
// UI Entry Point
//=====================================

/** This functions initiates the add component action. It will create a dialog for the user to enter the relevent 
 * properties, with the values optionalInitialProperties preset.  */   
export function addComponent(app,componentConfig,optionalInitialProperties) {

        //get the active workspace
        var workspaceManager = app.getWorkspaceManager();
        if(!workspaceManager) {
            apogeeUserAlert("There is no open workspace.");
            return;
        }     

        var modelManager = workspaceManager.getModelManager();
        if(!modelManager) {
            apogeeUserAlert("The workspace has not been loaded yet.");
            return;
        }    

        //this is not a true test - the workspace and model can be presenet ith out the model loaded.

        
        //get the tyep display name
        var displayName = componentConfig.displayName;
        
        //get the folder list
        let includeRootFolder = ((componentConfig.isParentOfChildEntries)&&(componentConfig.viewModes === undefined));
        var parentList = modelManager.getParentList(includeRootFolder);
        
        //create the dialog layout - do on the fly because folder list changes
        var additionalLines = [];
        //var initialFormValues = _getBasePropertyValues(component);
        if(componentConfig.propertyDialogEntries) {
            componentConfig.propertyDialogEntries.forEach(entry => {
                let entryCopy = apogeeutil.jsonCopy(entry.dialogElement);
                additionalLines.push(entryCopy);
            }); 
        }
        var dialogLayout = getPropertiesDialogLayout(displayName,parentList,additionalLines,true,optionalInitialProperties);

        //we will populate the parent if we need to insert thenew component as a child in the parent document. 
        
        
        //create on submit callback
        var onSubmitFunction = function(userInputFormValues) {
            
            //validate the name
            var nameResult = validateMemberName(userInputFormValues.name);
            if(!nameResult.valid) {
                apogeeUserAlert(nameResult.errorMessage);
                return false;
            }

            //other validation of inputs?

//we should do this cleaner - by storing parent id in the submit input
            let parentId = userInputFormValues.parentId;
            let modelIsParent = (modelManager.getModel().getId() == parentId);

            let commandsDeleteComponent = false;
            let deleteMsg;
            let commands = [];
            
            //create the command
            let {memberJson, componentJson} = getPropertyJsons(componentConfig,null,componentConfig.propertyDialogEntries,userInputFormValues);

            let createCommandData = {};
            createCommandData.type = "addComponent";
            createCommandData.parentId = parentId;
            createCommandData.memberJson = memberJson
            createCommandData.componentJson = componentJson;

            //editor related commands
            let additionalCommandInfo;
         
            //store create command
            commands.push(createCommandData);

            //add the editor insert command
            if((additionalCommandInfo)&&(additionalCommandInfo.editorAddCommand)) {
                commands.push(additionalCommandInfo.editorAddCommand);
            }
            
            let commandData;
            if(commands.length > 1) {
                commandData = {};
                commandData.type = "compoundCommand";
                commandData.childCommands = commands;
            }
            else if(commands.length === 1) {
                commandData = commands[0];
            }
            else {
                //this shouldn't happen
                return;
            }
            
            //execute command
            let doAction = () => {
                app.executeCommand(commandData);

                //give focus back to editor
                // if(parentComponentView) {
                //     parentComponentView.giveEditorFocusIfShowing();
                // }
            }

            if(commandsDeleteComponent) {
                //if there is a delete, verify the user wants to do this
                let cancelAction = () => {
                    //give focus back to editor
                    // if(parentComponentView) {
                    //     parentComponentView.giveEditorFocusIfShowing();
                    // }
                };
                apogeeUserConfirm(deleteMsg,"OK","Cancel",doAction,cancelAction);
            }
            else {
                //otherwise just take the action
                doAction();
            }

            //return true to close the dialog
            return true;

        }

        //give foxus back to editor
        let onCancelFunction = () => null; /*parentComponentView.giveEditorFocusIfShowing() - oops no parent component*/;
        
        //show dialog
        showConfigurableDialog(dialogLayout,onSubmitFunction,onCancelFunction);
}
