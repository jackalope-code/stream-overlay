import { Youtube } from "./Youtube";

interface VideoWidgetProps {
  srcUrl: string;
  id: string;
  width: number;
  height: number;
  offsetSeconds: number;
  // TODO: inject props?
  isOverlayView: boolean;
  // TODO: Access from dragging??
  isDragging: boolean;
}

export const VideoWidget = ({srcUrl, id, width, height, offsetSeconds, isOverlayView, isDragging}: VideoWidgetProps) => {
  const videoId = srcUrl.split("/embed/").pop()?.split("?")[0];
  const embed = <Youtube
    disableMouseEvents={isDragging}
    srcUrl={srcUrl}
    playerId={id}
    width={width}
    height={height}
    videoId={videoId as string}
    startTime={offsetSeconds}
    onPlayerStateChange={onYoutubePlayerChange}
    showAsView={isOverlayView}
    
  />

  function onYoutubePlayerChange(event: any) {
    console.log("CHANGE EVENT", event);
  }

  function handleReady(event: any) {
    event.target.playVideo();
    console.log("player ready");
  }
  return (
    {embed}
  )
}