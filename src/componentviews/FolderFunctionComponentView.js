import DocumentParentComponentView from "/apogeejs-app-bundle/src/componentdisplay/DocumentParentComponentView.js";

/** This component represents a folderFunction, which is a function that is programmed using
 *apogee tables rather than writing code. */
export default class FolderFunctionComponentView extends DocumentParentComponentView {}

//=======================
// Child View SEttings
//=======================

FolderFunctionComponentView.VIEW_MODES = [
];

FolderFunctionComponentView.TABLE_EDIT_SETTINGS = {
    "viewModes": FolderFunctionComponentView.VIEW_MODES,
}


//======================================
// This is the component generator, to register the component
//======================================

FolderFunctionComponentView.componentName = "apogeeapp.PageFunctionComponent";
FolderFunctionComponentView.hasTabEntry = true;
FolderFunctionComponentView.hasChildEntry = true;
FolderFunctionComponentView.ICON_RES_PATH = "/icons3/pageFunctionIcon.png";
FolderFunctionComponentView.TREE_ENTRY_SORT_ORDER = DocumentParentComponentView.FOLDER_COMPONENT_TYPE_SORT_ORDER; //defined in component


FolderFunctionComponentView.propertyDialogEntries = [
    {
        member: ".",
        propertyKey: "argList",
        dialogElement: {
            "type":"textField",
            "label":"Arg List: ",
            "size": 80,
            "key":"argListString"
        },
        propertyToForm: argListValue => argListValue.toString(),
        formToProperty: argListString => apogeeutil.parseStringArray(argListString)
    },
    {
        propertyKey: "returnValue",
        dialogElement: {
            "type":"textField",
            "label":"Return Val: ",
            "size": 40,
            "key":"returnValue"
        }
    }
];

