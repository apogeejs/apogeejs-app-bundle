import DocumentParentComponentView from "/apogeejs-app-bundle/src/componentdisplay/DocumentParentComponentView.js";

//======================================
// This is the component view config, to register the component
//======================================

const FolderComponentViewConfig = {
    componentType: "apogeeapp.PageComponent",
    viewClass: DocumentParentComponentView,
    isParentOfChildEntries: true,
    iconResPath: "/icons3/pageIcon.png"
}
export default FolderComponentViewConfig;
