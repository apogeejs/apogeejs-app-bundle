
export function deleteComponent(component) {

    let doDelete = () => {
        deleteComponentImpl(component);
    }

    let doCancel = () => {
    };
    let deleteMsg = "Are you sure you want to delete this object:" + component.getName() + "?"
    apogeeUserConfirm(deleteMsg,"Delete","Cancel",doDelete,doCancel);
}

function deleteComponentImpl(component) {

    var app = component.getApp(); 

    var member = component.getMember();
    var commands = []; //lfegtover from when document commands were included - we may put some back

    //model command
    var modelCommand = {};
    modelCommand.type = "deleteComponent";
    modelCommand.memberId = member.getId();
    commands.push(modelCommand);
    
    //combined command
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
        return;
    }

    app.executeCommand(commandData);
}