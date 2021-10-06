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

    //===============================
    // Globals and Modules Management
    //===============================

    getModelGlobal(variableName) {
        if(this.platformGlobals[variableName] !== undefined) {
            return this.platformGlobals[variableName];
        }
        if(this.globalWhiteList[variableName]) {
            return __globals__[variableName];
        }
    }

    //Model globals white list

    addNameToModelGlobals(variableName,isPermanent) {

    }

    removeNameFromModelGlobals(variableName) {

    }

    //Model added global values

    addValueToModelGlobals(variableName,value,isPermanent) {

    }

    removeValueFromModelGlobals(variableName) {

    }

    //Whitelist modules for model

    /** This should be called after the global loadModule function is defined, to initialize the model
     * verions of loadModule. */
    initModelLoadModule() {
        this.moduleLoadModule = (moduleName,flags) => {
            if(this.whiteListedModuleNames[moduleName] !== undefined) {
                return __globals__.loadModule(moduleName,flags);
            }
            else {
                return null;
            }
        }
    }

    getModuleLoadModule() {
        return this.moduleLoadModule;
    }

    addNameToModelModules(moduleName,isPermanent) {
    }

    removeNameFromModelModules(moduleName,isPermanent) {

    }

    //apogee module data

    apogeeModuleExport(moduleName) {

    }

    addApogeeModuleExport(moduleName,isPermanent) {

    }

    removeApogeeModuleExport(moduleName) {

    }

    ////////////////////////////////////////////////
    // OLD TEMP LOGIC

    _initPlatformGlobals() {
        this.globalWhiteList = {
            localStorage: true,
            sessionStorage: true
        }

        this.platformGlobals = {};
        this.platformGlobals.geolocation = navigator.geolocation;
        this.platformGlobals.GET_IMPORT = importName => this.getImport(importName);
    }

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
    //END OLD TEMP LOGIC
    /////////////////////////////////////////////////

    //================================
    // initialization functions
    //================================

    


}