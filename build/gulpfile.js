const { src, dest, series, parallel} = require('gulp');
const concat = require('gulp-concat');
const rollup = require('rollup');
//const replace = require('gulp-replace');
//const rename = require('gulp-rename');
const path = require('path');
const buildUtils = require("../../apogeejs-admin/src/build-utils.js");

const DEPENDENCY_MAP_URL = "/apogeejs-admin/lib-build/dependencyMap.json";

const versionConfig = require("../versionConfig.json");

let isProductionRelease = versionConfig.isProductionRelease;
let version = versionConfig.version;
let pathMapping = versionConfig.pathMapping;

let repoName = "apogeejs-app-bundle";

//for absolute references
const PATH_TO_ABSOLUTE_ROOT = "../..";
let resolveAbsoluteUrl = buildUtils.createResolveAbsoluteUrl(__dirname,PATH_TO_ABSOLUTE_ROOT,pathMapping); //used to convert urls to paths
let resolveId = buildUtils.createResolveId(resolveAbsoluteUrl); //used for rollup

const dependencyMap = require(resolveAbsoluteUrl(DEPENDENCY_MAP_URL));
const releasePackageJson = require(resolveAbsoluteUrl("/apogeejs-appview-lib/package.json"));

const esOutputFolder = resolveAbsoluteUrl(buildUtils.getEsReleaseFolderUrl(repoName,version,isProductionRelease));
const npmOutputFolder = resolveAbsoluteUrl(buildUtils.getNpmReleaseFolderUrl(repoName,version,isProductionRelease));

//======================================
// Release Info
//======================================

//base files - version info
const ES_BASE_FILES = [
    "../versionConfig.json"
]

let copyReleaseInfoTask = parallel(
    () => copyFiles(ES_BASE_FILES,esOutputFolder)
)

//base files - version info
const NPM_BASE_FILES = [
    "../package.json"
]

let copyNpmReleaseInfoTask = parallel(
    () => copyFiles(NPM_BASE_FILES,npmOutputFolder)
)

//=================================
// Package CSS
//=================================

const CSS_BUNDLE_FILENAME = "cssBundle.css";
const CSS_FILES_URLS = [
    "/apogeejs-view-lib/src/apogeeapp.css",
    "/apogeejs-appview-lib/src/componentdisplay/LiteratePage.css",
    "/apogeejs-webview-lib/src/componentdisplay/WebView.css",
    "/apogeejs-view-lib/src/componentdisplay/ComponentDisplay.css",
    "/apogeejs-appview-lib/src/editor/toolbar/ApogeeToolbar.css",
    "/apogeejs-ui-lib/src/window/dialog.css",
    "/apogeejs-ui-lib/src/displayandheader/DisplayAndHeader.css",
    "/apogeejs-ui-lib/src/menu/Menu.css",
    "/apogeejs-ui-lib/src/splitpane/SplitPane.css",
    "/apogeejs-ui-lib/src/tabframe/TabFrame.css",
    "/apogeejs-ui-lib/src/treecontrol/TreeControl.css",
    "/apogeejs-ui-lib/src/configurablepanel/ConfigurablePanel.css",
    "/apogeejs-ui-lib/src/configurablepanel/elements/listElement.css",
    "/apogeejs-ui-lib/src/tooltip/tooltip.css",  
//    "/apogeejs-web-app/src/fileaccess/combinedFileAccess.css",
    "/prosemirror-admin/compiledCss/editor.css",    
    "/apogeejs-admin/ext/handsontable/handsontable_6.2.0/handsontable.full.min.css"
]

//convert for remapped directories
let cssFileSystemPaths = CSS_FILES_URLS.map(resolveAbsoluteUrl);

function packageCssTask() {
    //fix path - related to odd problem on windows with rollup "dest"
    let srcFiles = cssFileSystemPaths.map(buildUtils.fixPath);
    let target = buildUtils.fixPath(esOutputFolder);
    return src(srcFiles)
        .pipe(concat(CSS_BUNDLE_FILENAME))
        .pipe(dest(target))
}



//----------------
// resources (images, mainly)
//----------------

const RESOURCES_FOLDER_NAME = "resources";
const RESOURCE_URL_PATTERN = "/apogeejs-appview-lib/resources/**/*";

//convert for remapped directories
let resourceSystemFilesPattern = resolveAbsoluteUrl(RESOURCE_URL_PATTERN);

function copyResourcesTask() {
    //fix path - related to odd problem on windows with rollup "dest"
    let srcPattern = buildUtils.fixPath(resourceSystemFilesPattern);
    let target = buildUtils.fixPath(path.join(esOutputFolder,RESOURCES_FOLDER_NAME))
    return src(srcPattern)
        .pipe(dest(target))
}

//----------------
// ace includes (themes and things like that)
//----------------

const ACE_INCLUDES_FOLDER_NAME = "ace_includes";
const ACE_INCLUDE_URL_PATTERN = "/apogeejs-admin/ext/ace/ace_1.4.3/ace_includes/**/*";

//convert for remapped directories
let aceIncludeSystemFilesPattern = resolveAbsoluteUrl(ACE_INCLUDE_URL_PATTERN);

function copyAceIncludesTask() {
    //fix path - related to odd problem on windows with rollup "dest"
    let srcPattern = buildUtils.fixPath(aceIncludeSystemFilesPattern);
    let target = buildUtils.fixPath(path.join(esOutputFolder,ACE_INCLUDES_FOLDER_NAME))

    return src(srcPattern)
        .pipe(dest(target))
}

//----------------
// globals definition files
//----------------

const GLOBAL_SRC_URLS = [
    "/apogeejs-model-lib/src/webGlobals.js",
    "/apogeejs-model-lib/src/debugHook.js"
]

//convert for remapped directories
let globalSrcFileSystemPaths = GLOBAL_SRC_URLS.map(resolveAbsoluteUrl);

let copyGlobalFiles = () => copyFiles(globalSrcFileSystemPaths,esOutputFolder)

//==============================
// Bundle
//==============================

const ES_MODULE_NAME = "apogeeAppBundle.js";
const NPM_MODULE_NAME = "apogeejs-app-bundle.js";

let packageBundleTask = parallel(
    packageEsModuleTask,
    packageNpmModuleTask
);

function packageEsModuleTask() {
    return rollup.rollup({
        input: '../src/apogeeAppBundle.js',
        plugins: [
            {resolveId}
        ]
    }).then(bundle => {
        return bundle.write(
            { 
                file: path.join(esOutputFolder,ES_MODULE_NAME),
                format: 'es',
                banner: buildUtils.getJsFileHeader(ES_MODULE_NAME,version),
                //no external dependenciees in this bundle 
            }
        )
    });
}

//remap the npm external depndencies. We will not leave any external dependencies in the es module.
let npmDependencyInfo = getNpmExternalDependencyInfo(releasePackageJson.dependencies,dependencyMap);

function packageNpmModuleTask() {
    return rollup.rollup({
        input: '../src/apogeeAppBundle.js',
        external: npmDependencyInfo.externalLibs,
        plugins: [
            {resolveId}
        ]
    }).then(bundle => {
        return bundle.write(
            { 
                file: path.join(npmOutputFolder,NPM_MODULE_NAME),
                format: 'cjs',
                banner: buildUtils.getJsFileHeader(NPM_MODULE_NAME,version),
                paths: npmDependencyInfo.npmExternalRemap,
            }
        )
    });
}

//=============================
// internal functions
//=============================

/** This function is a gulp task that copies files to a destination folder. */
function copyFiles(fileList,destFolder) {
    //I had some occasional problems on windows without this step
    //I think this is related to an issue cited in the rollup "dest" documentation, but
    //I didn't understard how to otherwise fix it.
    let alteredDestFolder = buildUtils.fixPath(destFolder);
    let alteredFileList = fileList.map(buildUtils.fixPath);

    return src(alteredFileList,{allowEmpty: true})
        .pipe(dest(alteredDestFolder));
}



/** This function gets information on external libraries to include in the bundle creation based
 * on the dependnecies in the package.json file. */
function getNpmExternalDependencyInfo(packageDependencies,dependencyMap) {
    let dependencyInfo = {
        externalLibs: [],
        npmExternalRemap: {}
    };
    if(packageDependencies) {
        for(let npmModule in packageDependencies) {
            let esFileUrl = dependencyMap.npmToEsExternLib[npmModule];
            if(!esFileUrl) {
                throw new Error("npm module " + npmModule + " missing from dependency map file!");
            }
            dependencyInfo.externalLibs.push(esFileUrl);
            dependencyInfo.npmExternalRemap[esFileUrl] = npmModule;
        }
    }
    return dependencyInfo;
}

//============================
// Exports
//============================

//This task executes the complete release
exports.release = series(
    () => buildUtils.makeSureReleaseNotPresent(esOutputFolder),
    parallel(
        copyReleaseInfoTask,
        copyNpmReleaseInfoTask,
        packageCssTask,
        copyResourcesTask,
        copyAceIncludesTask,
        copyGlobalFiles,
        packageBundleTask,
    )
);

