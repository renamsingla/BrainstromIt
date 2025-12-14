import React, { createContext, useContext, useState } from 'react'
import auth from '../lib/auth';
import Authapi from '../apis/Authapi';

const authContext= createContext();

export const AuthProvider = ({children}) => {

    const [user, setUser]= useState(auth.user);
    
    async function signup({name, email, password}){
        const data= await Authapi.signup({name, email, password})
        // console.log("token",data.token, "user:", data.user);
        setUser(data.user)
        return data;
    }

    async function login({email, password}) {
        const data= await Authapi.login({email, password});
        setUser(data.user)
        console.log(data.user)
        return data;
    }

    function logout() {
    auth.logout();
    setUser(null);
  }

  return (
    <authContext.Provider value={
        {signup,
        login,
        user,
        token: auth.token || "",
        isLoggedin: user? true: false,
        logout
        }
    }>
      {children}
    </authContext.Provider>
  )
}

export default function useAuth(){
    // useContext is a hook that helps to use value 
    return useContext(authContext);
}