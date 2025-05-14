import React, { useEffect } from "react";
import audioRataMilton from "../assets/audio-ratiomilton.mp3";
import videoRataMilton from "../assets/ratamilton-video.mp4";

function TenorGifEmbed() {

  return (
    <div
      className="flex flex-row justify-center items-center tenor-gif-embed absolute top-0 left-1/2 -translate-x-1/2 z-[1000] w-full h-[75vh] object-fill"
    >
      <video src={videoRataMilton} controls autoPlay playsInline loop className="w-full h-full transition-all animate-zoomIn"> </video>
    </div>
  );
}

export default TenorGifEmbed;
