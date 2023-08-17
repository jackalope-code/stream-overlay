import {useCallback, useEffect, useRef, useState } from 'react';
import Widget, { WidgetType } from './Widget';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { copyAllWidgetData, env } from './utils';
import axios, { AxiosResponse } from 'axios';
import { YoutubeAPIProvider } from './Youtube';
import { object, string, number, date, InferType, boolean, lazy, mixed, ref } from 'yup';


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
  isView: boolean;
}

export interface VideoData {
  timeElapsed: number;
  playing: boolean;
  loop: boolean;
}

interface IWidget {
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  moving: boolean;
  owner?: string;
  type: string;
}

export interface WidgetEvent {
  data: WidgetData;
  event: string;
}

export interface StaticWidgetData extends IWidget {
  type: "image" | "embed";
  videoData: never;
}

export interface VideoWidgetData extends IWidget {
  type: "video";
  videoData: VideoData
}

export type WidgetData = StaticWidgetData | VideoWidgetData;

export interface WidgetUpdateData extends Omit<WidgetData, 'url'> {};

// export interface WidgetUpdateData {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   startTime?: number;
// }

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

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

export function offsetToStartTime(offsetSeconds: number): number {
  return Math.round(Date.now() / 1000 + offsetSeconds);
}

export function startTimeToOffset(startTimeSeconds: number): number {
  return Math.round((startTimeSeconds * 1000 - Date.now())/1000);
}

export interface VideoData {
  timeElapsed: number;
  playing: boolean;
  loop: boolean;
}

const requiredNonNegativeInt = number().required().integer().min(0, '');

const videoUpdatePartial = object({
  startTime: requiredNonNegativeInt,
  playing: boolean().required(),
  loop: boolean().required(),
});

const videoUpdateMessage = videoUpdatePartial.shape({
  id: number().required().positive()
})

const testUpdate = {
  id: 1,
  event: 'update',
  x: 0,
  y: 0,
  width: 1,
  height: 1,
}

const updateMessage = object({
  id: number().required().positive(),
  event: string().required().oneOf(['update']),
  x: requiredNonNegativeInt,
  y: requiredNonNegativeInt,
  width: number().required().positive(),
  height: number().required().positive(),
});

// otherwise: object().notRequired(),
const addMessage = updateMessage.concat(
  object().shape({
    // TODO: restrict to youtube for videos
   url: string().required(),
   event: string().required().oneOf(['add']),
   type: string().required().oneOf(['image', 'video']),
   videoData: object().when('type', {
    is: 'video',
    then: schema => videoUpdatePartial,
  }),
}))

// TODO
const messageEditorChangeSchema = object({

});

export function useOverlay(setWidgetDataMap: React.Dispatch<React.SetStateAction<WidgetDataMap>>): UseOverlayHelpers {
  function addNewAndBlindUpdate(widgetData: WidgetData, clientId: string) {
    console.log('Add', widgetData);
    // TODO: error handling if not connected to WS client
    if(!clientId) {
      throw new Error("Error connecting to server");
    } else {
      (async () => {
        const res = await axios.post(`${routeUrl}/component`, {...widgetData})
        setWidgetDataMap(data => ({
          ...copyAllWidgetData(data),
          ...{[res.data.componentId]: widgetData}
        }));
      })();
    }
  }

  function updateWidgetBlind(widgetData: WidgetUpdateData, widgetId: string, clientId: string) {
    // TODO: error handling if not connected to WS client
    if(!clientId) {
      throw new Error("Error connecting to server");
    } else {
      (async () => {
        const res = await axios.put(`${routeUrl}/component/${widgetId}`, {...widgetData})
        const newWidget: WidgetData = {...widgetData, moving: false, url: res.data.url};
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
const Overlay = ({dimensions, setDimensions, widgetDataMap, setWidgetDataMap, clientId, style, scale, translateY, editorWidgetControls, isView}: OverlayProps) => {

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
      const messageEvent: WidgetEvent = JSON.parse(lastMessage.data);

      if (messageEvent.event === 'update') {
        const {componentId, x, y, width, height, startTime, type, videoData} = messageEvent.data;
        const objCopy = copyAllWidgetData(widgetDataMap);
        objCopy[componentId] = Object.assign(objCopy[componentId], {x, y, width, height, startTime, type, videoData})
        setWidgetDataMap(objCopy);
      } else if(messageEvent.event === 'add') {
        const {componentId, x, y, width, height, url, type, videoData} = messageEvent.data;
        const objCopy = copyAllWidgetData(widgetDataMap);
        objCopy[componentId] = {x, y, width, height, url, moving: false, type, videoData};
        setWidgetDataMap(objCopy);
      } else if(messageEvent.event === 'delete') {
        const objCopy = copyAllWidgetData(widgetDataMap);
        delete objCopy[messageEvent.componentId];
        setWidgetDataMap(objCopy);
      } else if(messageEvent.event === 'overlay') {
        const {width, height} = messageEvent;
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
      const {x, y, width, height, moving, owner, url, videoData} = widgetData;
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
          videoData={videoData || undefined}
          isOverlayView={isView}
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
    <div autoFocus style={{...style, ...overlayStyling}}>
      <YoutubeAPIProvider>
        {generateWidgets(widgetDataMap)}
      </YoutubeAPIProvider>
    </div>
  )
}

export default Overlay;