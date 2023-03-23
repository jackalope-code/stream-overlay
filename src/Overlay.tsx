import { createRef } from 'react';
import Widget from './Widget';

const mockData = [
  {
    id: "1",
    owner: undefined,
    moving: false,
    x: 100,
    y: 100,
  },
  {
    id: "2",
    owner: undefined,
    moving: false,
    x: 200,
    y: 200,
  }
]

const Overlay = () => {
  const parent = createRef();

  return (
    <>
      <div style={{width: "100px", height: "100px", backgroundColor: "red"}}>
        test
      </div>
      {mockData.map((data) => {
        return <Widget id={data.id} startX={data.x} startY={data.y} moving={data.moving} owner={data.owner}/>
      })}
    </>
  )
}

export default Overlay;