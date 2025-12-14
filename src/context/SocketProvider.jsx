import React, { useEffect } from "react";
import { createContext, useContext, useState } from "react"
import useAuth from "./AuthProvider";
import auth from "../lib/auth";
import { io } from "socket.io-client";


const socketContext= createContext();

export const SocketProvider=({children})=>{

    const {user, token}= useAuth();

    const[socket, setSocket]=useState("");

    // //socket establishment on frontend
    useEffect(()=>{
        if(!token) return;
        let s= io(import.meta.env.VITE_API_URL,{
            auth:{
                    token: `${auth.token}`
                }
            })
        s.on('connect',()=>{
        console.log("user connected")
        })
        setSocket(s);

        return()=>{
        s.disconnect();
        }
    },[])

    return(
        <socketContext.Provider value={{socket,setSocket}}>
            {children}
        </socketContext.Provider>
    )
}

export default function useSocket(){
    return useContext(socketContext)
}