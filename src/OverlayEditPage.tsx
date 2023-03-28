import Overlay from "./Overlay";
import WidgetFieldForm from "./WidgetFieldForm";

export default function OverlayEditPage() {
  return (
    <>
      <WidgetFieldForm />
      <div style={{display: "flex", justifyContent: "center"}}>
        <Overlay width={1920} height={1080} scale={0.5} translateY={"25%"} style={{border: "solid red 1px"}}/>
      </div>
    </>
  )
}

// style={{border: "solid red 1px", transform: "scale(0.5) translateY(25%)", transformOrigin: "top", position: "relative"}}