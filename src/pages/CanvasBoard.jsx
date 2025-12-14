import React, { useEffect, useRef, useState } from 'react'
import Toolbar from './Toolbar';
import useTool from '../context/ToolProvider';
import useDrawing from '../context/DrawingProvider';
import useSocket from '../context/SocketProvider';

const CanvasBoard = ({boardId}) => {

  const{socket}= useSocket();
  const {activeTool,setActiveTool}= useTool();
  const{canvasRef,setElements, elements, drawElements, handleMouseDown,handleMouseMove,handleMouseUp}=useDrawing();

  useEffect(() => {
    if (!socket) return;

    const handleBoardInit = (payload) => {
      if (payload.boardId==boardId) {
        if (Array.isArray(payload.elements)) setElements(payload.elements);
      }
    };

    const handleBoardError = (payload) => {
      alert("board-error:", payload)
      console.error("board-error:", payload);
    };

    socket.on("board-init", handleBoardInit);
    socket.on("board-error", handleBoardError);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("elements-update", { boardId, elements });

    return () => {
      socket.off("elements-update");
    };
  }, [socket, elements]);

  useEffect(() => {
    if (!socket) return;
    socket.on("elements-update", ({ elements }) => {
      setElements(elements);
    });
  }, [socket]);

  useEffect(()=>{
    const canvas= canvasRef.current;
    console.log(canvas);
    if(!canvas) return;

    const ctx= canvas.getContext('2d');
    canvas.height=window.innerHeight;
    canvas.width=window.innerWidth;

    // clear canvas whenever element changes to load the latest changes
    ctx.clearRect(0,0,canvas.width, canvas.height);

    //draw all elements on the canvas that exists in the array
    elements.forEach(el => {
      drawElements(ctx,el);
    });

  },[elements])


  return (
    <div className='canvasboard-container'>
      <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
      <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      />
    </div>
  )
}

export default CanvasBoard
