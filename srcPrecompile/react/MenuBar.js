import {SelectMenu} from "./SelectMenu.js"

import {closeWorkspace} from "/apogeejs-app-bundle/src/commandseq/closeworkspaceseq.js";
import {createWorkspace} from "/apogeejs-app-bundle/src/commandseq/createworkspaceseq.js";
import {openWorkspace} from "/apogeejs-app-bundle/src/commandseq/openworkspaceseq.js";
import {saveWorkspace} from "/apogeejs-app-bundle/src/commandseq/saveworkspaceseq.js";

import {showSimpleActionDialog} from "/apogeejs-ui-lib/src/apogeeUiLib.js";

/** This file contains the MenuBar element for the apogee app. Embedded in it are the menu commands that run the application. */

export function MenuBar({app, workspaceManager}) {
    return (
        <div className="appMenuBar">
            {getMenuItems(app,workspaceManager).map(menuItem => <SelectMenu key={menuItem.text} text={menuItem.text} items={menuItem.items}/>)}
        </div>
    )
}

/** @TODO I don't think the menu items are efficient. See how much overhead we have from redefining them
     * and see if it is worth making this more effiecient, such as making a single menu object that only changes
     * when the menu changes. (First, this probably doesn't matter. Second, is this even the criteria rect usees for a rerender?)
     */
function getMenuItems(app,workspaceManager) {
    return [
        getWorkspaceMenuData(app,workspaceManager),
        getEditMenuData(app),
        getAboutMenuData()
    ]
}



/** This method gets the workspace menu items. */
function getWorkspaceMenuData(app,workspaceManager) {

    let menuItems = [];
    let menuData = {
        text: "File",
        items: menuItems
    }

    let fileAccessObject = apogeeplatform.getFileAccessObject()

    menuItems.push({
        text: "New",
        action: () => {
            console.log("In create workspace!")
            createWorkspace(app)
        }
    })

    menuItems.push({
        text: "Open",
        action: () => openWorkspace(app,fileAccessObject)
    })

    if(workspaceManager) {
        var fileMetadata = workspaceManager.getFileMetadata()

        if(fileAccessObject.directSaveOk(fileMetadata)) {
            menuItems.push({
                text: "Save",
                action: () => saveWorkspace(app,fileAccessObject,true)
            })
        }

        menuItems.push({
            text: "Save as",
            action: () => saveWorkspace(app,fileAccessObject,false)
        })
    }  

    menuItems.push({
        text: "Close",
        action: () => closeWorkspace(app)
    })
    
    return menuData;
}

/** This method gets the workspace menu items. */
function getEditMenuData(app) {
    
    var menuItems = []
    let menuData = {
        text: "Edit",
        items: menuItems
    }

    let commandManager = app.getCommandManager()
    let commandHistory = commandManager.getCommandHistory()
    
    //populate the undo menu item
    var undoLabel
    var undoCallback
    var nextUndoDesc = commandHistory.getNextUndoDesc()
    if(nextUndoDesc === null) {
        undoLabel = "-no undo-"
        undoCallback = null
    }
    else {
        if(nextUndoDesc == "") {
            undoLabel = "Undo"
        }
        else {
            undoLabel = "Undo: " + nextUndoDesc
        }
        undoCallback = () => commandHistory.undo()
    }

    menuItems.push({
        text: undoLabel,
        action: undoCallback
    })
    
    //populate the redo menu item
    var redoLabel;
    var redoCallback;
    var nextRedoDesc = commandHistory.getNextRedoDesc()
    if(nextRedoDesc === null) {
        redoLabel = "-no redo-"
        redoCallback = null;
    }
    else {
        if(nextRedoDesc == "") {
            redoLabel = "Redo"
        }
        else {
            redoLabel = "Redo: " + nextRedoDesc;
        }
        redoCallback = () => commandHistory.redo()
    }
    menuItems.push({
        text: redoLabel,
        action: redoCallback
    })
    
    return menuData;
}

function getAboutMenuData() {
    return {
        text: "About",
        items: [
            {
                text: "Apogee Help",
                action: helpCallback
            },
            {
                text: "About",
                action: aboutCallback
            }
        ] 
    }
}

function helpCallback() {
    let title = "Apogee Help"
    let message;
    //if we are in a browser, allow the user to open the link. Otherwise just print it.
    if(__browser__) {
        message = 'For help, please go to the website: <a href="https://www.apogeejs.com" target="_blank">https://www.apogeejs.com</a>'
    }
    else {
        message = 'For help, please go to the website: <b>https://www.apogeejs.com</b>'
    }
    showSimpleActionDialog(title,message,["OK"])
}

function aboutCallback() {
    let title = "Apogee Programming Environment"
    let message = "Version: " + __apogee_version__
    showSimpleActionDialog(title,message,["OK"])
}