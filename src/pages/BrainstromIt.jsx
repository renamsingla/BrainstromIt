import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import axios from '../utils/axios';
import Toolbar from './Toolbar';
import auth from '../lib/auth';
import useAuth from '../context/AuthProvider';
import CanvasBoard from './CanvasBoard';
import './BrainstromIt.css'
import { ToolProvider } from '../context/ToolProvider';
import { DrawingProvider } from '../context/DrawingProvider';
import useSocket from '../context/SocketProvider';

const BrainstromIt = () => {
  const{user}= useAuth();
  const{socket}= useSocket();
  const[boardId, setBoardId]= useState("");

  useEffect(()=>{
    if(!socket) return;

    // initialise a board
    const initBoard= async()=>{
      let {data}= await axios.post(`api/boards/findboard`,{user:user})
      console.log(data);
      setBoardId(data._id)
    };

    initBoard(); //call the function to initialise the board after setting the socket
  },[socket])

  // EMIT SOCKET EVENT TO JOIN THE BOARD ROOM
  useEffect(()=>{
    if(!boardId)return;

    socket.emit('join-board',{boardId});
  },[boardId]);
  

  return (
    <div className="brainstorm-layout">
      {boardId? (<ToolProvider><DrawingProvider> <CanvasBoard boardId={boardId}/></DrawingProvider></ToolProvider>):"connecting"}
    </div>
  )
}

export default BrainstromIt