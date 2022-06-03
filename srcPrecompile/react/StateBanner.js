
import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";

export function bannerVisible(component) {
    return ( (component.getState() == apogeeutil.STATE_ERROR) ||
     (component.getState() == apogeeutil.STATE_PENDING) ||
     (component.getState() == apogeeutil.STATE_INVALID) )
}

export function StateBanner({component}) {
    let bannerColor
    let bannerBackground
    let text
    switch(component.getState()) {
        case apogeeutil.STATE_ERROR:
            bannerColor = 'white'
            bannerBackground = 'red'
            text = component.getStateMessage()
            break

        case apogeeutil.STATE_PENDING:
            bannerColor = 'black'
            bannerBackground = 'yellow'
            text = 'Pending'
            break

        case apogeeutil.STATE_INVALID:
            bannerColor = 'white'
            bannerBackground = 'gray'
            text = 'Invalid Value'
            break
    }

    return <div className="visiui_pageChild_bannerContainerClass" style={{color: bannerColor, backgroundColor: bannerBackground}}>{text}</div> 
}