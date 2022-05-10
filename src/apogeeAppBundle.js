import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";
import * as apogeebase from "/apogeejs-base-lib/src/apogeeBaseLib.js";
import * as apogee from "/apogeejs-model-lib/src/apogeeModelLib.js";
import * as apogeeapp from "/apogeejs-app-lib/src/apogeeAppLib.js";
import * as apogeeui from "/apogeejs-ui-lib/src/apogeeUiLib.js";
import ApogeeView from "/apogeejs-app-bundle/src/ApogeeView.js";
import ApogeePlatform from "/apogeejs-app-bundle/src/ApogeePlatform.js";

//import the reference views
import "/apogeejs-app-bundle/src/referenceViewConfig.js";

//expose these apogee libraries globally so plugins can use them 
__globals__._ = apogeeutil._;
__globals__.apogeeutil = apogeeutil;
__globals__.apogeebase = apogeebase;
__globals__.apogee = apogee;
__globals__.apogeeapp = apogeeapp;
__globals__.apogeeui = apogeeui;
__globals__.apogeeplatform = new ApogeePlatform();

__globals__.addNameToModelGlobals("_",true);
__globals__.addNameToModelGlobals("apogeeutil",true);
__globals__.addNameToModelGlobals("apogeebase",true);
__globals__.addNameToModelGlobals("apogee",true);
__globals__.addNameToModelGlobals("apogeeapp",true);
__globals__.addNameToModelGlobals("apogeeui",true);
__globals__.addNameToModelGlobals("apogeeplatform",true);

//some user message utilities
__globals__.apogeeLog = (msg) => console.log(message);
__globals__.apogeeUserAlert = (msg) => apogeeui.showSimpleActionDialog(msg,null,["OK"]);
__globals__.apogeeUserConfirm = (msg,okText,cancelText,okAction,cancelAction,defaultToOk) => apogeeui.showSimpleActionDialog(msg,null,[okText,cancelText],[okAction,cancelAction]);
__globals__.apogeeUserConfirmSynchronous = (msg,okText,cancelText,defaultToOk) => confirm(msg);

__globals__.addNameToModelGlobals("apogeeLog",true);
__globals__.addNameToModelGlobals("apogeeUserAlert",true);
__globals__.addNameToModelGlobals("apogeeUserConfirm",true);

let appView;

/** This function starts the application */
__globals__.appInit = function(includePathInfo) {
    apogeeapp.initIncludePath(includePathInfo);
    appView = new ApogeeView("appContainer");

    //////////////////////////
    //REACT SUPPORT
    appView.render()

    //END REACT SUPPORT
    ///////////////////////////
}

/** This function can be used to detect if a save is needed. */
__globals__.getWorkspaceIsDirty = function() {
    return appView.getApp().getWorkspaceIsDirty();
}
