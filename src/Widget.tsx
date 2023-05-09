import axios from 'axios';
import { CSSProperties, MouseEventHandler, useCallback, useEffect, useState } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import { SendMessage } from 'react-use-websocket';
import { VideoData, WidgetData, WidgetDataMap, startTimeToOffset } from './Overlay';
import { copyAllWidgetData } from './utils';
import { debounce, throttle } from 'lodash';
import {Youtube} from "./Youtube";
import YouTube from "react-youtube";


export interface WidgetProps {
  id: string;
  // owner?: string;
  // moving: boolean;
  // x: number;
  // y: number;
  // width: number;
  // height: number;
  // srcUrl: string;
  owner?: string;
  moving: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  srcUrl: string;

  scale?: number;
  setComponentData: React.Dispatch<React.SetStateAction<WidgetDataMap>>;
  sendMessage: SendMessage;
  type: WidgetType;
  videoData?: VideoData; 
  draggableChildren?: JSX.Element;
  isOverlayView: boolean;
}

export enum WidgetType {
  Image,
  Video,
  Embed
}

// TODO: Set as an env var and enforce updates from server env
const UPDATE_WAIT_TIME = 50;

// Draggable widgets managed by the Overlay component. Uses the react-draggable npm package to manage dragging logic.
const Widget: React.FC<WidgetProps> = ({id, owner, x, y, width, height, srcUrl, scale, videoData, sendMessage, setComponentData, type, isOverlayView, draggableChildren}) => {
  // Unused state variable
  // https://react.dev/reference/react/useState
  const [disabled, setDisabled] = useState(false);
  
  function buildWidget(x: number, y: number) {
    return {componentId: id, x, y, width, height}
  }

 
  const [dragging, setDragging] = useState(false);
  const [active, setActive] = useState(false);
  
  // useEffect(() => {
  //   if(youtube) {
  //     console.log("YOUTUBE", youtube);
  //     console.log((youtube as any).Player.getDuration());

  //   }
  //   console.log("PLAN B", window.YT)
  // }, []);

  const dragStartHandler: DraggableEventHandler = (e, data) => {
    // console.log("Drag start");
  }

  const dragStopHandler: DraggableEventHandler = (e, data) => {
    // console.log("Drag stop");
    setDragging(false);
    sendDragUpdate(buildWidget(data.x, data.y))
  }

  const sendDragUpdate = useCallback(throttle((widgetData: {x: number, y: number}) => {
    sendMessage(JSON.stringify({componentId: id, x: widgetData.x, y: widgetData.y, width, height}))
  }, UPDATE_WAIT_TIME), []);

  const dragUpdateHandler: DraggableEventHandler = (e, data) => {
    // e.stopPropagation();
    setDragging(true);
    setComponentData((prevState) => {
      const objCopy = copyAllWidgetData(prevState);
      const newData = Object.assign(objCopy, {[id]: {...objCopy[id], x: data.x, y: data.y}})
      return newData;
    })
    const widget = {x: data.x, y: data.y, width, height};
    sendDragUpdate(widget);
    // dragUpdateLimiter.removeTokens(1).then(() => {
    //   sendMessage(JSON.stringify({componentId: id, x: data.x, y: data.y, width, height}))
    // })
  }

  const draggableStyling: React.CSSProperties = {
    top: "0",
    left: "0",
    position: "absolute",
    cursor: "grab",
  };

  const otherStyling: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    background: 'rgba(0, 0, 0, 0)',
  }

  const combinedStyling = {...draggableStyling, ...otherStyling};

  function wrapActiveToggle(iframe: JSX.Element) {
    return (
    <div style={{display: "absolute"}}>
      {iframe}
      <div style={{width: "100%", height: "100%", background: "rgba(255, 150, 150, 0.8)", pointerEvents: "none", position: "relative"}} />
    </div>
    );
  }


  function onYoutubePlayerChange() {
    console.log("Youtube player changed.")
  }

  function renderEmbed() {
    switch(WidgetType.Embed) {
      case WidgetType.Embed:
        // Default to 0 if the offset is missing
        // const offsetSeconds = startTime ? startTimeToOffset(startTime) : 0;
        let offsetSeconds = 6;
        const timedUrl = `${srcUrl}?autoplay=1&enablejsapi=1&controls=1&start=${offsetSeconds}`
        // const embed = <iframe style={frameContainerIframeStyle} allow="autoplay" draggable="false" onDragStart={() => false} width={width} height={height} src={timedUrl} />

        // TODO: CURRENT
        //const embed = <iframe  allow="autoplay" draggable="false" onDragStart={() => false} width={width} height={height} src={timedUrl} style={{pointerEvents: dragging ? 'none' : 'auto'}}/>

        // if(srcUrl.includes('/embed/')) {

        // }

        // TODO: IMPORTANT: ADD OTHER VIDEO DATA COMPONENTS... PLAYING AND LOOP
        const videoId = srcUrl.split("/embed/").pop()?.split("?")[0];
        const embed = <Youtube
          disableMouseEvents={dragging}
          srcUrl={srcUrl}
          playerId={id}
          width={width}
          height={height}
          videoId={videoId as string}
          startTime={videoData ? videoData.timeElapsed : undefined}
          onPlayerStateChange={onYoutubePlayerChange}
          showAsView={isOverlayView}
        />

        function handleReady(event: any) {
          event.target.playVideo();
          console.log("player ready");
        }

        // TODO: Check for properly formatted URL
        // const videoId = srcUrl.split("/embed/").pop()?.split("?")[0];
        // const opts = {
        //   width,
        //   height,
        //   start: offsetSeconds,
        //   playerVars: {
        //     autoplay: 1
        //   }
        // }
        // const embed = <YouTube
        //   videoId={videoId}
        //   id={`youtube-player:${id}`}
        //   opts={opts}
        //   // width={width}
        //   // height={height}
        //   onReady={handleReady}

        // />

        // const embed = <iframe width={width} height={height} src={srcUrl} draggable="false" />;
        // if(active) {
        //   return embed;
        // } else {
        //   return wrapActiveToggle(embed);
        // }
        return embed;
    }
  }

  return (
    draggableChildren ? (
      <Draggable
        onStart={dragStartHandler}
        onStop={dragStopHandler}
        onDrag={dragUpdateHandler}
        position={{x, y}}
        disabled={disabled}
        scale={scale || 1}
        // bounds={{left: 0, top: 0}}
      >
        {/* Text placeholder. Images and videos would go here. of */}
        <div id={id} style={{...combinedStyling, transition: "transform 1s;"}}>
          {draggableChildren as JSX.Element}
          {renderEmbed()}
        </div>
      </Draggable>
  
    )
    :
    (
      <Draggable
      onStart={dragStartHandler}
      onStop={dragStopHandler}
      onDrag={dragUpdateHandler}
      position={{x, y}}
      disabled={disabled}
      scale={scale || 1}
      // bounds={{left: 0, top: 0}}
    >
      {/* Text placeholder. Images and videos would go here. of */}
      <div id={id} style={combinedStyling}>
        {renderEmbed()}
      </div>
    </Draggable>
  

    )
  )
}

export default Widget;