
import apogeeutil from "/apogeejs-util-lib/src/apogeeUtilLib.js";

export function bannerVisible(status) {
    return ( (status == apogeeutil.STATE_ERROR) ||
     (status == apogeeutil.STATE_PENDING) ||
     (status == apogeeutil.STATE_INVALID) )
}

export function StateBanner({status, message}) {
    let bannerColor
    let bannerBackground
    let text
    switch(status) {
        case apogeeutil.STATE_ERROR:
            bannerColor = 'white'
            bannerBackground = 'red'
            text = message
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