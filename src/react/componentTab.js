

function getComponentTab(componentView) {
    return <ComponentTab componentView={componentView}/>
}

function ComponentTab({componentView}) {
    let viewRef = React.useRef()
    let component = componentView.getComponent();

    React.useEffect(() => {
        //create tab display
        console.log("Tab created: component id = " + component.getId())

        let tabDisplay = componentView.getTabDisplay()
        viewRef.current.appendChild(tabDisplay.getElement())
        if(!tabDisplay.isShowing) {
            tabDisplay.tabShown()
        }

        // return () => {
        //     //destroy tab display
        //     //componentView.closeTabDisplay()
        //     console.log("Tab destroyed: component id = " + component.getId())
        //   }
    },[])

    console.log("in render tab")

    return <div ref={viewRef} className="componentWrapper"/>
}
