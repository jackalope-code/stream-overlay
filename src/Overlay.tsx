import {useEffect, useState } from 'react';
import Widget from './Widget';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { copyAllWidgetData } from './utils';
import axios, { AxiosResponse } from 'axios';

export interface OverlayProps {
  width: number;
  height: number;
  style?: React.CSSProperties;
  scale?: number;
  translateY?: string;
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

export interface MockData {
  [key: string]: WidgetData;
}

const mockData: MockData = {
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

const socketUrl = "ws://localhost:4000";
const routeUrl = "http://localhost:4000";

// TODO: Should be controlled so the editor can access component data properties
// and uncontrolled so that the overlay view can update itself

// Networked overlay that contains the state of all the draggable objects inside of it,
// as well as managing websocket updates to and from the server.
const Overlay = ({width, height, style, scale, translateY}: OverlayProps) => {
  // Tracks all the draggable networked components in one object
  // Initialized to mockData and should have the same shape
  // https://react.dev/reference/react/useState
  const [componentData, setComponentData] = useState<MockData>({});

  const [clientId, setClientId] = useState();

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
        const objCopy = copyAllWidgetData(componentData);
        objCopy[componentId] = Object.assign(objCopy[componentId], {x, y})
        setComponentData(objCopy);
      } else if(messageData.type === 'add') {
        const {componentId, x, y, width, height, url} = messageData;
        const objCopy = copyAllWidgetData(componentData);
        objCopy[componentId] = {x, y, width, height, url, moving: false};
        setComponentData(objCopy);
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
        setComponentData(res.data);
      }
    })();
  }, [clientId])
  
  // Creates the array of Widget elements that the Overlay will render from provided component data
  const generateWidgets = (data: MockData) => {
    const elements = []
    for(let [id, widgetData] of Object.entries(data)) {
      const {x, y, width, height, moving, owner, url} = widgetData;
      elements.push(
        <Widget
          id={id}
          setComponentData={setComponentData}
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
    width: `${width}px`,
    height: `${height}px`,
    transform: `scale(${scale || 1}) translateY(${translateY || 0})`,
    transformOrigin: "top",
    position: "relative",
  }
  return (
    <div style={{...style, ...overlayStyling}}>
      <div style={{width: "100px", height: "100px", backgroundColor: "red"}}>
        Some blocky component that doesn't move
      </div>
      {generateWidgets(componentData)}
    </div>
  )
}

export default Overlay;