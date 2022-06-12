import {ComponentCell} from "./ComponentCell.js"
import {getChildComponents} from "./componentUtils.js"
import {bannerVisible,StateBanner} from "./StateBanner.js"
import {addComponent} from "/apogeejs-app-bundle/src/commandseq/addcomponentseq.js"
import {componentInfo} from "/apogeejs-app-lib/src/apogeeAppLib.js"

export function getComponentTab(component,showing) {
    return <ComponentTab component={component} showing={showing} />
}

export function ComponentTab({component,showing}) {
    if(component.getComponentConfig().isParentOfChildEntries) {

        //get child components
        let app = component.getApp()
        let modelManager = app.getModelManager()
        let parentFolder = component.getParentFolderForChildren();
        let childComponents = getChildComponents(modelManager,parentFolder) 

        let childComponentConfigs = componentInfo.getChildComponentConfigs()
        
        return (
            <div className="componentTabWrapper">
                <div className="componentPageHeaderElement">
                    <PageToolbarElement app={app} parentFolder={parentFolder} childComponentConfigs={childComponentConfigs} />
                    {bannerVisible(component) ? <StateBanner component={component} /> : ''}
                </div>
                <div className="componentPageBodyElement">
                    {
                        //get cells for child components that have cells (view modes exist)
                        childComponents.filter(component => component.getComponentConfig().viewModes)
                            .map(component => <ComponentCell key={component.getId()} component={component} showing={showing} />)
                    }
                </div>
            </div>
        )
    }
    else {
        console.log("Requesting tab for non-parent component")
        return <div>INVALID TAB - NOT A PARENT</div>
    }
}

function PageToolbarElement({app, parentFolder, childComponentConfigs}) {

    //get the command to create in this folder
    var initialValues = {};
    initialValues.parentId = parentFolder.getId();
    let createComponent = componentConfig => addComponent(app,componentConfig,initialValues)

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
