const menuItems = [
    {
        text: "Manage...",
        callback: app => app.openModuleManager()
    }
]


const entryConfig = {
    referenceType: "web apogee module",
    listName: "Apogee Modules",
    listIconPath:"/icons3/folderIcon.png",
    listMenuItems: menuItems,
    entryIconPath:"/icons3/workspaceIcon.png",
    entryMenuItems: menuItems
}

export default entryConfig;


