import React, {useState, useRef} from "react";
import styled from "styled-components";
import Picker from "emoji-picker-react";
import {IoMdSend} from 'react-icons/io';
import {BsEmojiSmileFill} from 'react-icons/bs';
import {io} from "socket.io-client";
import {  host } from "../utils/APIRoutes";
import { useEffect } from "react";

export default function ChatInput({ handleSendMsg, currentChat}){
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [msg, setMsg] = useState("");
    const socket= useRef();


    const handleEmojiPickerHideShow = () =>{
        setShowEmojiPicker(!showEmojiPicker); //Setto come stato l'opposto di quello presente in questo modo il picker quando clicco sulla faccina compare  e scompare
    };
    const handleEmojiClick = (event, emojiObject) => {
        let message = msg;
        message += emojiObject.emoji;
        setMsg(message);
      };

      const sendChat = (event) => {
        event.preventDefault();
        if (msg.length > 0) {
          handleSendMsg(msg);
          setMsg("");
        }
      };
       

      const [socketClient, setSocketClient ] =useState("");
      useEffect(()=>{
        socket.current = io(host)
       
        socket.current.emit("getSocketChat", currentChat)
        console.log(currentChat)
        socket.current.on("ricevuto", (socketClient)=>{
          if(socketClient){
          console.log(socketClient)
          setSocketClient(socketClient)
      
          }
          else{ 
            console.log("non è online")
          }
       })
      
      })
    
      const typing = (e) =>{
        socket.current = io(host)
        setMsg(e.target.value)
  
        socket.current.emit("digitando", (socketClient));
        console.log("socketclienttttt")
        console.log(socketClient)
     
      }
       
      

    return (
        <Container>
          <div className="button-container">
            <div className="emoji">
              <BsEmojiSmileFill onClick={handleEmojiPickerHideShow} />{
                  showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />
              }
            
            </div>
          </div>
          <form className="input-container"  onSubmit={(event) => sendChat(event)}>
          <input
             type="text"
            placeholder="type your message here"
            onChange={(e) => typing(e)}
            value={msg}
        />
            <button type="submit">
              <IoMdSend />
            </button>
          </form>
        </Container>
      );
}

const Container = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 5% 95%;
  padding: 0 2rem;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    padding: 0 1rem;
    gap: 1rem;
  }
  .button-container {
    display: flex;
    align-items: center;
    color: white;
    gap: 1rem;
    .emoji {
      position: relative;
      svg {
        font-size: 1.5rem;
        color: #9a192c;
        cursor: pointer;
      }
      .emoji-picker-react {
        position: absolute;
        top: -350px;
        background-color: #feeae6;
        box-shadow: 0 5px 10px white;
        border-color: white;
        .emoji-scroll-wrapper::-webkit-scrollbar {
          background-color: white;
          width: 5px;
          &-thumb {
            background-color: #9a192c;
          }
        }
        .emoji-categories {
          button {
            filter: contrast(0);
          }
        }
        .emoji-search {
          background-color: transparent;
          border-color: #feeae6;
        }
        .emoji-group:before {
          background-color: white;
          border-radius: 5px;
          text-align: center;
        }
      }
    }
  }
  .input-container {
    width: 100%;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    background-color: white;
    input {
      width: 90%;
      height: 60%;
      background-color: transparent;
      color: black;
      border: none;
      padding-left: 1rem;
      font-size: 1.2rem;
      &::selection {
        background-color: default;
      }
      &:focus {
        outline: none;
      }
    }
    button {
      padding: 0.3rem 2rem;
      border-radius: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #9a192c;
      border: none;
      @media screen and (min-width: 720px) and (max-width: 1080px) {
        padding: 0.3rem 1rem;
        svg {
          font-size: 1rem;
        }
      }
      svg {
        font-size: 2rem;
        color: white;
      }
    }
  }
`;