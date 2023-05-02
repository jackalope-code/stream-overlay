import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import Overlay, { UseOverlayHelpers, WidgetData, WidgetDataMap, useOverlay } from "./Overlay";
import { env } from "./utils";
import WidgetFieldForm from "./WidgetFieldForm";
import WidgetPropertyForms from "./WidgetPropertyForms";
import { FormikHelpers, FormikValues } from "formik";
import { useAuth } from "./header-auth";
import { EditorLoginForm } from "./EditorLoginForm";
import ToggledViewableField from "./ToggledViewableField";
import HiddenKeyField from "./HiddenKeyField";
import { Link, useLocation, useResolvedPath } from "react-router-dom";
import { WidgetType } from "./Widget";

const routeUrl = env().routeUrl;

export default function OverlayEditPage() {
  const [editorScale, setEditorScale] = useState(0.5);
  const [editorTranslateY, setEditorTranslateY] = useState("10%");
  
  // TODO: lifted state
  // Tracks all the draggable networked components in one object
  const [widgetDataMap, setWidgetDataMap] = useState<WidgetDataMap>({});
  // TODO: addWidget possibly undefined for some reason
  // TODO: Can only be called once in top level... I want more of a context/provider use setup
  const helpers = useOverlay(setWidgetDataMap);
  
  // TODO: IMPORTANT SET FROM OVERLAY REQUEST AND PREVENT NEW CLIENTS OVERRIDING
  const [overlayDimensions, setOverlayDimensions] = useState({width: 1920, height: 1080});
  const [formDimensionData, setFormDimensionData] = useState<{width: number, height: number}>(overlayDimensions);

  // TODO: persist auth and make auth global
  const {clientId, authenticate, credentials} = useAuth();

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
        height,
        clientId
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

  function handleAddWidgetFieldForm(values: FormikValues, formikHelpers: FormikHelpers<FormikValues>): void | Promise<any> {
    if(values !== undefined && helpers.addWidget && clientId) {
      const widget: WidgetData = {
        x: values.xInput,
        y: values.yInput,
        width: values.widthInput,
        height: values.heightInput,
        url: values.urlInput,
        moving: false
      }
      helpers.addWidget(widget, clientId);
    }
    console.log("RESET " + formikHelpers.resetForm)
    formikHelpers.resetForm();
    formikHelpers.setSubmitting(false);
  }

  function getViewUrl(username: string, password: string): string {
    const tokens = window.location.href.split('/');
    tokens.pop();
    const root = tokens.join("/")
    return `${root}/view/?username=${username}&password=${password}`
  }

  const controls = {
    Image: undefined,
    Embed: undefined,
    Video: (<div className="cursor">Drag me</div>)
  }

  const pageContents = (
  <>
  {/* `${pathName}/view/?username=${credentials?.username}&password=${credentials?.password}` */}
    <HiddenKeyField value={getViewUrl(credentials?.username as string, credentials?.password as string)} />
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
    {/* TODO: FIX PROP DRILLING */}
    <WidgetPropertyForms
      widgetDataMap={widgetDataMap}
      updateWidget={helpers.updateWidget as UseOverlayHelpers["updateWidget"]}
      deleteWidget={helpers.deleteWidget as UseOverlayHelpers["deleteWidget"]}
      clientId={clientId}
    />
    <WidgetFieldForm handleFormSubmit={handleAddWidgetFieldForm} buttonType="add"/>
    <div style={{display: "flex", justifyContent: "center"}}>
      <Overlay
        dimensions={overlayDimensions}
        widgetDataMap={widgetDataMap}
        setWidgetDataMap={setWidgetDataMap}
        setDimensions={setOverlayDimensions}
        scale={editorScale} translateY={editorTranslateY}
        style={{border: "solid red 1px"}}
        clientId={clientId}
        editorWidgetControls={controls}
      />
    </div>
  </>
)
  // TODO: no space under the overlay or around the sides when it's larger 
  // TODO: Separate out editor form properties
  return (
    clientId === undefined ? (
      <EditorLoginForm authenticate={authenticate}/>
    )
    :
    (
      pageContents
    )
  )
}

// style={{border: "solid red 1px", transform: "scale(0.5) translateY(25%)", transformOrigin: "top", position: "relative"}}