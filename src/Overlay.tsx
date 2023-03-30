import {useEffect, useState } from 'react';
import Widget from './Widget';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { copyAllWidgetData } from './utils';

export interface OverlayProps {
  width: number;
  height: number;
  style?: React.CSSProperties;
  scale?: number;
  translateY?: string;
}

export interface WidgetData {
  x: number;
  y: number;
  moving: boolean;
  owner?: string;
}

export interface MockData {
  [key: string]: WidgetData;
}

const mockData: MockData = {
  "1": {
    // id: "1",
    owner: undefined,
    moving: false,
    x: 100,
    y: 100,
  },
  "2": {
    // id: "2",
    owner: undefined,
    moving: false,
    x: 200,
    y: 200,
  }
}

const socketUrl = "ws://localhost:4000";

// TODO: Should be controlled so the editor can access component data properties
// and uncontrolled so that the overlay view can update itself

// Networked overlay that contains the state of all the draggable objects inside of it,
// as well as managing websocket updates to and from the server.
const Overlay = ({width, height, style, scale, translateY}: OverlayProps) => {
  // Tracks all the draggable networked components in one object
  // Initialized to mockData and should have the same shape
  // https://react.dev/reference/react/useState
  const [componentData, setComponentData] = useState(mockData);

  // React Hook WebSocket library for now because I'm lazy.
  // sendMessage: Function that sends message data to the server across the websocket connection
  // lastMessage: Last message update from the server
  const { sendMessage, lastMessage, readyState } = useWebSocket<{id: string}>(socketUrl);

  // useEffect Hooks run called when the component first loads and when any variables that it watches change.
  // The first parameter is a function that performs changes
  // The second parameter is a dependency array that watches for changes to the provided variables
  // This hook executes every time the last message from the server changes.
  useEffect(() => {
    if (lastMessage !== null) {
      const messageData = lastMessage.data;
      console.log("MESSAGE DATA", messageData)
      const {componentId, x, y} = JSON.parse(messageData);
      const objCopy = copyAllWidgetData(componentData);
      objCopy[componentId] = Object.assign(objCopy[componentId], {x, y})
      setComponentData(objCopy);
    }
  }, [lastMessage]);
  
  // Creates the array of Widget elements that the Overlay will render from provided component data
  const generateWidgets = (data: MockData) => {
    const elements = []
    for(let [id, widgetData] of Object.entries(data)) {
      const {x, y, moving, owner} = widgetData;
      elements.push(
        <Widget
          id={id}
          setComponentData={setComponentData}
          sendMessage={sendMessage}
          x={x} y={y}
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