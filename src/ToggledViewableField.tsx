import { useState } from "react";

interface ToggledViewableFieldProps {
  hiddenContents: string | JSX.Element;
  label: string;
  additionalControls: JSX.Element;
  shouldConfirmVisible: boolean
}
const ToggledViewableField = ({hiddenContents, label, additionalControls, shouldConfirmVisible}: ToggledViewableFieldProps) => {
  const [visible, setVisible] = useState(false);
  const [visibleConfirmed, setVisibleConfirmed] = useState(false)

  function toggleVisible() {
    console.log(visible, visibleConfirmed)
    setVisible(visible => !visible);
    if(visibleConfirmed === true) {
      setVisibleConfirmed(false);
    }
  }

  function confirmVisible() {
    setVisibleConfirmed(true)
  }

  function cancelVisible() {
    console.log("cancel clicked")
    setVisible(false);
    setVisibleConfirmed(false);
  }

  function renderToggle(showVisible: boolean, visibleConfirmed: boolean) {
    let display;
    if(showVisible) {
      if(visibleConfirmed === true || !shouldConfirmVisible) {
        display = (
          <>
            <span>{hiddenContents}</span>
            {additionalControls}
          </>
        );
      } else {
        display = (<>
          <span>Really show username and password?</span>
          <button onClick={confirmVisible}>Yes</button>
          <button onClick={cancelVisible} >No</button>
        </>)
      }
    } else {
      display = <span>Click to show text</span>
    }

    return (<>
      {display}
      { (!(showVisible === true && !visibleConfirmed) || shouldConfirmVisible) ? (<button onClick={toggleVisible}>{visible ? 'Hide' : 'Show'}</button>) : undefined }
    </>)
  }

  return (
    <>
      <label>
        {label}
        {renderToggle(visible, visibleConfirmed)}
      </label>
    </>
  )
}

export default ToggledViewableField;