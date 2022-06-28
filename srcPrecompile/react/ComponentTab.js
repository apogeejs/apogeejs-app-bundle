import {ComponentCell} from "./ComponentCell.js"
import {bannerVisible,StateBanner} from "./StateBanner.js"
import {componentInfo} from "/apogeejs-app-lib/src/apogeeAppLib.js"

export function getComponentTab(tabState,showing) {
    return <ComponentTab tabState={tabState} showing={showing} />
}

export function ComponentTab({tabState,showing}) {

    let childComponentConfigs = componentInfo.getChildComponentConfigs()
    
    return (
        <div className="componentTabWrapper">
            <div className="componentPageHeaderElement">
                <PageToolbarElement addChildComponent={tabState.tabData.addChildComponent} childComponentConfigs={childComponentConfigs} />
                {bannerVisible(tabState.status) ? <StateBanner status={tabState.tabData.status} message={tabState.tabData.statusMessage} /> : ''}
            </div>
            <div className="componentPageBodyElement">
                {
                    //get cells for child components that have cells (view modes exist)
                    tabState.cellStateArray ? tabState.cellStateArray.map(cellState => 
                        <ComponentCell key={cellState.cellData.id} cellState={cellState} cellShowing={showing} />) : ''
                }
            </div>
        </div>
    )
}

function PageToolbarElement({addChildComponent, childComponentConfigs}) {

    //get the command to create in this folder
    let createComponent = componentConfig => addChildComponent(componentConfig)

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
    return <div className="componentPageToolbarElement">
        <select className="componentPageCreateSelect" onChange={selectedTypeChanged}>
            {childComponentConfigs.map(componentConfig => <option key={componentConfig.displayName} value={componentConfig.displayName}>{componentConfig.displayName}</option>)}
        </select>
        <button type="button" onClick={onCreateClicked}>Create Element</button>
    </div>
}
