import DocumentParentComponentView from "/apogeejs-app-bundle/src/componentdisplay/DocumentParentComponentView.js";

/** This component represents a table object. */
export default class FolderComponentView extends DocumentParentComponentView {}

//======================================
// This is the component generator, to register the component
//======================================

FolderComponentView.componentName = "apogeeapp.PageComponent";
FolderComponentView.hasTabEntry = true;
FolderComponentView.hasChildEntry = false;
FolderComponentView.ICON_RES_PATH = "/icons3/pageIcon.png";
FolderComponentView.TREE_ENTRY_SORT_ORDER = DocumentParentComponentView.FOLDER_COMPONENT_TYPE_SORT_ORDER; //defined in component
