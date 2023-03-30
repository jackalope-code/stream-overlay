import { useState } from "react";
import Overlay from "./Overlay";
import WidgetFieldForm from "./WidgetFieldForm";

export default function OverlayEditPage() {
  const [overlayWidth, setOverlayWidth] = useState(1920);
  const [overlayHeight, setOverlayHeight] = useState(1080);
  const [editorScale, setEditorScale] = useState(0.5);
  const [editorTranslateY, setEditorTranslateY] = useState("10%");
  
  function handleOverlayFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formElements = form.elements as typeof form.elements & {
      overlayWidth: {value: number},
      overlayHeight: {value: number},
    }
    const width = formElements['overlayWidth'].value
    const height = formElements['overlayHeight'].value

    setOverlayWidth(width);
    setOverlayHeight(height);

  }

  function handleEditorFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formElements = form.elements as typeof form.elements & {
      editorScale: {value: number},
      editorTranslateY: {value: number}
    }
    const scale = formElements['editorScale'].value;
    const translateYValue = formElements['editorTranslateY'].value;
    setEditorScale(scale);
    setEditorTranslateY(`${translateYValue}%`);
  }
  
  // TODO: no space under the overlay or around the sides when it's larger 
  // TODO: Separate out editor form properties
  return (
    <>
      <form onSubmit={handleOverlayFormSubmit}>
        <label>
          <fieldset>
            <legend>Overlay properties</legend>
            <label>
              Width
              <input type="number" name="overlayWidth" defaultValue={overlayWidth}/>
            </label>
            <label>
              Height
              <input type="number" name="overlayHeight" defaultValue={overlayHeight}/>
            </label>
            <input type="submit" value="Update"/>
          </fieldset>
        </label>
      </form>
      <form onSubmit={handleEditorFormSubmit}>
        <fieldset>
          <legend>Editor properties</legend>
          <label>
            Scale
            <input type="number" name="editorScale" step="0.1" min="0.1" max={3} defaultValue={editorScale}/>
          </label>
          <label>
            Offset from top (%)
            <input type="number" name="editorTranslateY" step="5" min={0} max={100} defaultValue={10}/>
          </label>
          <input type="submit" value="Update"/>
        </fieldset>
      </form>
      <WidgetFieldForm />
      <div style={{display: "flex", justifyContent: "center"}}>
        <Overlay width={overlayWidth} height={overlayHeight} scale={editorScale} translateY={editorTranslateY} style={{border: "solid red 1px"}}/>
      </div>
    </>
  )
}

// style={{border: "solid red 1px", transform: "scale(0.5) translateY(25%)", transformOrigin: "top", position: "relative"}}