import { Field, Form, Formik, FormikHelpers, FormikValues } from "formik";
import { CallAuthenticate } from "./header-auth";

interface EditorLoginFormProps {
  authenticate: CallAuthenticate;
}

export const EditorLoginForm = ({authenticate}: EditorLoginFormProps) => {
  function handleFormSubmit(values: FormikValues) {
    authenticate(values.username, values.password);
  }

  return (
    <Formik
      initialValues={{}}
      onSubmit={handleFormSubmit}
    >
      <Form>
        <Field type="text" name="username" />
        <Field type="password" name="password" />
        <input type="submit" value="Login" />
      </Form>
    </Formik>
  )
};