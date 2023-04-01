import {useEffect, useState } from 'react';
import Widget from './Widget';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { copyAllWidgetData } from './utils';
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

export interface WidgetDataMap {
  [key: string]: WidgetData;
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

const socketUrl = process.env.REACT_APP_DEV_WS_URL as string;
const routeUrl = process.env.REACT_APP_DEV_REST_URL as string;

if(!socketUrl || !routeUrl) {
  throw new Error("Could not locate environment variables. \
  Requires REACT_APP_DEV_WS_URL and REACT_APP_DEV_ROUTE_URL to be set.")
}

// TODO: Should be controlled so the editor can access component data properties
// and uncontrolled so that the overlay view can update itself

// Networked overlay that contains the state of all the draggable objects inside of it,
// as well as managing websocket updates to and from the server.
const Overlay = ({dimensions, setDimensions, widgetDataMap, setWidgetDataMap, clientId, setClientId, style, scale, translateY}: OverlayProps) => {

  // React Hook WebSocket library for now because I'm lazy.
  // sendMessage: Function that sends message data to the server across the websocket connection
  // lastMessage: Last message update from the server
  const { sendMessage, lastMessage, readyState } = useWebSocket<{id: string}>(socketUrl);

  // Message handling
  useEffect(() => {
    // Message shape should match WSMessage types from the server
    if (lastMessage !== null) {
      const messageData = JSON.parse(lastMessage.data);
      console.log("MESSAGE DATA", messageData)
      if(messageData.type === 'connect') {
        const {clientId} = messageData;
        console.log("set clientId")
        setClientId(clientId);
      } else if(messageData.type === 'update') {
        const {componentId, x, y} = messageData;
        const objCopy = copyAllWidgetData(widgetDataMap);
        objCopy[componentId] = Object.assign(objCopy[componentId], {x, y})
        setWidgetDataMap(objCopy);
      } else if(messageData.type === 'add') {
        const {componentId, x, y, width, height, url} = messageData;
        const objCopy = copyAllWidgetData(widgetDataMap);
        objCopy[componentId] = {x, y, width, height, url, moving: false};
        setWidgetDataMap(objCopy);
      } else if(messageData.type === 'overlay') {
        const {width, height} = messageData;
        setDimensions({width, height});
      }
    }
  }, [lastMessage]);

  // Execute when component loads
  useEffect(() => {
    (async () => {
      if(clientId !== undefined) {
        console.log("making async request")
        const res = await axios.get(`${routeUrl}/components`);
        console.log("async data");
        console.log(res.data);
        setWidgetDataMap(res.data);
      }
    })();
  }, [clientId])
  
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
      <div style={{width: "100px", height: "100px", backgroundColor: "red"}}>
        Some blocky component that doesn't move
      </div>
      {generateWidgets(widgetDataMap)}
    </div>
  )
}

export default Overlay;