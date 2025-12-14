import React from 'react';
import useTool from '../context/ToolProvider';
import useDrawing from '../context/DrawingProvider';
import useAuth from '../context/AuthProvider';

let tools=  ["select", "pen", "ellipse", "rectangle", "line"];
let strokes=[{'red':"rgb(255, 0, 0)"},
            {'blue':"rgb(0, 0, 255)"},
            {"green": "rgb(0, 128, 0)"},
            {"black":"rgb(0, 0, 0)"}];

let fillColor=[{'red':"rgba(232, 129, 129, 1)"},
            {'blue':"rgba(137, 137, 228, 1)"},
            {"green": "rgba(161, 219, 161, 1)"},
            {"transparent":"transparent"}];

let strokeWidth= [2,4,6];


const Toolbar = () => {
  const {activeTool,setActiveTool,activeStroke,setActiveStroke, activefill, setActivefill, activewidth, setActivewidth}= useTool();
  const{setElements, undoHandler,redoHandler, setStack, canvasRef}= useDrawing();
  const canvasBg = "#ffffff"; // or dynamic state
  const {logout}= useAuth();


  function logoutHandler(){
    logout();
  }


  function handleDownload() {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // save current pixels
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // draw background color
  ctx.save();
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = canvasBg; //  your canvas background color
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  // export
  canvas.toBlob((blob) => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "canvas.png";
    a.click();
    URL.revokeObjectURL(url);

    // restore original canvas (important!)
    ctx.putImageData(imageData, 0, 0);
  }, "image/png");
}



  return (
    <div className="toolbar-container">

    <div
      className='drawing-toolbar'
    >
      {tools.map((tool) => (
        <button
          key={tool}
          onClick={() => setActiveTool(tool)}
          className={`tool-btn ${activeTool === tool ? "active" : ""}`}
        >
          {tool.toUpperCase()}
        </button>
      ))}
    </div>

    <div className='history-toolbar'>
      <button className="tool-btn" onClick={()=>{undoHandler()}}>UNDO</button>
      <button className="tool-btn" onClick={()=>{redoHandler()}}>REDO</button>
      {/* <button className="tool-btn" onClick={()=>{setElements([]); setStack([])}}>RESET</button> */}
    </div>

    <div className='function-toolbar'>
      <button className="tool-btn reset" onClick={()=>{setElements([]); setStack([])}}>RESET</button>
      <button className="tool-btn primary"  onClick={()=>{handleDownload()}}>download</button>
      {/* <button>toggle</button> */}
    </div>

    <div className='color-toolbar'>
      <div className='name'> .             Stroke</div>
      {strokes.map((stroke, index) => {
        const key = Object.keys(stroke)[0];
        return(
          <button
            key={index}
            className={`color-btn ${
              activeStroke?.[key] ? "active" : ""
            }`}
            style={{ backgroundColor: stroke[key] }}
            onClick={() => setActiveStroke(stroke)}
            title={key}
          />
        // <button
        // key={index}
        //   onClick={()=>{setActiveStroke(stroke)
        //     console.log(activeStroke)
        //   }}
        // >
        //   {key}
        // </button>
        )
      }) }
    </div>

    <div className='fillcolor-toolbar'>
      <div className='name'>Background</div>
      {fillColor.map((fill, index) => {
        const key = Object.keys(fill)[0];
        return(
          <button
            key={index}
            className={`color-btn ${
              activefill?.[key] ? "active" : ""
            }`}
            style={{ backgroundColor: fill[key] }}
            onClick={() => setActivefill(fill)}
            title={key}
          />
        // <button
        // key={index}
        //   onClick={()=>{setActivefill(fill)
        //     console.log(activefill)
        //   }}
        // >
        //   {key}
        // </button>
        )
      }) }
    </div>

    <div className='width-toolbar'>
      <div className='name'>Stroke Width</div>
      {strokeWidth.map((width, index) => {
        return(
        <button
        key={index}
        className={`width-btn ${activewidth === width ? "active" : ""}`}
          onClick={()=>{setActivewidth(width)
            console.log(activewidth)
          }}
        >
          <div
    className="width-dot"
    style={{
      width: width,
      height: width,
    }}
  />
          {/* {width} */}
        </button>)
      }) }
    </div>

    <div className='logout-toolbar'>
      <button className="tool-btn logout" onClick={()=>{logoutHandler()}}>LOGOUT</button>
    </div>

    </div>
  )
}

export default Toolbar