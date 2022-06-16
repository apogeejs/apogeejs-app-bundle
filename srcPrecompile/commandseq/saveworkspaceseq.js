

//=====================================
// UI Entry Point
//=====================================

export function saveWorkspace(app,fileAccessObject,requestDirectSave) {

    var activeWorkspaceManager = app.getWorkspaceManager();
    var workspaceText;
    var fileMetadata;
    var doDirectSave = false;
    if(activeWorkspaceManager) {
        var workspaceJson = activeWorkspaceManager.toJson();
        workspaceText = JSON.stringify(workspaceJson);
        fileMetadata = activeWorkspaceManager.getFileMetadata();
        //see if we can do a direct save
        if(requestDirectSave) doDirectSave = fileAccessObject.directSaveOk(fileMetadata);
    }
    else {
        apogeeUserAlert("There is no workspace open.");
        return;
    }

    //clear workspace dirty flag on completion of save
    var onSave = (err,fileSaved,updatedFileMetadata) => {
        if(err) {
            apogeeUserAlert("There was an error saving the file: " + err.toString());
        }
        else if(fileSaved) {

            //update the file info for the workspaceManager
            const commandData = {
                type:"updateWorkspaceFileData",
                isDirty: false,
                fileMetadata: updatedFileMetadata ? updatedFileMetadata : undefined
            }

            app.executeCommand(commandData)
        }
    }

    if(doDirectSave) {
        fileAccessObject.saveFile(fileMetadata,workspaceText,onSave);
    }
    else {
        fileAccessObject.saveFileAs(fileMetadata,workspaceText,onSave);
    }
}
