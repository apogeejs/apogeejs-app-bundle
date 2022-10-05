import {IconWithStatus} from "./IconwithStatus.js"
import {SelectMenu} from "./SelectMenu.js"

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

export function TreeView({children}) {

    return (
        <div className="treeView_wrapper">
            <ul className="treeView_list">
                {children ? children.map(childTreeState => <TreeEntry 
                        key={childTreeState.data.id}
                        data={childTreeState.data}
                        uiState={childTreeState.uiState}
                        children={childTreeState.children} 
                    /> ) : ''}
            </ul>
        </div>
    )
}

export function TreeEntry({data,  uiState, children}) {

    let controlResource = (children)&&(children.length > 0) ? (uiState.opened ? "/opened_darkgray.png" : "/closed_darkgray.png") : "/circle_darkgray.png"
    let controlImageUrl = apogeeui.uiutil.getResourcePath(controlResource,"ui-lib")
    let menuImageUrl = apogeeui.uiutil.getResourcePath("/menuDots16_darkgray.png","ui-lib")

    function controlClicked() {
        if((children)&&(children.length > 0)) {
            uiState.setOpened(!uiState.opened)
        }
    }

    return (
        <li className="treeView_item">
            <img src={controlImageUrl} onClick={controlClicked} className="workspaceTree_control"/>
            <IconWithStatus iconSrc={data.iconSrc} status={data.status} />
            <span>{data.text}</span>
            { data.menuItems ? <SelectMenu text="Menu" image={menuImageUrl} items={data.menuItems} /> : '' }
            { (uiState.opened && children) ? <TreeView children={children} /> : ''}
        </li>
    )
}
