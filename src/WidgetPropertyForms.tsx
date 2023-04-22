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

const WidgetPropertyForms = ({widgetDataMap, updateWidget, clientId}: WidgetPropertyFormProps) => {
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

  return (
    <>
    {
      Object.entries(widgetDataMap).map(([id, widget]) => (
        <WidgetFieldForm
          key={id}
          handleFormSubmit={(values, helpers) => handleFormikSubmit(id, values, helpers)}
          data={widget}
          buttonType="update"
        />
      ))
    }
    </>
  );
}

export default WidgetPropertyForms;