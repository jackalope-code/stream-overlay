import { WidgetDataMap } from "./Overlay";

export function env() {
  const socketUrl = process.env.REACT_APP_DEV_WS_URL as string;
  const routeUrl = process.env.REACT_APP_DEV_REST_URL as string;
  
  if(!socketUrl || !routeUrl) {
    throw new Error("Could not locate environment variables. \
    Requires REACT_APP_DEV_WS_URL and REACT_APP_DEV_ROUTE_URL to be set.")
  }
  return {socketUrl, routeUrl}
}

// Used to update state with a new object to trigger re-rendering
export function copyAllWidgetData(state: WidgetDataMap): WidgetDataMap {
  return Object.entries(state).reduce((objCopy, [id, values]) => {
    return Object.assign(objCopy, {[id]: Object.assign({}, values)})
  }, {});
}