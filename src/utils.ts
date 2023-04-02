import { WidgetDataMap } from "./Overlay";

export function env() {
  const buildType = process.env.REACT_APP_BUILD_FLAG;
  if(buildType === undefined) {
    throw new Error("Set REACT_APP_BUILD_FLAG to either dev or prod build.");
  }

  let socketUrl = "ws://localhost:4000";
  let routeUrl = "http://localhost:4000";
  // let clientUrl;

  // if(buildType === 'dev') {
  //   socketUrl = process.env.REACT_APP_DEV_WS_URL;
  //   routeUrl = process.env.REACT_APP_DEV_REST_URL;
  // // } else if(buildType === 'prod') {
  // //   socketUrl = process.env.REACT_APP_WS_URL;
  // //   routeUrl = process.env.REACT_APP_REST_URL;
  // } else if(buildType === 'docker') {
  //   routeUrl = 'http://api:4000'
  //   socketUrl = 'ws://api:4000';
  // }
  
  // if(!socketUrl || !routeUrl) {
  //   throw new Error("Could not locate environment variables. \
  //   Requires REACT_APP_DEV_WS_URL, REACT_APP_LOCAL_CLIENT_URL, and REACT_APP_DEV_ROUTE_URL to be set.")
  // }
  // return {socketUrl, routeUrl}
}

// Used to update state with a new object to trigger re-rendering
export function copyAllWidgetData(state: WidgetDataMap): WidgetDataMap {
  return Object.entries(state).reduce((objCopy, [id, values]) => {
    return Object.assign(objCopy, {[id]: Object.assign({}, values)})
  }, {});
}