import axios from 'axios';
import { MouseEventHandler, useState } from 'react';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import { SendMessage } from 'react-use-websocket';

export interface WidgetProps {
  id: string;
  owner?: string;
  moving: boolean;
  x: number;
  y: number;
  sendMessage: SendMessage;
}

interface LimitedProps {
  id: string;
  moving: boolean;
}

const queryMoving = async (id: string) => {
  const res = await axios.get<LimitedProps>(`http://localhost:4000/components/${id}`);
  return res.data.moving;
}

const Widget: React.FC<WidgetProps> = ({id, owner, x, y, sendMessage}) => {
  // const [x, setX] = useState(startX);
  // const [y, setY] = useState(startY);
  const [disabled, setDisabled] = useState(false);
  const [userLock, setUserLock] = useState(false);

  // TODO: time out if the network call fails
  // TODO: release the handle and default to not moving if the client disconnects (the server should keep querying back.. this is websockets)

  // const mouseDownHandler = (e: MouseEvent) => {
  //   console.log("MOUSE DOWN");
  //   const element = e.currentTarget as HTMLElement;
  //   const id = element.id;
  //   (async () => {
  //     const moving = await queryMoving(id);
  //     console.log("moving lock? " + moving)
  //     if(!moving) {
  //       setDisabled(false);
  //       // TODO: update the web server with the lock
  //       console.log("set lock")
  //     }
  //   })();
  // }
  
  const dragStartHandler: DraggableEventHandler = (e, data) => {
    queryMoving(id).then(locked => {
      if(locked) {
        setDisabled(true);
      }
    })
    console.log("Drag start");
  }

  const dragStopHandler: DraggableEventHandler = (e, data) => {
    console.log("Drag stop");
  }

  const dragUpdateHandler: DraggableEventHandler = (e, data) => {
    sendMessage(JSON.stringify({id: id, x: data.x, y: data.y}))
    console.log("Drag update");
    // TODO: NEEDS TO UPDATE LOCALLY AS WELL
    // setX(data.x);
    // setY(data.y);
    console.log(data);
    console.log(data.node.id);
  }

  return (

      <Draggable
        // offsetParent={parent}
        onStart={dragStartHandler}
        onStop={dragStopHandler}
        onDrag={dragUpdateHandler}
        // onMouseDown={mouseDownHandler}
        position={{x, y}}
        disabled={disabled}
        // bounds={{left: 0, top: 0}}
      >
        <div id={id} style={{top: "0", left: "0", position: "absolute", cursor: "grab"}}>Hello!</div>
      </Draggable>
  )
}

export default Widget;