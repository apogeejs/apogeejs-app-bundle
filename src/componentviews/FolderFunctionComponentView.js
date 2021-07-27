import ParentComponentView from "/apogeejs-app-bundle/src/componentdisplay/ParentComponentView.js";
import LiteratePageComponentDisplay from "/apogeejs-app-bundle/src/componentdisplay/LiteratePageComponentDisplay.js";

/** This component represents a folderFunction, which is a function that is programmed using
 *apogee tables rather than writing code. */
export default class FolderFunctionComponentView extends ParentComponentView {
        
    constructor(appViewInterface,component) {
        //extend parent component
        super(appViewInterface,component);
    }

    instantiateTabDisplay() {
        return new LiteratePageComponentDisplay(this); 
    }

    //==============================
    // Child Display
    //==============================

    /**  This method retrieves the table edit settings for this component instance
     * @protected */
    getTableEditSettings() {
        return FolderFunctionComponentView.TABLE_EDIT_SETTINGS;
    }

}

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
FolderFunctionComponentView.TREE_ENTRY_SORT_ORDER = ParentComponentView.FOLDER_COMPONENT_TYPE_SORT_ORDER;


FolderFunctionComponentView.propertyDialogLines = [
    {
        "type":"textField",
        "label":"Arg List: ",
        "size": 80,
        "key":"argListString"
    },
    {
        "type":"textField",
        "label":"Return Val: ",
        "size": 40,
        "key":"returnValue"
    }
];
/** This function takes the proeprty values from the component/members and converts it to have the format for the dialog form.
 * This function may be omitted if no transformation is needed. If it is included, the proeprty values can be
 * written into. */
FolderFunctionComponentView.propertyToFormValues = propertyValues => {
    propertyValues.argListString = propertyValues.argList.toString();
    return propertyValues;
}
/** This function takes the result value of the form and converts it to have the format for property values.
 * This function may be omitted if no transformation is needed. If it is included, the form values can be
 * written into. */
FolderFunctionComponentView.formToPropertyValues = formValue => {
    formValue.argList = apogeeutil.parseStringArray(formValue.argListString);
    return formValue
}
/** This function indicates any properties that are sourced by proeprty dialog lines with a different
 * key. This map can be completely omitted if all the property keys match the dialog keys. Also, and
 * proeprty key which matches a dialog key can be omitted. */
FolderFunctionComponentView.dialogLineMap = {
    argList: "argListString"
}
