import { useState } from "react";
import Overlay from "./Overlay";

const OverlayViewPage = () => {
  const [overlayDimensions, setOverlayDimensions] = useState({width: 1920, height: 1080});
  return (
    <Overlay dimensions={overlayDimensions} setDimensions={setOverlayDimensions} style={{overflow: "hidden"}}/>
  )
}

export default OverlayViewPage;