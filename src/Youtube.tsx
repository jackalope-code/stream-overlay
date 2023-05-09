import {useEffect, createContext, useContext, useState, createRef, useRef, CSSProperties} from 'react';

declare global {
  interface Window { YT: any, onYouTubeIframeAPIReady: any}
}

const getGlobalHandler = (stateUpdateFlag: any) => {
  const globalHandler = {
    set(obj: any, prop: any, value: any) {
      if(prop === 'YT') {
        stateUpdateFlag(true);
      }
      return Reflect.set(obj, prop, value);
    }
  }

  return globalHandler;
}

const YoutubeIframeContext = createContext<undefined | any>(undefined);

export function YoutubeAPIProvider({children}: {children: JSX.Element | JSX.Element[]}) {
  const [yt, setYt] = useState(undefined);
  const [stateUpdateFlag, setStateUpdateFlag] = useState(false);

  function handlePlayerReady() {
    setStateUpdateFlag(true);
    setYt(window.YT);
  }

  function addScriptTag() {
    window.onYouTubeIframeAPIReady = handlePlayerReady;
    let tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    tag.id = "iframe-api";
    let head = document.getElementsByTagName('head')[0];
    head.appendChild(tag);
  }

  function removeScriptTag() {
    const apiScript = document.getElementById("iframe-api");
    apiScript?.remove();
  }

  useEffect(() => {
    addScriptTag();
    // const globalProxy = new Proxy(window, getGlobalHandler(setStateUpdateFlag));
    return removeScriptTag;
  }, [])

  return (
    <YoutubeIframeContext.Provider value={yt}>
      {children}
    </YoutubeIframeContext.Provider>
  )
}

interface YoutubeProps {
  playerId: string;
  disableMouseEvents: boolean;
  width: number;
  height: number;
  srcUrl: string;
  videoId: string;
  playerVars?: any;
  onPlayerStateChange: any;
  startTime?: number;
  showAsView: boolean;
}

export function Youtube({disableMouseEvents, srcUrl, playerId, onPlayerStateChange, width, height, videoId, playerVars, startTime, showAsView}: YoutubeProps) {
  const yt = useYoutube();
  const [player, setPlayer] = useState<undefined | any>(undefined);
  const playerRef = useRef<any>();

  function onPlayerReady(event: any) {
    // if(player) {
    //   player.playVideo();

    // }
    console.log("PLAYER", playerRef.current)
    console.log("PLAYER STATE", player);
    // playerRef.current?.playVideo();
    // event.target.mute();
    // setTimeout(() => event.target.playVideo(), 1000);
    // event.target.playVideo();
  //   const onEvent = document.createEvent("MouseEvent");
  //   onEvent.initMouseEvent("MouseEvent", true, false);
    
    event.target.unMute();
    event.target.playVideo();
  }

  useEffect(() => {
    if(yt !== undefined) {
      const heightStr = height.toString();
      const newPlayer = new yt.Player(`youtube-player:${playerId}`, {
        height,
        width,
        videoId,
        // autoplay: 1,
        playerVars: {autoplay: 1, ...playerVars},
        start: startTime,
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
      playerRef.current = newPlayer;
      setPlayer(newPlayer);
    }
  }, [yt])

  useEffect(() => {
    // if(player) {
    //   setTimeout(() => player.playVideo(), 1000);

    // }
  }, [player])


  const timedUrl = `${srcUrl}?autoplay=1&enablejsapi=1&muted=0&controls=${showAsView ? 0 : 1}&modestbranding=1&showInfo=0&rel=0&start=${startTime}`;
  // return (<iframe
  //   allow="autoplay"
  //   id={`youtube-player:${playerId}`}
  //   style={{pointerEvents: disableMouseEvents ? 'none' : 'auto'}} 
  //   src={timedUrl}
  // />)

  // return <iframe allow="autoplay" src={timedUrl} id={`youtube-player:${playerId}`} width={width} height={height} ></iframe>
  // const wrapperStyle: CSSProperties = {
  //   overflow: "hidden",
  //   maxWidth: "100%"
  // }

  // const iframeStyle: CSSProperties = {
  //   position: "absolute",
  //   top: 0,
  //   left: 0,
  //   width: "100%",
  //   height: "100%"
  // }

  // const frameContainerStyle: CSSProperties = {
  //   position: "relative",
  //   paddingBottom: "56.25%", /* 16:9 */  
  //   paddingTop: "25px",
  //   width: "300%", /* enlarge beyond browser width */
  //   left: "-100%" /* center */
  // }

  const wrapperStyle = {};
  const iframeStyle = {};
  const frameContainerStyle = undefined;

  return (
    <div style={wrapperStyle}>
      <div style={frameContainerStyle}>
        <iframe style={iframeStyle} allow="autoplay" src={timedUrl} id={`youtube-player:${playerId}`} width={width} height={height} ></iframe>
      </div>
    </div>
  );
  // return <div id={`youtube-player:${playerId}`}></div>
}

export function useYoutube() {
  const context = useContext(YoutubeIframeContext);
  // if(context === undefined) {
  //   throw new Error("Missing player context. Make sure YoutubeAPIProvider is used in a parent component.");
  // }
  return context;
}
