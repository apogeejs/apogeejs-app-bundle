import {SelectMenu} from "./SelectMenu.js"
import {IconWithStatus} from "./IconwithStatus.js"

/** This file contains the MenuBar element for the apogee app. Embedded in it are the menu commands that run the application. 
 * activeTabName, activeTabIcon and activeTabStatus display the current tab. They are all optional. MenueData is required. */
export function MenuBar({menuData,activeTabName,activeTabIcon,activeTabStatus}) {

    let logoUrl = apogeeui.uiutil.getResourcePath("/shortlogo16.png","app")

    return (
        <div className="menu_bar">
            <div className="menu_bar_left">
                <img src={logoUrl} className="menu_bar_icon" />
                {menuData.map(menuItem => <SelectMenu key={menuItem.text} text={menuItem.text} items={menuItem.items}/>)}
            </div>
            {activeTabName ? <div className="menu_bar_right">
                {activeTabIcon ? <IconWithStatus iconSrc={activeTabIcon} status={activeTabStatus} /> : ''}
                <span>{activeTabName}</span>
            </div> : ''}
        </div>
        
    )
}
