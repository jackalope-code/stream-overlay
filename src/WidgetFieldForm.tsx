// import styled from 'styled-components';

import axios from "axios";
import { WidgetDataMap } from "./Overlay";
import { copyAllWidgetData, env } from "./utils";

// const Input = styled.input(props => {
//   return `
//     width: 15ch;
// `});

interface WidgetFormProps {
  setWidgetDataMap: React.Dispatch<React.SetStateAction<WidgetDataMap>>;
  widgetDataMap: WidgetDataMap;
  clientId: string | undefined;
}
export default function WidgetFieldForm({setWidgetDataMap, widgetDataMap, clientId}: WidgetFormProps)  {
  // const formStyling: React.CSSProperties = {
  //   "form input"
  //   width: "15ch"
  // }
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const target = e.currentTarget;
    // TODO: form validation
    const elements = target.elements as typeof target.elements & {
      urlInput: {value: string},
      xInput: {value: string},
      yInput: {value: string},
      widthInput: {value: string},
      heightInput: {value: string}
    }
    const newWidget = {
      url: elements.urlInput.value,
      x: parseInt(elements.xInput.value),
      y: parseInt(elements.yInput.value),
      width: parseInt(elements.widthInput.value),
      height: parseInt(elements.heightInput.value)
    }
    // TODO: error handling if not connected to WS client
    if(!clientId) {
      alert("Error connecting to server");
    } else {
      (async () => {
        const res = await axios.post(`${env().routeUrl}/component`, {
          ...newWidget,
          clientId
        })
        console.log("before", widgetDataMap)
        setWidgetDataMap(data => ({
          ...copyAllWidgetData(data),
          ...{[res.data.componentId]: newWidget}
        }))
        console.log("after", widgetDataMap)
      })();
    }
  }

  return (
    <div >
      <form
        style={{display: "flex", flexDirection: "row", columnGap: "10px"}}
        onSubmit={handleFormSubmit}
      >
        <label>
          URL:
          <input type="text" name="urlInput" defaultValue={"https://cdn.betterttv.net/emote/61892a1b1f8ff7628e6cf843/3x.webp"}/>
        </label>
        <label>
          X:
          <input type="number" name="xInput" />
        </label>
        <label>
          Y:
          <input type="number" name="yInput" />
        </label>
        <label>
          Width:
          <input type="number" name="widthInput" />
        </label>
        <label>
          Height:
          <input type="number" name="heightInput" />
        </label>
        <label>
          Visible:
          <input type="toggle" name="visible" />
        </label>
        <input type="submit" value="Add"/>
      </form>
    </div>
  )
}