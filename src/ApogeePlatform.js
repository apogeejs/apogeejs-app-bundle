/** This class provides some platform specific functionality. */
export default class ApogeePlatform {

    constructor() {
        this.fileAccess = null;
        this.moduleManagerClass = null;
        this.moduleManagerOptions = null;
        this.externalOpener = null;

        //temp logic
        this.imports = {};
        this._initPlatformGlobals();
    }

    //===============================
    // Accessors
    //===============================
    getFileAccessObject() {
        return this.fileAccess;
    }

    getModuleManagerInstance(app) {
        return new this.moduleManagerClass(app,this.moduleManagerOptions);
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

    ////////////////////////////////////////////////
    // TEMP PLATFORM GLOBALS
    getGlobal(variableName) {
        if(this.platformGlobals[variableName] !== undefined) {
            return this.platformGlobals[variableName];
        }
        if(this.globalWhiteList[variableName]) {
            return __globals__[variableName];
        }
    }

    _initPlatformGlobals() {
        this.globalWhiteList = {
            localStorage: true,
            sessionStorage: true
        }

        this.platformGlobals = {};
        this.platformGlobals.geolocation = navigator.geolocation;
        this.platformGlobals.GET_IMPORT = importName => this.getImport(importName);
    }

    //END TEMP PLATFORM GLOBALS
    //////////////////////////////////////////////////

    /////////////////////////////////////////////////
    // TEMP IMPORT LOGIC
    // (I think security is important here. I need to add that.)

    getImport(importName) {
        return this.imports[importName];
    }

    addImport(importName,data) {
        if(this.imports[importName] !== undefined) throw new Error("Import name already exists: " + importName);
        this.imports[importName] = data;
    }

    removeImport(importName) {
        delete this.imports[importName];
    }
    //END TEMP IMPORT LOGIC
    /////////////////////////////////////////////////

    //================================
    // initialization functions
    //================================

    setFileAccessObject(fileAccess) {
        this.fileAccess = fileAccess;
    }

    setModuleManagerClass(moduleManagerClass,options) {
        this.moduleManagerClass = moduleManagerClass;
        this.moduleManagerOptions = options;
    }

    setExternalOpener(externalOpener) {
        this.externalOpener = externalOpener;
    }

}