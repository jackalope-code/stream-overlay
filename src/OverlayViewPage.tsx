import { useState } from "react";
import Overlay, { WidgetDataMap } from "./Overlay";

const OverlayViewPage = () => {
  // TODO: lifted state
  const [overlayDimensions, setOverlayDimensions] = useState({width: 1920, height: 1080});
  const [widgetDataMap, setWidgetDataMap] = useState<WidgetDataMap>({});
  const [clientId, setClientId] = useState<string | undefined>();

  return (
    <Overlay
      dimensions={overlayDimensions}
      widgetDataMap={widgetDataMap}
      setWidgetDataMap={setWidgetDataMap}
      setDimensions={setOverlayDimensions}
      clientId={clientId}
      setClientId={setClientId}
      style={{overflow: "hidden"}}/>
  )
}

export default OverlayViewPage;