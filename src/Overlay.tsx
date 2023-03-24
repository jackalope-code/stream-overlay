import { createRef, useEffect } from 'react';
import Widget from './Widget';
import useWebSocket, { ReadyState } from 'react-use-websocket';

interface WidgetData {
  x: number;
  y: number;
  moving: boolean;
  owner?: string;
}

interface MockData {
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
  const parent = createRef();

  const { sendMessage, lastMessage, readyState } = useWebSocket<{id: string}>(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      const messageData = lastMessage.data;
      const {id, x, y} = JSON.parse(messageData);
      const movingRef = mockData[id];
      mockData[id] = {...movingRef, x, y}
    }
      // mockData.set(id, {...mockData.get(id), x: ((lastMessage as any).x as number), y: ((lastMessage as any).y as number)});
  }, [lastMessage]);
  
  const generateWidgets = (data: MockData) => {
    const elements = []
    for(let [id, widgetData] of Object.entries(mockData)) {
      console.log(id);
      const {x, y, moving, owner} = widgetData;
      elements.push(
        <Widget id={id} sendMessage={sendMessage} x={x} y={y} moving={moving} owner={owner}/>
      )
    }
    console.log(elements);
    return elements;
  }

  return (
    <>
      <div style={{width: "100px", height: "100px", backgroundColor: "red"}}>
        test
      </div>
      {generateWidgets(mockData)}
    </>
  )
}

export default Overlay;