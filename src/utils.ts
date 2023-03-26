import { MockData } from "./Overlay";

// Used to update state with a new object to trigger re-rendering
export function copyAllWidgetData(state: MockData): MockData {
  return Object.entries(state).reduce((objCopy, [id, values]) => {
    return Object.assign(objCopy, {[id]: Object.assign({}, values)})
  }, {});
}