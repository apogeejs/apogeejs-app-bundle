export function IconWithStatus({iconSrc, status}) {

    let statusImageSrc;
    switch(status) {
        case "normal":
            statusImageSrc = undefined
            break

        case "error":
            statusImageSrc = apogeeui.uiutil.getResourcePath("/error.png","ui-lib")
            break

        case "pending":
            statusImageSrc = apogeeui.uiutil.getResourcePath("/pending.png","ui-lib")
            break

        case "invalid":
            statusImageSrc = apogeeui.uiutil.getResourcePath("/invalid.png","ui-lib")
            break

        default:
            //we should make something noticable here I think, rather than nothing
            statusImageSrc = undefined;
            brea
    }

    return (
        <div className="iconWithStatus_wrapper">
            <img src={iconSrc} className="iconWithStatus_icon"/>
            {statusImageSrc ? <img src={statusImageSrc} className="iconWithStatus_status"/> : ''}
        </div>
    )
}