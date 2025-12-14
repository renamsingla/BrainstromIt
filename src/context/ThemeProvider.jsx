import { createContext, useContext, useEffect, useState } from "react"
import auth from "../lib/auth";

const themeContext= createContext();

export const ThemeProvider=({children})=>{

    const[theme, setTheme]= useState(auth.theme || "dark");

    useEffect(()=>{
        document.body.className=`${theme}-theme`
        auth.theme=theme;
    },[theme])

    const toggleTheme=()=>{
        setTheme(currTheme=>currTheme==="light"?"dark": "light")
    }

    return(
        <themeContext.Provider value={{
        theme,
        toggleTheme
    }}>
        {children}
    </themeContext.Provider>
    )
}

export default function useTheme(){
    return useContext(themeContext)
}