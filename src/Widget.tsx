import axios from 'axios';
import { MouseEventHandler, useState } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import { SendMessage } from 'react-use-websocket';
import { MockData } from './Overlay';
import { copyAllWidgetData } from './utils';

export interface WidgetProps {
  id: string;
  owner?: string;
  moving: boolean;
  x: number;
  y: number;
  setComponentData: React.Dispatch<React.SetStateAction<MockData>>;
  sendMessage: SendMessage;
}

// Draggable widgets managed by the Overlay component. Uses the react-draggable npm package to manage dragging logic.
const Widget: React.FC<WidgetProps> = ({id, owner, x, y, sendMessage, setComponentData}) => {
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
    sendMessage(JSON.stringify({id: id, x: data.x, y: data.y}))
    setComponentData((prevState) => {
      const objCopy = copyAllWidgetData(prevState);
      const newData = Object.assign(objCopy, {[id]: {...objCopy[id], x: data.x, y: data.y}})
      return newData;
    })
  }

  const draggableStyling: React.CSSProperties = {
    top: "0",
    left: "0",
    position: "absolute",
    cursor: "grab",
  };

  const otherStyling: React.CSSProperties = {
    width: "50px",
    height: "50px",
    backgroundColor: "green",
  }

  const combinedStyling = {...draggableStyling, ...otherStyling};

  return (
      <Draggable
        onStart={dragStartHandler}
        onStop={dragStopHandler}
        onDrag={dragUpdateHandler}
        position={{x, y}}
        disabled={disabled}
        // bounds={{left: 0, top: 0}}
      >
        {/* Text placeholder. Images and videos would go here. of */}
        <div id={id} style={combinedStyling}>Drag me!</div>
      </Draggable>
  )
}

export default Widget;