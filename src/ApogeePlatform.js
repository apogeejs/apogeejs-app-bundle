/** This class provides some platform specific functionality. */
export default class ApogeePlatform {

    constructor() {
        this.fileAccess = null;
        this.moduleManagerClass = null;
        this.externalOpener = null;
    }

    //===============================
    // Accessors
    //===============================
    getFileAccessObject() {
        return this.fileAccess;
    }

    openModuleManager(app) {
        if(this.moduleManagerClass) {
            try {
                let moduleManager = new this.moduleManagerClass(app);
                moduleManager.openModuleManager();
            }
            catch(error) {
                if(error.stack) console.error(error.stack);
                let errorMsg = error.messsage ? error.message : error.toString();
                apogeeUserAlert("Error opening module manager: " + errorMsg);
            }
        }
        else {
            apogeeUserAlert("Module manager service not available!");
        }
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

    //================================
    // initialization functions
    //================================

    setFileAccessObject(fileAccess) {
        this.fileAccess = fileAccess;
    }

    setModuleManagerClass(moduleManagerClass) {
        this.moduleManagerClass = moduleManagerClass;
    }

    setExteralOpener(externalOpener) {
        this.externalOpener = externalOpener;
    }

}