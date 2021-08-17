import DocumentParentComponentView from "/apogeejs-app-bundle/src/componentdisplay/DocumentParentComponentView.js";

const FolderFunctionComponentViewConfig = {
    componentType: "apogeeapp.PageFunctionComponent",
    viewClass: DocumentParentComponentView,
    viewModes: [],
    hasTabEntry: true,
    hasChildEntry: true,
    iconResPath: "/icons3/pageFunctionIcon.png",
    treeEntrySortOrder: DocumentParentComponentView.FOLDER_COMPONENT_TYPE_SORT_ORDER,
    propertyDialogEntries: [
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
            member: ".",
            propertyKey: "returnValue",
            dialogElement: {
                "type":"textField",
                "label":"Return Val: ",
                "size": 40,
                "key":"returnValue"
            }
        }
    ]
}
export default FolderFunctionComponentViewConfig;

