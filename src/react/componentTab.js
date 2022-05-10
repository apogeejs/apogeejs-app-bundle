

function getComponentTab(componentView) {
    let viewRef = React.useRef()

    React.useEffect(() => {
        //create tab display
        console.log("Tab created: component id = " + componentView.getComponent().getId())

        let tabDisplay = componentView.getTabDisplay()
        viewRef.current.appendChild(tabDisplay.pageContent)
        tabDisplay.tabShown()

        return () => {
            //destroy tab display
            //componentView.closeTabDisplay()
            console.log("Tab destroyed: component id = " + componentView.getComponent().getId())
          }
    },[])

    console.log("in render tab")

    return <div ref={viewRef} className="componentWrapper"/>
}
