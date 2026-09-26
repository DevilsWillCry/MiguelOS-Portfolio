import React from 'react'
import WaveText from './WaveText'

function MyBanner(props) {

  return (
    <div className="absolute top-0 container-items w-[100%] h-[6%] items-center justify-center overflow-x-hidden overflow-y-hidden bg-black p-1">
    <div className="horizontal-scrolling-items flex flex-row justify-end text-4xl w-[2500px] animate-infiniteScroll mt-3">
      <div className="horizontal-scrolling-items__item whitespace-nowrap contrast-150">
         <span className="inline-block"> {props.icons}</span>
          <h1 className='inline-block animate-wave text-white'>{props.text}</h1>
         <span className="inline-block"> {props.icons}</span>
      </div>
    </div>
  </div>
  )
}

export default MyBanner