import {useCallback, useEffect, useRef, useState } from 'react';
import Widget, { WidgetType } from './Widget';
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
  editorWidgetControls?: EditorWidgetControls;
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

type EditorWidgetControls = {
  'Image': JSX.Element | undefined,
  'Video': JSX.Element | undefined,
  'Embed': JSX.Element | undefined
};

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
    console.log('Add', newWidget);
    // TODO: error handling if not connected to WS client
    if(!clientId) {
      throw new Error("Error connecting to server");
    } else {
      (async () => {
        const res = await axios.post(`${routeUrl}/component`, {...newWidget})
        setWidgetDataMap(data => ({
          ...copyAllWidgetData(data),
          ...{[res.data.componentId]: newWidget}
        }));
      })();
    }
  }

  function updateWidgetBlind(widgetData: WidgetUpdateData, widgetId: string, clientId: string) {
    const widgetUpdateData: WidgetUpdateData = {
      x: widgetData.x,
      y: widgetData.y,
      width: widgetData.width,
      height: widgetData.height
    }
    // TODO: error handling if not connected to WS client
    if(!clientId) {
      throw new Error("Error connecting to server");
    } else {
      (async () => {
        const res = await axios.put(`${routeUrl}/component/${widgetId}`, {...widgetUpdateData})
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
    (async () => { const res = await axios.delete(`${routeUrl}/component/${widgetId}`, /*{headers: {'Authorization': clientId}}*/) })();
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


const socketUrl = env().socketUrl;
const routeUrl = env().routeUrl;

type PromiseResolve<T> = (value: T | PromiseLike<T>) => void;
type PromiseReject<T> = PromiseResolve<T>;
// type PromiseResolve = (value: string | PromiseLike<string>) => void;


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
const Overlay = ({dimensions, setDimensions, widgetDataMap, setWidgetDataMap, clientId, style, scale, translateY, editorWidgetControls}: OverlayProps) => {

  // React Hook WebSocket library for now because I'm lazy.
  // sendMessage: Function that sends message data to the server across the websocket connection
  // lastMessage: Last message update from the server
  // TODO: Error handling if clientId ever fails
  const { sendMessage, lastMessage, readyState } = useWebSocket(`${socketUrl}/?clientId=${clientId}`);
  // const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  // TODO: DEBUG
  // useEffect(() => {
  //   console.log("WIDGET DATA CHANGE");
  //   console.log(JSON.stringify(widgetDataMap));
  // }, [widgetDataMap])

  // Message handling
  useEffect(() => {
    // Message shape should match WSMessage types from the server
    if (lastMessage !== null) {
      const messageData = JSON.parse(lastMessage.data);
      if (messageData.type === 'update') {
        const {componentId, x, y, width, height} = messageData;
        const objCopy = copyAllWidgetData(widgetDataMap);
        objCopy[componentId] = Object.assign(objCopy[componentId], {x, y, width, height})
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
      // console.log("got client ID", clientId);
      if(clientId !== undefined) {
        // Establish WS connection
        // delayedConnect(`${socketUrl}/${clientId}`);
        // Load and set data from REST
        const res = await axios.get(`${routeUrl}/components`, /*{headers: {'Authorization': clientId}}*/);
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
          srcUrl={url}
          moving={moving}
          scale={scale || 1}
          owner={owner}
          // TODO: IMPORTANT TYPE
          type={WidgetType.Video}
          draggableChildren={editorWidgetControls ? editorWidgetControls.Video : undefined}
          />
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