/** This class provides some platform specific functionality. */
export default class ApogeePlatform {

    constructor() {
        this.fileAccess = null;
        this.moduleManagerClass = null;
        this.moduleManagerOptions = null;
        this.externalOpener = null;
    }

    //===============================
    // File and Web Accessors
    //===============================

    getFileAccessObject() {
        return this.fileAccess;
    }

    spawnWorkspaceFromUrl(url) {
        if(this.externalOpener) {
            try {
                this.externalOpener.spawnWorkspaceFromUrl(url);
            }
            catch(error) {
                if(error.stack) console.error(error.stack);
                let errorMsg = error.messsage ? error.message : error.toString();
                apogeeUserAlert("Error opening external workspace: " + errorMsg);
            }
        }
        else {
            apogeeUserAlert("Open external workspace service not available!");
        }
    }

    openWebLink(url) {
        if(this.externalOpener) {
            try {
                this.externalOpener.openWebLink(url);
            }
            catch(error) {
                if(error.stack) console.error(error.stack);
                let errorMsg = error.messsage ? error.message : error.toString();
                apogeeUserAlert("Error loading external link: " + errorMsg);
            }
        }
        else {
            apogeeUserAlert("Open external link service not available!");
        }
    }

    setFileAccessObject(fileAccess) {
        this.fileAccess = fileAccess;
    }

    setExternalOpener(externalOpener) {
        this.externalOpener = externalOpener;
    }


    //===============================
    // Apogee Module Manager
    //===============================

    getModuleManagerInstance(app) {
        return new this.moduleManagerClass(app,this.moduleManagerOptions);
    }

    setModuleManagerClass(moduleManagerClass,options) {
        this.moduleManagerClass = moduleManagerClass;
        this.moduleManagerOptions = options;
    }


}