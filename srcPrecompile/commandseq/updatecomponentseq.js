import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";
import {validateMemberName} from "/apogeejs-model-lib/src/apogeeModelLib.js"; 
import {Component} from "/apogeejs-app-lib/src/apogeeAppLib.js"; 

import {showConfigurableDialog} from "/apogeejs-ui-lib/src/apogeeUiLib.js";

//=====================================
// UI Entry Point
//=====================================

/** This method gets a callback to update the properties of a component. */
export function updateComponentProperties(component) {

    var app = component.getApp();
    var modelManager = app.getModelManager(); 
    var componentConfig = component.getComponentConfig();

    var additionalLines = [];
    var initialFormValues = _getBasePropertyValues(component);
    if(componentConfig.propertyDialogEntries) {
        componentConfig.propertyDialogEntries.forEach(entry => {
            let entryCopy = apogeeutil.jsonCopy(entry.dialogElement);
            initialFormValues[entry.dialogElement.key] = _getDialogValue(component,entry);
            additionalLines.push(entryCopy);
        }); 
    }

    // add the folders to which we can move this (only allow parents without being a child entry in the root))
    let includeRootFolder = ((componentConfig.isParentOfChildEntries)&&(componentConfig.viewModes === undefined));
    var parentList = modelManager.getParentList(includeRootFolder);

    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = getPropertiesDialogLayout(componentConfig.displayName,parentList,additionalLines,false,initialFormValues);

    //create on submit callback
    var onSubmitFunction = function(submittedFormValues) {
        
        //get the changed values
        var newFormValues = {};
        for(var key in initialFormValues) {
            if(!_.isEqual(initialFormValues[key],submittedFormValues[key])) {
                newFormValues[key] = submittedFormValues[key];
            }
        }
        
        var commands = [];
        
        //--------------
        // Update Properties
        //--------------

        if(componentConfig.propertyDialogEntries) {
            let {memberJson, componentJson} = getPropertyJsons(componentConfig,component,componentConfig.propertyDialogEntries,newFormValues);
            if((memberJson)||(componentJson)) {
                let updateCommand = {};
                updateCommand.type = "updateComponentProperties";
                updateCommand.memberId = component.getMemberId();
                updateCommand.updatedMemberProperties = memberJson;
                updateCommand.updatedComponentProperties = componentJson;
                commands.push(updateCommand)
            }
        }
        
        //--------------
        // Move
        //--------------
        
        if((newFormValues.name)||(newFormValues.parentId)) {
            
            //validate the name
            if(newFormValues.name) {
                var nameResult = validateMemberName(newFormValues.name);
                if(!nameResult.valid) {
                    apogeeUserAlert(nameResult.errorMessage);
                    return false;
                }
            }

            //update the component name
            let moveCommand = {};
            moveCommand.type = "moveComponent";
            moveCommand.memberId = component.getMemberId();
            moveCommand.newMemberName = submittedFormValues.name;
            moveCommand.newParentId = newFormValues.parentId;
            commands.push(moveCommand);
        }
        
        //---------------
        // combine commands (as needed)
        //---------------

        var command;
        
        if(commands.length > 1) {
            //make a compound command
            command = {};
            command.type = "compoundCommand";
            command.childCommands = commands;
        }
        else if(commands.length === 1) {
            command = commands[0];
        }
        
        //command action
        let doAction = () => {
            if(command) {   
                app.executeCommand(command);
            }
        }

        doAction();

        //return true to close the dialog
        return true;
    }

    //return focus to editor on cancel
    let onCancelFunction = () => undefined //returnToEditor(componentView);

    //show dialog
    showConfigurableDialog(dialogLayout,onSubmitFunction,onCancelFunction);
}

//========================
// dialog setup - this is shared with add component since it is the same basic action
//========================

//this is for a create or update dialog
//omit folder names (null) and folder initial value to omit the parent selection
export function getPropertiesDialogLayout(displayName,folderNames,additionalLines,doCreate,initialFormValues) { 
    
    //create the dialog layout - do on the fly because folder list changes
    var dialogLayout = {};
    var lines = [];
    dialogLayout.layout = lines;

    var titleLine = {};
    titleLine.type = "heading";
    if(doCreate) {
        titleLine.text = "New " + displayName;
    }
    else {
        titleLine.text = "Update " + displayName; 
    }
    titleLine.level = 3;
    lines.push(titleLine);

    if(folderNames) {
        var parentLine = {};
        parentLine.type = "dropdown";
        parentLine.label = "Parent Page: ";
        parentLine.entries = folderNames;
        parentLine.key = "parentId"; 
        if(doCreate) {
            parentLine.state = "disabled";
        }
        lines.push(parentLine);
    }

    var nameLine = {};
    nameLine.type = "textField";
    nameLine.label = "Name: ";
    nameLine.size = 40,
    nameLine.key = "name";
    nameLine.focus = true;
    lines.push(nameLine);
    
    //add additioanl lines, if applicable
    if(additionalLines) {
        for(var i = 0; i < additionalLines.length; i++) {
            lines.push(additionalLines[i]);
        }
    }

    //submit
    // var submitLine = {};
    // submitLine.type = "submit";
    // if(doCreate) {
    //     submitLine.submit = "Create";
    // }
    // else {
    //     submitLine.submit = "Update";
    // }
    // submitLine.cancel = "Cancel";
    // lines.push(submitLine);
    
    //set the initial values
    if(initialFormValues) {
        for(var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if((line.key)&&(initialFormValues[line.key] !== undefined)) {
                line.value = initialFormValues[line.key];
            }
        }
    }
    
    return dialogLayout;
}


//===========================
// Property Value Lookup
//===========================
function _getBasePropertyValues(component) {
    let basePropertyValues = {};
    let member = component.getField("member");
    basePropertyValues.name = member.getName();
    basePropertyValues.parentId = member.getParentId();
    return basePropertyValues;
}
/** This reads a property value from the given component/member and
 * converts it to a form value. */
function _getDialogValue(component,entry) {

    let propertyValue;
    if(entry.member !== undefined) {
        let propertyMember = component.getChildMemberFromPath(entry.member);
        if(propertyMember) {
            propertyValue = propertyMember.getField(entry.propertyKey);
        }
        else {
            throw new Error("Property Member " + entry.member + " not found in component " + entry.component);
        }
    }
    else {
        propertyValue = component.getField(entry.propertyKey);
    }

    if(entry.propertyToForm) {
        return entry.propertyToForm(propertyValue);
    }
    else {
        return propertyValue;
    }
}

//=================================
// Dialog Value processing
//=================================


/** This function creates the property jsons for a component and member, for both create and update,
 * feeding in the property dialog values.
 * Pass the value for component for update component, set to null create component. */
export function getPropertyJsons(componentConfig,component,dialogEntries,newFormValues) {
    let memberJson;
    let componentJson;
    //for a "create", get the default jsons
    if(!component) {
        memberJson = apogeeutil.jsonCopy(componentConfig.defaultMemberJson);
        memberJson.name = newFormValues.name;
        componentJson = apogeeutil.jsonCopy(componentConfig.defaultComponentJson);
    }

    //add in the property dialog results
    if(dialogEntries) {
        dialogEntries.forEach(entry => {
            let formValue = newFormValues[entry.dialogElement.key];
            if(formValue !== undefined) {
                let propertyValue = entry.formToProperty ? entry.formToProperty(formValue) : formValue;

                if(entry.member !== undefined) {
                    if(!memberJson) memberJson = {}; //used in update only

                    //lookup the proper json in case there is a member path
                    let singleMemberJson = _lookupSinglePropertyJson(memberJson,entry.member);
                    if(!singleMemberJson.fields) singleMemberJson.fields = {};
                    singleMemberJson.fields[entry.propertyKey] = propertyValue;
                }
                else {
                    if(!componentJson) componentJson = {}; //used in update only

                    if(!componentJson.fields) componentJson.fields = {};
                    componentJson.fields[entry.propertyKey] = propertyValue;
                }
            }
        })
    }

    return {memberJson, componentJson};
}

function _lookupSinglePropertyJson(propertyJson,path) {
    if(!propertyJson) propertyJson = {};
    if((!path)||(path == ".")) {
        return propertyJson;
    }
    else {
        let pathArray = path.split(".");
        return _getPathJson(propertyJson,pathArray,0);
    }

}

function _getPathJson(parentJson,pathArray,startFrom) {
    if((startFrom >= pathArray.length)||(startFrom < 0)) {
        throw new Error("Unexpected path for property entry!");
    }
    let childJson = _getChildJson(parentJson,pathArray[startFrom]);
    if(startFrom == pathArray.length - 1) {
        return childJson;
    }
    return _getPathJson(childJson,pathArray,startFrom+1);
}

function _getChildJson(json,childName) {
    let childJson;
    if(!json.children) {
        json.children = {};
    }
    else {
        childJson = json.children[childName];
    }
    if(!childJson) {
        childJson = {};
        json.children[childName] = childJson;
    }
    return childJson;
}
    