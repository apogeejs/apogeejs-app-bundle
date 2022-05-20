/** This function gets the child components, usable either for a parent folder or the model object. */
function getChildComponents(modelManager,memberParent) {
    let childComponents = []
    let childIdMap = memberParent.getChildIdMap()
    for(let childKey in childIdMap) {
        let childMemberId = childIdMap[childKey]
        let childComponentId = modelManager.getComponentIdByMemberId(childMemberId)
        if(childComponentId) {
            let childComponent = modelManager.getComponentByComponentId(childComponentId)
            childComponents.push(childComponent)
        }
    }
    return childComponents
}