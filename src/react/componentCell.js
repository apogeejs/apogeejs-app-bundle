//maybe pass in parentComponentView and childComponentView instead?

function getComponentCell(childComponentDisplay) {
    return <ComponentCell key={childComponentDisplay.componentView.getId()} childComponentDisplay={childComponentDisplay} />
}

function ComponentCell({childComponentDisplay}) {
    let viewRef = React.useRef()

    React.useEffect(() => {
        //create tab display
        console.log("Cell created: name = " + childComponentDisplay.componentView.getName());

        viewRef.current.appendChild(childComponentDisplay.getElement())

        // return () => {
        //     //destroy cell display
        //     //componentView.closeTabDisplay()
        //     console.log("Tab destroyed: component id = " + childComponentDisplay.componentView.getName())
        //   }
    },[])

    console.log("in render cell")

    return <div ref={viewRef} className="componentCellWrapper"/>
}
