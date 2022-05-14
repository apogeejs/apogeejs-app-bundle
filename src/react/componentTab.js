

function getComponentTab(componentView,childComponentViews,childComponentConfigs,createComponent,showing) {
    return <ComponentTab 
        componentView={componentView}
        childComponentViews={childComponentViews}
        childComponentConfigs={childComponentConfigs}
        createComponent={createComponent}
        showing={showing}
    />
}

// let childComponentConfigs = [];
// componentConfigs.forEach( componentConfig => {
//     if(componentConfig.viewModes !== undefined) {
//         childComponentConfigs.push(componentConfig);
//     }
// });
// //VANILLA CODE  - or at least some elements, for reference
// var select = uiutil.createElement("select");
// childComponentConfigs.forEach( componentConfig => {
//     select.add(uiutil.createElement("option",{"text":componentConfig.displayName,"value":componentConfig.displayName}));
// });
// var onCreate = function() {
//     var displayName = select.value;
//     componentConfig = componentConfigs.find(componentConfig => componentConfig.displayName == displayName)
//     if(componentConfig) {
//         onSelectFunction(componentConfig);
//         dialogMgr.closeDialog(dialog);
//     }
//     else {
//         // add error handling - this shouldn't happen though
//         apogeeUserAlert("Unknown error selecting component type: " + displayName)
//     }
// }
// var onCancel = function() {
//     dialogMgr.closeDialog(dialog);
// }

// line.appendChild(uiutil.createElement("button",{"className":"dialogButton","innerHTML":"Create","onclick":onCreate}));
// line.appendChild(uiutil.createElement("button",{"className":"dialogButton","innerHTML":"Cancel","onclick":onCancel}));


function ComponentTab({componentView,childComponentViews,childComponentConfigs,createComponent,showing}) {
    //let component = componentView.getComponent();
    console.log("in render tab name = " + componentView.getName())

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
        const selectedConfig = componentConfigs[event.target.selectedIndex];
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
