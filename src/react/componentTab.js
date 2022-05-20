
function getComponentTab(apogeeView,component,showing,moduleHelper) {
    if(component.getComponentConfig().isParentOfChildEntries) {

        //get child components
        let app = component.getApp()
        let modelManager = app.getModelManager()
        let parentFolder = component.getParentFolderForChildren();
        let childComponents = getChildComponents(modelManager,parentFolder) 

        //we might want to ccache one or both of those, and only change it if the components change
        //get component configs for create buttons
        let childComponentConfigs = moduleHelper.getChildComponentConfigs()

        //get the command to create in this folder
        var initialValues = {};
        initialValues.parentId = parentFolder.getId();
        let createComponent = componentConfig => moduleHelper.addComponent(app,componentConfig,initialValues)
        
        return <ComponentTab apogeeView={apogeeView} component={component} childComponents={childComponents} 
            childComponentConfigs = {childComponentConfigs} createComponent={createComponent} 
            showing={showing} moduleHelper={moduleHelper}/>
    }
    else {
        console.log("Requesting tab for non-parent component")
        return null
    }
}

function ComponentTab({apogeeView,component,childComponents,childComponentConfigs,createComponent,showing,moduleHelper}) {
    return (
        <div className="componentTabWrapper">
            <PageHeaderElement childComponentConfigs={childComponentConfigs} createComponent={createComponent} />
            <div className="componentPageBodyElement">
                {childComponents.map(component => getComponentCell(apogeeView,component,showing,moduleHelper))}
            </div>
        </div>
    )
}

function PageHeaderElement({childComponentConfigs, createComponent}) {

    const [selectedChildConfig, setSelectedChildConfig] = React.useState(() => childComponentConfigs[0])

    const selectedTypeChanged = event => {
        const selectedConfig = childComponentConfigs[event.target.selectedIndex];
        setSelectedChildConfig(selectedConfig)
    }

    const onCreateClicked = () => {
        createComponent(selectedChildConfig)

        //?: Do we want to keep the current selection or revert to the first. Keep for now.
    }

    //add the select and the create button!
    return <div className="componentPageHeaderElement">
        <select className="componentPageCreateSelect" onChange={selectedTypeChanged}>
            {childComponentConfigs.map(componentConfig => <option key={componentConfig.displayName} value={componentConfig.displayName}>{componentConfig.displayName}</option>)}
        </select>
        <button type="button" onClick={onCreateClicked}>Create Element</button>
        <hr/>
    </div>
}
