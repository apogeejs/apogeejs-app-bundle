

function getComponentTab(componentView,childComponentViews,childComponentConfigs,createComponent,showing) {
    return <ComponentTab 
        componentView={componentView}
        childComponentViews={childComponentViews}
        childComponentConfigs={childComponentConfigs}
        createComponent={createComponent}
        showing={showing}
    />
}

function ComponentTab({componentView,childComponentViews,childComponentConfigs,createComponent,showing}) {
    return (
        <div className="componentTabWrapper">
            <PageHeaderElement childComponentConfigs={childComponentConfigs} createComponent={createComponent} />
            <div className="componentPageBodyElement">
                {childComponentViews.map(childComponentView => childComponentView.getCellElement(showing))}
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
