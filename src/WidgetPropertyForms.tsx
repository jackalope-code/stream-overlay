import { SetStateAction } from "react";
import { WidgetData, WidgetDataMap, UseOverlayHelpers } from "./Overlay";
import WidgetFieldForm, { FormValues } from "./WidgetFieldForm";
import { FormikHelpers, FormikValues } from "formik";

interface WidgetPropertyFormProps {
  widgetDataMap: WidgetDataMap;
  updateWidget: (widgetData: WidgetData, widgetId: string, clientId: string) => void;
  deleteWidget: UseOverlayHelpers["deleteWidget"];
  clientId: string | undefined;
}

const WidgetPropertyForms = ({widgetDataMap, updateWidget, deleteWidget, clientId}: WidgetPropertyFormProps) => {
  function handleFormikSubmit(widgetId: string, values: FormikValues, formikHelpers: FormikHelpers<FormikValues>): void | Promise<any> {
    const widgetCopy = {...widgetDataMap[widgetId]}
    widgetCopy.x = values.xInput;
    widgetCopy.y = values.yInput;
    widgetCopy.width = values.widthInput;
    widgetCopy.height = values.heightInput;
    if(!clientId) {
      throw new Error("Client ID not set");
    }
    updateWidget(widgetCopy, widgetId, clientId)
    formikHelpers.setSubmitting(false);
  }

  function handleDelete(componentId: string) {
    // TODO: silently fails if client ID isn't set from a connection
    if(clientId) {
      deleteWidget(componentId, clientId);
    }
  }

  return (
    <>
    {
      Object.entries(widgetDataMap).map(([id, widget]) => (
        <WidgetFieldForm
          key={id}
          handleFormSubmit={(values, helpers) => handleFormikSubmit(id, values, helpers)}
          handleFormDelete={handleDelete}
          data={widget}
          widgetId={id}
          buttonType="update"
        />
      ))
    }
    </>
  );
}

export default WidgetPropertyForms;