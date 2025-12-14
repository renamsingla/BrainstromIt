import {  createContext, useContext, useRef, useState } from "react"

const toolContext= createContext();

export const ToolProvider=({children})=>{

    const[activeTool, setActiveTool]=useState("");
    const[activeStroke, setActiveStroke]=useState({"black":"rgb(0, 0, 0)"})
    const[activefill, setActivefill]= useState(null);
    const[activewidth, setActivewidth]= useState(2);

    return(
        <toolContext.Provider value={{
            activeTool,
            setActiveTool,
            activeStroke,
            setActiveStroke,
            activefill, 
            setActivefill,
            activewidth,
            setActivewidth
        }}>
            {children}
        </toolContext.Provider>
    )
}

export default function useTool(){
    return useContext(toolContext);
}