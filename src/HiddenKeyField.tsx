import ToggledViewableField from "./ToggledViewableField"

const HiddenKeyField = ({value}: {value: string | JSX.Element}) => {
  function copyValue() {
    navigator.clipboard.writeText(value.toString());
  }
  const controls = <button onClick={copyValue}>Copy</button>
  return (
    <ToggledViewableField label="Show overlay view credential URL" hiddenContents={value} additionalControls={controls} shouldConfirmVisible={true} />
  )
}

export default HiddenKeyField;