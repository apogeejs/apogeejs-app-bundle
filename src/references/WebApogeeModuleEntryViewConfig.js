const entryConfig = {
    "REFERENCE_TYPE": "web apogee module",
    "LIST_NAME": "Apogee Modules",
    "DISPLAY_NAME":"Apogee Module",
    "PROPERTY_FORM_LAYOUT": [
        {
            "type": "textField",
            "label": "Module Name: ",
            "key": "name",
            "hint": "name to use in loadModule()",
            "size": 50
        },
        {
            "type": "textField",
            "label": "URL: ",
            "key": "url",
            "size": 100
        }
    ],
    "LIST_ICON_PATH":"/icons3/folderIcon.png",
    "ENTRY_ICON_PATH":"/icons3/workspaceIcon.png"
}

export default entryConfig;