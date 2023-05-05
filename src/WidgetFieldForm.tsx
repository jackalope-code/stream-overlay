// import styled from 'styled-components';

import axios from "axios";
import { WidgetData, WidgetDataMap, startTimeToOffset } from "./Overlay";
import { copyAllWidgetData, env } from "./utils";
import { Field, Form, Formik } from "formik";
import { FormikValues, FormikHelpers } from "formik/dist/types";
import { useEffect } from "react";

// const Input = styled.input(props => {
//   return `
//     width: 15ch;
// `});

export interface FormValues {
  xInput: number;
  yInput: number;
  urlInput: string;
  widthInput: number;
  heightInput: number;
}
// interface WidgetFormProps {
//   setWidgetDataMap: React.Dispatch<React.SetStateAction<WidgetDataMap>>;
//   widgetDataMap: WidgetDataMap;
//   clientId: string | undefined;
// }
// function handleFormikSubmit(values: FormikValues, formikHelpers: FormikHelpers<FormikValues>): void | Promise<any> {

// function handleFormikSubmit(values: FormValues, formikHelpers: FormikHelpers<FormValues>): void | Promise<any> {

//   formikHelpers.setSubmitting(false);
// }

type FormSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => void;

type FormikSubmitHandler<Values> = (values: Values, formikHelpers: FormikHelpers<Values>) => void | Promise<any>;

type ButtonType = 'add' | 'update';

interface WidgetFormProps {
  handleFormSubmit: FormikSubmitHandler<FormikValues>;
  handleFormDelete?: (componentId: string) => void;
  data?: WidgetData;
  buttonType: ButtonType;
  widgetId?: string;
}

interface UseWidgetFormSubmitProps {
  setWidgetDataMap: React.Dispatch<React.SetStateAction<WidgetDataMap>>;
  widgetDataMap: WidgetDataMap;
  clientId: string | undefined;
}

export const useWidgetFormSubmit = ({
  setWidgetDataMap, widgetDataMap, clientId
}: UseWidgetFormSubmitProps): FormSubmitHandler => {
  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>)  {
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
        const res = await axios.post(`${routeUrl}/component`, {
          ...newWidget,
          clientId
        })
        setWidgetDataMap(data => ({
          ...copyAllWidgetData(data),
          ...{[res.data.componentId]: newWidget}
        }))
      })();
    }
  }

  return handleFormSubmit;
}

const routeUrl = env().routeUrl;


export default function WidgetFieldForm({data, widgetId, buttonType, handleFormSubmit, handleFormDelete}: WidgetFormProps)  {

  let initialValues: FormikValues = {};
  if(data) {
    initialValues = {
      xInput: data.x,
      yInput: data.y,
      urlInput: data.url,
      widthInput: data.width,
      heightInput: data.height,
      offset: data.startTime ? startTimeToOffset(data.startTime) : 0
    }
  }

  function renderButtons(buttonType: ButtonType) {
    if(buttonType === 'add') {
      return <input type="submit" value="Add"/>
    } else if(buttonType === 'update') {
      if(!widgetId) {
        throw new Error("widgetId prop must be set for WidgetFieldForm 'update' type.");
      }
      if(!handleFormDelete) {
        throw new Error("handleFormDelete prop must set for WidgetFieldForm 'update' type.")
      }
      return (
        <>
          <input type="button" value="Delete" onClick={() => handleFormDelete(widgetId)}/>
          <input type="submit" value="Update"/>
        </>
      )
    }
  }
  
  return (
    <Formik
      onSubmit={handleFormSubmit}
      initialValues={initialValues}
      enableReinitialize={true}
    >
      <Form
        style={{display: "flex", flexDirection: "row", columnGap: "10px"}}
      >
        <label>
          URL:
          <Field type="text" name="urlInput" />
        </label>
        <label>
          X:
          <Field type="number" name="xInput" />
        </label>
        <label>
          Y:
          <Field type="number" name="yInput" />
        </label>
        <label>
          Width:
          <Field type="number" name="widthInput" />
        </label>
        <label>
          Height:
          <Field type="number" name="heightInput" />
        </label>
        <label>
          Start time (seconds):
          <Field type="number" name="offset" />
        </label>
        <label>
          Visible:
          <input type="toggle" name="visible" />
        </label>
        {renderButtons(buttonType)}
      </Form>
    </Formik>
  )
}