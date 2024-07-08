
import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Contacts from "../components/Contacts";
import { allUsersRoute, host } from "../utils/APIRoutes";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import {io} from "socket.io-client";
import Popup from "../components/Popup";

export default function Chat() {
  const socket= useRef();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [chiamataArrivo, setChiamataArrivo] = useState(false)
  const [isOpen, setisOpen] = useState(false)
  const[chatProvvisoria, setChatProvvisoria] = useState("")
  const [receivingCall, setReceivingCall] = useState(false)
  const [caller, setCaller] = useState("");
  const [name, setName] = useState("");
  const [callerSignal, setCallerSignal] =useState("");
  const [usernameChiamante, setusernameChiamante] =useState("");

    const togglePopup = () => {
      setisOpen(!isOpen);
    }

  useEffect( () => {
    const funzione = async() =>{
    if (!localStorage.getItem("chat-app-user")) {
      navigate("/login");
    } else {
      setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
    }
  }
  funzione();
  }, [navigate]);

 
  useEffect(() => {
    if (currentUser) {
    
      console.log(socket.current)
      console.log("add")
      socket.current.emit("add-user", currentUser._id);
      console.log(currentUser._id)
      socket.current.on("tieni", (socket) =>{ //Controllo la mia socket nel log quale è
        console.log(socket) 
      })
    }
  }, [currentUser,socket]);


  useEffect(()=>{
    socket.current = io(host)

    socket.current.on("tieni", (socket) =>{ //mi serve per controllare solo qual è la mia socket
      console.log(socket) 
    })
  
    //Evento per geneare il popup di chiamata in arrivo
    socket.current.on("ricevichiamata",({currentUser,currentUserName})=>{
      console.log("chiamata in arrivo")
      setChiamataArrivo(true)
      setChatProvvisoria(currentUser)
      setisOpen(true)
      setusernameChiamante(currentUserName);
    })

    //Socket in ascolto di callUser necessario per la videochiamata
    socket.current.on("callUser", ({signal,from}) => { //Nel payload ricevo il segnale, la socket di chi chiama
      setReceivingCall(true)
      setCaller(from)
      setCallerSignal(signal)


    })
  },[socket])

  useEffect(() => {
    const funzione = async() => { 
    if (currentUser) {
      if (currentUser.isAvatarImageSet) { //se l'immagine non è settata mi fa settare l'immagine dell'avatar
        const data = await axios.get(`${allUsersRoute}/${currentUser._id}`); //se l'immagine è settata vado nella home: prelevo dal db tutti i contatti
        setContacts(data.data);
      } else {
        navigate("/setAvatar");
      }
    }
  }
  funzione()
  }, [currentUser, navigate]);

  


  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

const [answer, setAnswer] = useState(false);
  const rispondifunzione = () => {
    setCurrentChat(chatProvvisoria)
    
    setAnswer(true);
    setisOpen(false);
  };


  

  return(
    <>
    <div>
      <ContainerPopup>
      {isOpen && <Popup
              content={<>
              <h2> {usernameChiamante} is calling you</h2>
              <ButtonPopup onClick={rispondifunzione}>Accept</ButtonPopup>
              </>}
              handleClose={togglePopup}
       
            />}

      </ContainerPopup>
    
    <Container>
    <div className="container">
      <Contacts contacts={contacts} changeChat={handleChatChange}  />
      
    

      {currentChat === undefined ? (
        
        <Welcome />
      ) : (
        <ChatContainer currentChat={currentChat} currentUser = {currentUser} socket = {socket} answerino = {answer} receivingCall = {receivingCall} caller = {caller} name = {name} callerSignal = {callerSignal}  />
        
      )}

    </div>
  </Container>
  </div>
</>
);
}

const ContainerPopup = styled.div`

position: absolute;
top: 50%;
left: 50%;
margin-top: -250px;
margin-left: -250px;
`;


const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #fedbd0;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #feeae6;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }

`;

const ButtonPopup = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: white;
  border: none;
  cursor: pointer;
  margin-top:2rem;
  margin-left:20rem;
  svg {
    font-size: 1.3rem;
    color: #9a192c;
  }
`;