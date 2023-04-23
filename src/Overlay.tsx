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
  setClientId: React.Dispatch<React.SetStateAction<string | undefined>>;
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

export function useOverlay(setWidgetDataMap: SetState<WidgetDataMap>, widgetDataMap: WidgetDataMap, clientId: string | undefined) {
  console.log("RUN ADD " + JSON.stringify(widgetDataMap));
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
          ...newWidget,
          clientId
        })
        setWidgetDataMap(data => ({
          ...copyAllWidgetData(data),
          ...{[res.data.componentId]: newWidget}
        }));
      })();
    }
  }
  function updateWidgetBlind(widgetData: WidgetUpdateData, widgetId: string, clientId: string): UseOverlay | void {
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
          ...widgetUpdateData,
          clientId
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
    (async () => { const res = await axios.delete(`${routeUrl}/component/${widgetId}`, {data: {clientId}}) })();
  }

  function deleteWidgetLocal(widgetId: string) {
    setWidgetDataMap(data => {
      const mapCopy = copyAllWidgetData(data);
      delete mapCopy[widgetId];
      return mapCopy;
    });
  }

  return [{clientId, widgetDataMap}, {
    addWidget: addNewAndBlindUpdate,
    updateWidget: updateWidgetBlind,
    deleteWidgetLocal: deleteWidgetLocal,
    deleteWidget: deleteWidgetBlind,
  }];
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

type PromiseResolve = (value: string | PromiseLike<string>) => void;

export function useDelayedWebSocket() {
  let connectToUrl = useRef<PromiseResolve>();
  const delayedUrlResolver = useCallback(async () => {
    return await new Promise<string>((resolve) => {
      connectToUrl.current = resolve;
    });
  }, []);
  return {...useWebSocket(delayedUrlResolver), delayedConnect: connectToUrl.current as PromiseResolve};
}

// TODO: Should be controlled so the editor can access component data properties
// and uncontrolled so that the overlay view can update itself

// Networked overlay that contains the state of all the draggable objects inside of it,
// as well as managing websocket updates to and from the server.
const Overlay = ({dimensions, setDimensions, widgetDataMap, setWidgetDataMap, clientId, setClientId, style, scale, translateY}: OverlayProps) => {

  // React Hook WebSocket library for now because I'm lazy.
  // sendMessage: Function that sends message data to the server across the websocket connection
  // lastMessage: Last message update from the server
  const { delayedConnect, sendMessage, lastMessage, readyState } = useDelayedWebSocket();

  // TODO: DEBUG
  useEffect(() => {
    console.log("WIDGET DATA CHANGE");
    console.log(JSON.stringify(widgetDataMap));
  }, [widgetDataMap])

  useEffect(() => {
    console.log("OVERLAY LOADED");
  }, []);

  useEffect(() => {
    if(clientId !== undefined) {
      const ws = new WebSocket(`${socketUrl}/${clientId}`);
      function onMessage(e: any) {
        ws.close();
      }
      ws.onmessage = onMessage;
    }
  }, [clientId]);

  // Message handling
  useEffect(() => {
    // Message shape should match WSMessage types from the server
    if (lastMessage !== null) {
      const messageData = JSON.parse(lastMessage.data);
      console.log("MESSAGE DATA", messageData)
      if(messageData.type === 'connect') {
        const {clientId} = messageData;
        setClientId(clientId);
      } else if(messageData.type === 'update') {
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
      if(clientId !== undefined) {
        // Establish WS connection
        delayedConnect(`${socketUrl}/${clientId}`);
        // Load and set data from REST
        const res = await axios.get(`${routeUrl}/components`, {data: {clientId}});
        setWidgetDataMap(res.data);
      }
    })();
  }, [clientId])

  // Login
  useEffect(() => {
    (async () => {
      const res = await axios.post(`${routeUrl}/auth`, {
        password: "claymore"
      });
      setClientId(res.data.clientId);
    })();
  }, [])

  
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