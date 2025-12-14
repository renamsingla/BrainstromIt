import React from 'react'
import useAuth from './context/AuthProvider';
import { Navigate, Route, Routes } from 'react-router'
import BrainstromIt from './pages/BrainstromIt';
import Signup from './pages/Signup';
import Login from './pages/Login';
import { ThemeProvider } from './context/ThemeProvider';
import { SocketProvider } from './context/SocketProvider';

const App = () => {
  const {isLoggedin}= useAuth();
  return (
    <Routes>
      <Route path='/signup' element=
      {!isLoggedin? <Signup/> : <Navigate to='/brainstromIt'/>} />

      <Route path='/login' element=
      {!isLoggedin?<Login/>: <Navigate to='/brainstromIt'/>}/> 

      <Route path='/brainstromIt'element=
      {isLoggedin?<SocketProvider>
        <BrainstromIt /></SocketProvider>
        : <Navigate to='/login'/>}/>  
        
      <Route path="*" element={<Navigate to='/signup'/>}/> 
    </Routes>
  )
}

export default App
