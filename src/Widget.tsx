import axios from 'axios';
import { MouseEventHandler, useState } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import { SendMessage } from 'react-use-websocket';
import { WidgetDataMap } from './Overlay';
import { copyAllWidgetData } from './utils';

export interface WidgetProps {
  id: string;
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
  draggableChildren?: JSX.Element;
}

export enum WidgetType {
  Image,
  Video,
  Embed
}

// Draggable widgets managed by the Overlay component. Uses the react-draggable npm package to manage dragging logic.
const Widget: React.FC<WidgetProps> = ({id, owner, x, y, width, height, srcUrl, scale, sendMessage, setComponentData, type, draggableChildren}) => {
  // Unused state variable
  // https://react.dev/reference/react/useState
  const [disabled, setDisabled] = useState(false);
  
  const dragStartHandler: DraggableEventHandler = (e, data) => {
    // console.log("Drag start");
  }

  const dragStopHandler: DraggableEventHandler = (e, data) => {
    // console.log("Drag stop");
  }

  const dragUpdateHandler: DraggableEventHandler = (e, data) => {
    setComponentData((prevState) => {
      const objCopy = copyAllWidgetData(prevState);
      const newData = Object.assign(objCopy, {[id]: {...objCopy[id], x: data.x, y: data.y}})
      return newData;
    })
    sendMessage(JSON.stringify({componentId: id, x: data.x, y: data.y, width, height}))
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

  function renderEmbed() {
    switch(type) {
      case WidgetType.Image:
        return <img src={srcUrl} draggable={false} style={{maxWidth: "100%", maxHeight: "100%"}}/>
        break;
      case WidgetType.Video:
      case WidgetType.Embed:
        return <iframe width={width} height={height} src={srcUrl} />
        break;
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
        <div id={id} style={combinedStyling}>
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