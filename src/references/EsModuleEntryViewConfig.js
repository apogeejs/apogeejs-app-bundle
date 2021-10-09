const entryConfig = {
    "REFERENCE_TYPE": "es module",
    "LIST_NAME": "ES Modules",
    "DISPLAY_NAME":"ES Module",
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
    "ENTRY_ICON_PATH":"/icons3/esModuleIcon.png"
}

export default entryConfig;