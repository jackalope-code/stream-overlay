import {useCallback, useEffect, useRef, useState } from 'react';
import Widget from './Widget';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { copyAllWidgetData, env } from './utils';
import axios, { AxiosResponse } from 'axios';

export interface Dimensions {
  width: number;
  height: number;
}

export interface OverlayProps {
  dimensions: Dimensions;
  style?: React.CSSProperties;
  scale?: number;
  translateY?: string;
  setDimensions: React.Dispatch<React.SetStateAction<Dimensions>>;
  widgetDataMap: WidgetDataMap;
  setWidgetDataMap: React.Dispatch<React.SetStateAction<WidgetDataMap>>;
  clientId: string | undefined;
  // setClientId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export interface WidgetData {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  moving: boolean;
  owner?: string;
}

export interface WidgetUpdateData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>
export interface WidgetDataMap {
  [key: string]: WidgetData;
}

interface UseOverlayProps {
  setWidgetDataMap: React.Dispatch<React.SetStateAction<WidgetDataMap>>;
  widgetDataMap: WidgetDataMap;
  clientId: string | undefined;
}

export interface UseOverlayHelpers {
  addWidget: (widgetData: WidgetData, clientId: string) => void;
  updateWidget: (widgetData: WidgetData, widgetId: string, clientId: string) => void;
  deleteWidget: (widgetId: string, clientId: string) => void;
  deleteWidgetLocal: (widgetId: string) => void;
}

export interface UseOverlayState {
  clientId: string;
  widgetDataMap: WidgetDataMap;
}

export type UseOverlay = [UseOverlayState, UseOverlayHelpers];

export function useOverlay(setWidgetDataMap: React.Dispatch<React.SetStateAction<WidgetDataMap>>): UseOverlayHelpers {
  function addNewAndBlindUpdate(widgetData: WidgetData, clientId: string) {
    const newWidget = {
      url: widgetData.url,
      x: widgetData.x,
      y: widgetData.y,
      width: widgetData.width,
      height: widgetData.height
    }
    // TODO: error handling if not connected to WS client
    if(!clientId) {
      alert("Error connecting to server");
    } else {
      (async () => {
        const res = await axios.post(`${routeUrl}/component`, {
          data: {...newWidget},
          headers: {'Authorization': clientId }
        })
        setWidgetDataMap(data => ({
          ...copyAllWidgetData(data),
          ...{[res.data.componentId]: newWidget}
        }));
      })();
    }
  }

  function updateWidgetBlind(widgetData: WidgetUpdateData, widgetId: string, clientId: string) {
    console.log("RUN UPDATE " + JSON.stringify(widgetData));
    const widgetUpdateData: WidgetUpdateData = {
      x: widgetData.x,
      y: widgetData.y,
      width: widgetData.width,
      height: widgetData.height
    }
    // TODO: error handling if not connected to WS client
    if(!clientId) {
      alert("Error connecting to server");
      throw new Error("Error connecting to server");
    } else {
      (async () => {
        const res = await axios.put(`${routeUrl}/component/${widgetId}`, {
          data: {...widgetUpdateData},
          headers: {'Authorization': clientId}
        })
        const newWidget: WidgetData = {...widgetUpdateData, moving: false, url: res.data.url};
        setWidgetDataMap(data => ({
          ...copyAllWidgetData(data),
          ...{[res.data.componentId]: newWidget}
        }))
      })();
    }
  }
  
  function deleteWidgetBlind(widgetId: string, clientId: string) {
    deleteWidgetLocal(widgetId);
    (async () => { const res = await axios.delete(`${routeUrl}/component/${widgetId}`, {headers: {'Authorization': clientId}}) })();
  }
  
  function deleteWidgetLocal(widgetId: string) {
    setWidgetDataMap(data => {
      const mapCopy = copyAllWidgetData(data);
      delete mapCopy[widgetId];
      return mapCopy;
    });
  }

  return {addWidget: addNewAndBlindUpdate, updateWidget: updateWidgetBlind, deleteWidget: deleteWidgetBlind, deleteWidgetLocal};
}


const mockData: WidgetDataMap = {
  "1": {
    // id: "1",
    url: "https://cdn.betterttv.net/emote/61892a1b1f8ff7628e6cf843/3x.webp",
    owner: undefined,
    moving: false,
    x: 100,
    y: 100,
    width: 100,
    height: 50
  },
  "2": {
    // id: "2",
    url: "https://cdn.betterttv.net/emote/61892a1b1f8ff7628e6cf843/3x.webp",
    owner: undefined,
    moving: false,
    x: 200,
    y: 200,
    width: 75,
    height: 75
  }
}

const socketUrl = env().socketUrl;
const routeUrl = env().routeUrl;

type PromiseResolve<T> = (value: T | PromiseLike<T>) => void;
type PromiseReject<T> = PromiseResolve<T>;
// type PromiseResolve = (value: string | PromiseLike<string>) => void;

class Deferred<T> {
  resolve: PromiseResolve<T> | undefined;
  reject: PromiseReject<T> | undefined;
  promise: Promise<T>;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.reject = reject
      this.resolve = resolve
    })
  }
}

// interface Deferred<T> {
//   resolve: PromiseResolve<T> | undefined;
//   reject: PromiseReject<T> | undefined;
//   promise: Promise<T>; 
// }

// // eslint-disable-next-line @typescript-eslint/no-redeclare
// const Deferred = function <T>(this: Deferred<T>) {
//   var self = this;
//   this.promise = new Promise(function(resolve, reject) {
//     self.reject = reject
//     self.resolve = resolve
//   })
// } as any as {new <T>(): Deferred<T>; };

export function useDelayedWebSocket() {
  let connectToUrl = useRef<PromiseResolve<string>>();
  // const [connectToUrl, setConnectToUrl] = useState<PromiseResolve<string> | undefined>(); 
  // let a = undefined;
  const delayedUrlResolver = useCallback(async () => {
    return new Promise<string>((resolve) => {
      connectToUrl.current = resolve;
      // setConnectToUrl(resolve);
      // a = resolve;
    });
  }, []);
  return {...useWebSocket(delayedUrlResolver), delayedConnect: connectToUrl.current};
  // return {...useWebSocket(delayedUrlResolver), delayedConnect: connectToUrl.current as PromiseResolve};
}

// TODO: Should be controlled so the editor can access component data properties
// and uncontrolled so that the overlay view can update itself

// Networked overlay that contains the state of all the draggable objects inside of it,
// as well as managing websocket updates to and from the server.
const Overlay = ({dimensions, setDimensions, widgetDataMap, setWidgetDataMap, clientId, style, scale, translateY}: OverlayProps) => {

  // React Hook WebSocket library for now because I'm lazy.
  // sendMessage: Function that sends message data to the server across the websocket connection
  // lastMessage: Last message update from the server
  // TODO: Error handling if clientId ever fails
  const { sendMessage, lastMessage, readyState } = useWebSocket(`${socketUrl}/${clientId}`);

  // TODO: DEBUG
  useEffect(() => {
    console.log("WIDGET DATA CHANGE");
    console.log(JSON.stringify(widgetDataMap));
  }, [widgetDataMap])

  useEffect(() => {
    console.log("OVERLAY LOADED");
  }, []);

  // Message handling
  useEffect(() => {
    // Message shape should match WSMessage types from the server
    if (lastMessage !== null) {
      const messageData = JSON.parse(lastMessage.data);
      console.log("MESSAGE DATA", messageData)
      if (messageData.type === 'update') {
        const {componentId, x, y, width, height} = messageData;
        const objCopy = copyAllWidgetData(widgetDataMap);
        console.log(widgetDataMap === objCopy)
        objCopy[componentId] = Object.assign(objCopy[componentId], {x, y, width, height})
        console.log("SETTER " + JSON.stringify(objCopy[componentId]))
        setWidgetDataMap(objCopy);
      } else if(messageData.type === 'add') {
        const {componentId, x, y, width, height, url} = messageData;
        const objCopy = copyAllWidgetData(widgetDataMap);
        objCopy[componentId] = {x, y, width, height, url, moving: false};
        setWidgetDataMap(objCopy);
      } else if(messageData.type === 'delete') {
        const objCopy = copyAllWidgetData(widgetDataMap);
        delete objCopy[messageData.componentId];
        setWidgetDataMap(objCopy);
      } else if(messageData.type === 'overlay') {
        const {width, height} = messageData;
        setDimensions({width, height});
      }
    }
  }, [lastMessage]);

  // Execute when component ID changes to load existing networked objects
  useEffect(() => {
    (async () => {
      // TODO: I hate the second check... is there any better way or is this normal hook behavior?
      console.log("got client ID", clientId);
      // console.log("delayedConnect", delayedConnect);
      if(clientId !== undefined) {
        // Establish WS connection
        // console.log("establishing delayed WS connection")
        // delayedConnect(`${socketUrl}/${clientId}`);
        // Load and set data from REST
        console.log("requesting components")
        const res = await axios.get(`${routeUrl}/components`, {headers: {'Authorization': clientId}});
        console.log("setting data", res.data);
        setWidgetDataMap(res.data);
      }
    })();
  }, [clientId]);

  // Creates the array of Widget elements that the Overlay will render from provided component data
  const generateWidgets = (data: WidgetDataMap) => {
    const elements = []
    for(let [id, widgetData] of Object.entries(data)) {
      const {x, y, width, height, moving, owner, url} = widgetData;
      elements.push(
        <Widget
          id={id}
          setComponentData={setWidgetDataMap}
          sendMessage={sendMessage}
          x={x} y={y}
          width={width} height={height}
          imageUrl={url}
          moving={moving}
          scale={scale || 1}
          owner={owner}/>
      )
    }
    return elements;
  }

  const overlayStyling: React.CSSProperties = {
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
    transform: `scale(${scale || 1}) translateY(${translateY || 0})`,
    transformOrigin: "top",
    position: "relative",
  }
  return (
    <div style={{...style, ...overlayStyling}}>
      {generateWidgets(widgetDataMap)}
    </div>
  )
}

export default Overlay;