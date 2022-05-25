
export function SplitFrame({leftContent, rightContent}) {
    const [leftWidth,setLeftWidth] = React.useState(200)
    const [resizeOn,setResizeOn] = React.useState(false)
    const [resizeX,setResizeX] = React.useState(0)

    function mouseDownHandler(event) {
        if(event.target.className == "splitFrame_divider") {
            setResizeX(event.clientX)
            setResizeOn(true)
        }
    }
    function mouseMoveHandler(event) {
        if(resizeOn) {
            let deltaWidth = event.clientX - resizeX
            setResizeX(event.clientX)
            setLeftWidth(leftWidth + deltaWidth)
        }
    }
    function mouseUpHandler(event) {
        if(resizeOn) {
            setResizeOn(false)
        }
    }
    function mouseLeaveHandler(event) {
        if(resizeOn) {
            setResizeOn(false)
        }
    }

    const leftStyleProps = {
        width: leftWidth + "px"
    }

    return (
        <div className="splitFrame" onMouseDown={mouseDownHandler} onMouseMove={mouseMoveHandler} 
                                onMouseUp={mouseUpHandler} onMouseLeave={mouseLeaveHandler}>
            <div className="splitFrame_leftPanel" style={leftStyleProps}>
                {leftContent || 'adsf'}
            </div>
            <div className="splitFrame_divider">
            </div>
            <div className="splitFrame_rightPanel">
                {rightContent || 'asdfds'}
            </div>
        </div>
    )
}