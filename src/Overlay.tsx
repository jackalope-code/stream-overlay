import { createRef, useEffect, useState } from 'react';
import Widget from './Widget';
import useWebSocket, { ReadyState } from 'react-use-websocket';

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


//  .reduce((map: any, obj: any) => {
//   const copy = {...obj};
//   delete copy.id;
//   return map[obj.id] = copy;
// })

const socketUrl = "ws://localhost:4000";

const Overlay = () => {
  const [componentData, setComponentData] = useState(mockData);

  const { sendMessage, lastMessage, readyState } = useWebSocket<{id: string}>(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      console.log("RECEIVED UPDATE MESSAGE");
      const messageData = lastMessage.data;
      const {id, x, y} = JSON.parse(messageData);
      const movingRef = mockData[id];
      mockData[id] = {...movingRef, x, y}
    }
      // mockData.set(id, {...mockData.get(id), x: ((lastMessage as any).x as number), y: ((lastMessage as any).y as number)});
  }, [lastMessage]);
  
  const generateWidgets = (data: MockData) => {
    const elements = []
    for(let [id, widgetData] of Object.entries(data)) {
      const {x, y, moving, owner} = widgetData;
      elements.push(
        <Widget id={id} setComponentData={setComponentData} sendMessage={sendMessage} x={x} y={y} moving={moving} owner={owner}/>
      )
    }
    return elements;
  }

  return (
    <>
      <div style={{width: "100px", height: "100px", backgroundColor: "red"}}>
        test
      </div>
      {generateWidgets(componentData)}
    </>
  )
}

export default Overlay;