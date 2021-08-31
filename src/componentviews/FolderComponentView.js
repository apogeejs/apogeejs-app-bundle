import DocumentParentComponentView from "/apogeejs-app-bundle/src/componentdisplay/DocumentParentComponentView.js";

//======================================
// This is the component view config, to register the component
//======================================

const FolderComponentViewConfig = {
    componentType: "apogeeapp.PageComponent",
    viewClass: DocumentParentComponentView,
    hasTabEntry: true,
    hasChildEntry: false,
    iconResPath: "/icons3/pageIcon.png",
    treeEntrySortOrder: DocumentParentComponentView.FOLDER_COMPONENT_TYPE_SORT_ORDER
}
export default FolderComponentViewConfig;
