import React, { useEffect, useRef, useState } from "react";
import ChatList from "./Chatlist/ChatList";
import Empty from "./Empty";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/utils/FirebaseConfig";
import axios from "axios";
import { CHECK_USER_ROUTE, GET_MESSAGES_ROUTE, HOST } from "@/utils/ApiRoutes";
import { useRouter } from "next/router";
import { useStateProvider } from "@/context/StateContext";
import { reducerCases } from "@/context/constants";
import Chat from "./Chat/Chat";
import { io, Socket } from "socket.io-client";

function Main() {
  const router = useRouter();
  const [{userInfo, currentChatUser}, dispatch] = useStateProvider();
  const [redirectLogin, setRedirectLogin] = useState(false);
  const [socketEvent, setSocketEvent] =  useState(false);
  const socket = useRef();

  useEffect(() => {
    if(redirectLogin) router.push("/login");
  },[redirectLogin]);


  onAuthStateChanged(firebaseAuth,  async(currentUser) => {
    if(!currentUser) setRedirectLogin(true)
    if(!userInfo && currentUser?.email) {
      const {data} = await axios?.post(CHECK_USER_ROUTE, {email: currentUser.email})
      // console.log(data)
      if(!data.status) {
        router.push("/login");
      }
      // console.log({data});
      if(data?.data) {
        const {id, name, email, profilePicture: profileImage, status} = data.data;
        dispatch({
          type: reducerCases.SET_USER_INFO, 
          userInfo: {
            id,
            name,
            email,
            profileImage, 
            status,
          }
        });
      }
    }
  });

  useEffect(() => {
    if(userInfo) {
      socket.current = io(HOST);
      socket.current.emit("add-user",userInfo.id);
      dispatch({ type: reducerCases.SET_SOCKET, socket})
    }
  },[userInfo])

  useEffect(() => {
    if(socket.current && !socketEvent) {
      socket.current.on("msg-recieve", (data) => {
        dispatch({
          type: reducerCases.ADD_MESSAGE,
          newMessage: {
            ...data.message,
          }
        });
      });
      setSocketEvent(true);
    }
  },[socket.current])

  useEffect(() => {
    const getMessages = async () => {
      const {data: {messages},} = await axios.get(`${GET_MESSAGES_ROUTE}/${userInfo.id}/${currentChatUser.id}`);
      // console.log({data})
      dispatch({type: reducerCases.SET_MESSAGES, messages});
    }
    if(currentChatUser?.id) {
      getMessages();
    }
  },[currentChatUser])

  return (
    <>
    <div className="grid grid-cols-main w-screen max-h-screen max-w-full overflow-hidden">
      <ChatList />
      {currentChatUser ? <Chat /> : <Empty />}
    </div>
    </>
  )
}

export default Main;
