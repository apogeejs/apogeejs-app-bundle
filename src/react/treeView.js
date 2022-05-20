/* Tree View 
* Creates a tree from a TreeObject. TreeObject interface:
* - boolean hasChildren() - returns true if there are 0 children
* - [TreeObject] getChildren() - returns a list of children.
* - boolean hasMenu() - returns true if the tree entry has a menu
* - boolean getMenuItems() - returns the menu items for the menu
* - boolean hasTab() - returns true if the entry has a tab item
* TO CLEAN UP
* - click name action!
* - add open parent action (as in for child components)
*/

/** @TODO In this file I reference uiutil, relying on it being defiend globally. I will want to laod this
 * from a module. */

function TreeView({childTreeEntries}) {

    return (
        <ul className="treeView_list">
            {childTreeEntries}
        </ul>
    )
}

function TreeEntry({iconSrc, text, status, menuItems, childTreeEntries}) {
    const [opened,setOpened] = React.useState(false);

    let controlResource = (childTreeEntries)&&(childTreeEntries.length > 0) ? (opened ? "/opened_darkgray.png" : "/closed_darkgray.png") : "/circle_darkgray.png"
    let controlImageUrl = apogeeui.uiutil.getResourcePath(controlResource,"ui-lib")
    let menuImageUrl = apogeeui.uiutil.getResourcePath("/menuDots16_darkgray.png","ui-lib")

    function controlClicked() {
        if((childTreeEntries)&&(childTreeEntries.length > 0)) {
            setOpened(!opened)
        }
    }

    return (
        <li className="treeView_item">
            <img src={controlImageUrl} onClick={controlClicked} className="workspaceTree_control"/>
            <IconWithStatus iconSrc={iconSrc} status={status} />
            <span>{text}</span>
            { menuItems ? <SelectMenu text="Menu" image={menuImageUrl} items={menuItems} /> : '' }
            { (opened && childTreeEntries) ? <TreeView childTreeEntries={childTreeEntries} /> : ''}
        </li>
    )
}
