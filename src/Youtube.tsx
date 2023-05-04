import {useEffect, createContext, useContext, useState} from 'react';

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
  width: number;
  height: number;
  videoId: string;
  playerVars?: any;
  onPlayerStateChange: any;
}

export function Youtube({playerId, onPlayerStateChange, width, height, videoId, playerVars}: YoutubeProps) {
  const yt = useYoutube();
  const [player, setPlayer] = useState<undefined | any>(undefined);


  useEffect(() => {
    if(yt !== undefined) {
      const heightStr = height.toString();
      const newPlayer = new yt.Player(`youtube-player:${playerId}`, {
        height,
        width,
        videoId,
        playerVars,
        events: {
          // 'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
      setPlayer(newPlayer)
    }
  }, [yt])
  return <div id={`youtube-player:${playerId}`}></div>
}

export function useYoutube() {
  const context = useContext(YoutubeIframeContext);
  // if(context === undefined) {
  //   throw new Error("Missing player context. Make sure YoutubeAPIProvider is used in a parent component.");
  // }
  return context;
}
