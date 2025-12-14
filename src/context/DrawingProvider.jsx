import { createContext, useContext, useRef, useState } from "react"
import { v4 as uuidv4 } from "uuid";
import useTool from "./ToolProvider";

const drawingContext= createContext();
export const DrawingProvider=({children})=>{

    const{activeTool, setActiveTool, activeStroke, activefill, activewidth}= useTool();

    const[stack, setStack]= useState([]);

    const canvasRef= useRef(); //canvas

    const[drawing, setDrawing]= useState(false); //user is drawing or not on the canvas with movement
    const[currentElementId, setCurrentElementId]=useState(null); //to get the id of the latest element
    const[elements, setElements]= useState([]) //all the elements drawn on canvas
    const[selectedElement, setSelectedElement]= useState(null);
    const [dragging, setDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // function to draw the already existing elements
    function drawElements(ctx,el){
        // define the stroke and linewidth
        ctx.fillStyle = el.fillColor ;
        console.log(el.fillColor)
        ctx.strokeStyle = el.strokeColor ;
        ctx.lineWidth = el.strokeWidth ;

        if (el.type === "pen") { //draw pen element
            const points = el.points || [];
            if (points.length < 2) return;

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.stroke();

        } else if (el.type === "rectangle") { //draw rectangle element
          if (el.fillColor && el.fillColor !== "transparent") {
            ctx.fillRect(el.x, el.y, el.width, el.height); 
          }
          ctx.strokeRect(el.x, el.y, el.width, el.height);

        } else if (el.type === "ellipse") { //draw ellipse element
            const width = el.width || 0;
            const height = el.height || 0;

            const cx = el.x + width / 2;
            const cy = el.y + height / 2;
            const radiusX = Math.abs(width) / 2;
            const radiusY = Math.abs(height) / 2;

            if (radiusX === 0 || radiusY === 0) return;

            ctx.beginPath();
            ctx.ellipse(cx, cy, radiusX, radiusY, 0, 0, Math.PI * 2);
            if (el.fillColor && el.fillColor !== "transparent") {
              ctx.fillStyle = el.fillColor;
              ctx.fill();
            }
            ctx.stroke();
        }else if(el.type=== "line"){
          ctx.beginPath();
          ctx.moveTo(el.x, el.y);
          ctx.lineTo(el.x + el.width, el.y + el.height);
          ctx.stroke();
        }
    }

    // MOUSE MOVEMENT FUNCTION TO CAPTURE THE X AND Y POINTS
    function handleMouseDown(e){
      // console.log("mousedown fired");


        const rect = canvasRef.current.getBoundingClientRect();  //retrieves the size and position of canvas
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // const x = e.clientX - rect.left; //x coordinate
        // const y = e.clientY - rect.top; //y coordinate
        console.log("mouse:", x, y);
console.log("first element point:", elements[0]?.points?.[0]);




        if (activeTool === "select") {

          function distance(x1, y1, x2, y2) {
            return Math.hypot(x2 - x1, y2 - y1);
          }
          function distancePointToLine(px, py, x1, y1, x2, y2) {
            const A = px - x1;
            const B = py - y1;
            const C = x2 - x1;
            const D = y2 - y1;

            const dot = A * C + B * D;
            const lenSq = C * C + D * D;

            let t = dot / lenSq;

            t = Math.max(0, Math.min(1, t)); // clamp between 0 and 1

            const closestX = x1 + t * C;
            const closestY = y1 + t * D;

            return Math.hypot(px - closestX, py - closestY);
          }

          function distanceToElement(el, x, y) {
            if (el.type === "pen") {
              return Math.min(
                ...el.points.map(p => distance(p.x, p.y, x, y))
              );
            }

            if (el.type === "rectangle") {
              const cx = el.x + el.width / 2;
              const cy = el.y + el.height / 2;
              return distance(cx, cy, x, y);
            }
            if (el.type === "line") {
              const x1 = el.x;
              const y1 = el.y;
              const x2 = el.x + el.width;
              const y2 = el.y + el.height;

              return distancePointToLine(x, y, x1, y1, x2, y2);
            }

            if (el.type === "ellipse") {
              const cx = el.x + el.width / 2;
              const cy = el.y + el.height / 2;

              const rx = Math.abs(el.width) / 2;
              const ry = Math.abs(el.height) / 2;

              if (rx === 0 || ry === 0) return Infinity;

              const norm =
                ((x - cx) ** 2) / (rx ** 2) +
                ((y - cy) ** 2) / (ry ** 2);

              return norm <= 1 ? 0 : Infinity;
            }

            return Infinity;
          }

          function getNearestElement(x, y, threshold = 100) {
            let nearest = null;
            let minDist = Infinity;

            for (const el of elements) {
              const d = distanceToElement(el, x, y);
              console.log("distance:", d, "element:", el);
              if (d < minDist) {
                minDist = d;
                nearest = el;
              }
            }

            return minDist <= threshold ? nearest : null;
          }

          const nearestEl = getNearestElement(x, y);
          // if(nearestEl){
          setSelectedElement(nearestEl);
          console.log("nearest:", nearestEl);
          console.log(elements)
          setDrawing(true);
          setDragging(true);
          if (nearestEl.type === "pen") {
            const firstPoint = nearestEl.points[0];
            setDragOffset({
              x: x - firstPoint.x,
              y: y - firstPoint.y,
            });
          }else{
            setDragOffset({
              x: x - nearestEl.x,
              y: y - nearestEl.y,
            });
          }
          // }

          return;
        }


        // element data depends on the activeTool selected
        if(activeTool==="pen"){
            const id= uuidv4();
            let newElement={
                id,
                type:"pen",
                points:[{x,y}],
                strokeColor:activeStroke[Object.keys(activeStroke)[0]],
                strokeWidth:activewidth
            }
            setElements((prev)=>[...prev,newElement])
            setCurrentElementId(id);
            setDrawing(true);
        }else if(activeTool==="rectangle"){ 
            const id= uuidv4();
            let newElement={
              id,
              type: "rectangle",
              x,
              y,
              width: 0,
              height: 0,
              fillColor:activefill?.[Object.keys(activefill)[0]] ?? null,
              strokeColor: activeStroke[Object.keys(activeStroke)[0]],
              strokeWidth: activewidth,
            };
            setElements((prev)=>[...prev,newElement])
            console.log(elements)
            setCurrentElementId(id);
            setDrawing(true);
        }else if(activeTool==="ellipse"){
            const id= uuidv4(); 
            let newElement={
              id,
              type: "ellipse",
              x,
              y,
              width: 0,
              height: 0,
              fillColor:activefill?.[Object.keys(activefill)[0]] ?? null,
              strokeColor: activeStroke[Object.keys(activeStroke)[0]],
              strokeWidth: activewidth,
            };
            setElements((prev)=>[...prev,newElement])
            setCurrentElementId(id);
            setDrawing(true);
        }else if (activeTool === "line") {
          const id = uuidv4();
          const newElement = {
            id,
            type: "line",
            x: x,
            y: y,
            width: 0,
            height: 0,
            strokeColor: activeStroke[Object.keys(activeStroke)[0]],
            strokeWidth: activewidth,
          };

          setElements(prev => [...prev, newElement]);
          setCurrentElementId(id);
          setDrawing(true);
        }

    }

    function handleMouseMove(e){
        if(!drawing && !dragging)return


        // coordinate with each movement
        const rect = canvasRef.current.getBoundingClientRect();  //retrieves the size and position of canvas
        const x = e.clientX - rect.left; //x coordinate
        const y = e.clientY - rect.top; //y coordinate

        // console.log(x,y);

        if(activeTool=="select"){
          if (dragging && selectedElement) {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          setElements(prev =>
            prev.map(el => {
              if (el.id !== selectedElement.id) return el;

              if (el.type === "rectangle" || el.type === "ellipse") {
                return {
                  ...el,
                  x: x - dragOffset.x,
                  y: y - dragOffset.y,
                };
              }
              if (el.type === "pen") {
                const dx = x - dragOffset.x - el.points[0].x;
                const dy = y - dragOffset.y - el.points[0].y;

                return {
                  ...el,
                  points: el.points.map(p => ({
                    x: p.x + dx,
                    y: p.y + dy,
                  })),
                };
              }
              if (el.type === "line") {
                return {
                  ...el,
                  x: x - dragOffset.x,
                  y: y - dragOffset.y,
                };
              }

              return el;
            })
          );
          return;
          }
        }

        setElements((allElements) => { //UPDATE THE NEW ELEMENT TO STORE POINTS AND END POINTS
          return allElements.map((el)=>{
            if(el.id !== currentElementId) return el;
            if (el.type === "pen") {
            return {
              ...el,
              points: [...el.points, { x, y }],
            };
          } else if (el.type === "rectangle" || el.type === "ellipse" || el.type==="line") {
            return {
              ...el,
              width: x - el.x,
              height: y - el.y,
            };
          } 
          })
        });
    }

    function handleMouseUp(e){
        setDrawing(false);
        setCurrentElementId(null);
        setActiveTool("");
        setDragging(false);
    }

    function undoHandler(){
      console.log("undo handler")
      setElements(prevElements => {
        if (prevElements.length === 0) return prevElements;

        const newElements = [...prevElements];
        const lastEl = newElements.pop();

        setStack(prevStack => [...prevStack, lastEl]);

        return newElements;
      });
    }

    function redoHandler(){
      setStack(prevStack => {
        if (prevStack.length === 0) return prevStack;

        const last = prevStack[prevStack.length - 1];

        setElements(prevElements => [...prevElements, last]);

        return prevStack.slice(0, -1);
      });
    }

    return(
        <drawingContext.Provider value={{
            elements, setElements,
            canvasRef,
            drawElements,
            handleMouseDown,
            handleMouseMove,
            handleMouseUp,
            undoHandler,
            redoHandler,
            setStack
        }}>
            {children}
        </drawingContext.Provider>
    )
}

export default function useDrawing(){
    return useContext(drawingContext);
}