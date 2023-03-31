import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import Overlay from "./Overlay";
import WidgetFieldForm from "./WidgetFieldForm";

const routeUrl = process.env.REACT_APP_DEV_REST_URL as string;
if(!routeUrl) {
  throw new Error("Could not locate environment variables. \
  Requires REACT_APP_DEV_WS_URL and REACT_APP_DEV_ROUTE_URL to be set.")
}

export default function OverlayEditPage() {
  // TODO: IMPORTANT SET FROM OVERLAY REQUEST AND PREVENT NEW CLIENTS OVERRIDING
  const [overlayDimensions, setOverlayDimensions] = useState({width: 1920, height: 1080});
  const [formDimensionData, setFormDimensionData] = useState<{width: number, height: number}>(overlayDimensions);
  const [editorScale, setEditorScale] = useState(0.5);
  const [editorTranslateY, setEditorTranslateY] = useState("10%");
  
  // TODO: Form networked update hack
  useEffect(() => {
    setFormDimensionData(overlayDimensions);
  }, [overlayDimensions]);

  function handleOverlayFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: from uncontrolled form
    // const form = e.currentTarget;
    // const formElements = form.elements as typeof form.elements & {
    //   overlayWidth: {value: number},
    //   overlayHeight: {value: number},
    // }
    // const width = formElements['overlayWidth'].value
    // const height = formElements['overlayHeight'].value;

    // TODO: Too tricky to manage state locally so just rely on broadcasted updates
    //setOverlayDimensions({width, height});

    const {width, height} = formDimensionData;

    // Broadcast updated overlay dimensions
    (async () => {
      // TODO: error message if it doesnt set
      const res = await axios.put(`${routeUrl}/overlay`, {
        width,
        height
      });
    })();
  }

  function handleOverlayFormChange(e: ChangeEvent<HTMLInputElement>) {
    const target = e.currentTarget;
    if(target.name === 'overlayWidthField') {
      setFormDimensionData({width: parseInt(target.value), height: formDimensionData.height})
    } else if(target.name === 'overlayHeightField') {
      setFormDimensionData({width: formDimensionData.width, height: parseInt(target.value)})
    }
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
            <legend>Overlay properties - WARNING! THIS CHANGES THE STREAM VIEW!</legend>
            <label>
              Width
              <input type="number" name="overlayWidthField" value={formDimensionData.width}
                defaultValue={overlayDimensions.width}
                onChange={handleOverlayFormChange}
              />
            </label>
            <label>
              Height
              <input type="number" name="overlayHeightField" value={formDimensionData.height}
                defaultValue={overlayDimensions.height}
                onChange={handleOverlayFormChange}
              />
            </label>
            <input type="submit" value="Update"/>
          </fieldset>
        </label>
      </form>
      <form onSubmit={handleEditorFormSubmit}>
        <fieldset>
          <legend>Editor properties - Change your editor view without changing what others see</legend>
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
        <Overlay dimensions={overlayDimensions} setDimensions={setOverlayDimensions} scale={editorScale} translateY={editorTranslateY} style={{border: "solid red 1px"}}/>
      </div>
    </>
  )
}

// style={{border: "solid red 1px", transform: "scale(0.5) translateY(25%)", transformOrigin: "top", position: "relative"}}