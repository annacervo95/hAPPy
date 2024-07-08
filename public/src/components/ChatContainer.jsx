import React, {useState,useEffect, useRef} from "react";
import styled from "styled-components";
import Logout from "./Logout";
import ChatInput from "./ChatInput";
import { getAllMessageRoute, sendMessageRoute } from "../utils/APIRoutes";
import axios from "axios";
import { FaVideo } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import Peer from "simple-peer"
import { IoMdClose } from "react-icons/io";

export default function ChatContainer({currentChat, currentUser, socket, answerino,receivingCall,caller ,name, callerSignal}){

  const [messages, setMessages] = useState();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();
  const [chiamata, setChiamata] = useState(false);
  const [me, setMe] = useState("")
  const [stream, setStream] = useState()
  const [callAccepted, setCallAccepted] = useState(false)
  const [callEnded, setCallEnded] = useState(false)
  const myVideo = useRef()
  const userVideo = useRef()
  const connectionRef = useRef() //peer ref
  const navigate = useNavigate();
  const [socketClient, setSocketClient] = useState("");
  const [premuto, setPremuto]= useState(false);
  const [answer,setAnswer] = useState(false)
  const [chiamante, setChiamante] = useState(false)
  const [prova, setProva] = useState(false)
  const [currentUserName, setCurrentUserName] = useState()
  const [isOnline, setIsOnline] = useState(false)
  const [typing, setTyping] = useState(false)


  useEffect(() => {
    const fetchdata = async()=>{
    const data = await JSON.parse(localStorage.getItem("chat-app-user")); //Prelevo i dati dal local storage relativi all'utente
    setCurrentUserName(data.username); //Setto l'username dell'utente loggato
    }
    fetchdata();
  }, []);



  useEffect( () => {
    setProva(answerino)
    const fetch = async()=>{
    const data = await JSON.parse(localStorage.getItem("chat-app-user"));
    const response = await axios.post(getAllMessageRoute, { //Prelevo tutti i messaggi che l'utente ha scambiato con il contatto selezionato
      from: data._id, //Id dell'utente loggato
      to: currentChat._id, //Chat selezionata
    });
    setMessages(response.data);
  }
  fetch();
  }, [currentChat]);

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(localStorage.getItem("chat-app-user"))._id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

/*Implementazione chat */

  //Invio messaggio
  const handleSendMsg = async (msg) => { 
    const data = await JSON.parse(localStorage.getItem("chat-app-user"));   //Prelevo i dati dal local storage dell'utente loggato
    socket.current.emit("send-msg", { //Invio l'evento send-msg
      to: currentChat._id, //Payload dell'evento: id della chat corrente, id dell'utente loggato e il messaggio
      from: data._id,
      msg,
    });
    await axios.post(sendMessageRoute, { //Faccio una richiesta Post per archiviare sul database il messaggio
      from: data._id,
      to: currentChat._id,
      message: msg,
    });

    const msgs = [...messages]; //Vettore che contiene tutti i messaggi
    msgs.push({ fromSelf: true, message: msg }); //Aggiunge a msgs il messaggio appena inviato
    setMessages(msgs); //Setta il vettore di messaggi pari a ai vecchi più quello appena inviato
  };
  
  //Ricezione messaggio
  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => { //Ricezione evento msg_receive, nel payload c'è il messaggio del mittente
        setArrivalMessage({ fromSelf: false, message: msg }); //Setto il messaggio ricevuto nella variabile arrivalMessage
      });

      socket.current.on("stadigitando", (socketClient) =>{ //Socket per ricevere l'evento che l'altro sta scrivendo il messaggio
        console.log(socketClient)
        console.log("Sta scrivendo")
        setTyping(true)
        setTimeout(() => { //Prevede che dopo 30000 millisecondi viene messo typing a false se l'utente ha smesso di scrivere
          setTyping(false)
        }, 3000);
      })
    }
  }, [socket]);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]); //Concatena il messaggio appena arrivato ai messaggi già presenti
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" }); //Permette di abilitare lo scroll della view
  }, [messages]);


  /*Implementazione videocall*/

  useEffect(() => {
   
    socket.current.emit("getSocketChat", currentChat)

    socket.current.on("ricevuto", (socketClient)=>{
  
      if(socketClient){
      console.log(socketClient)
      setSocketClient(socketClient)
      setIsOnline(true)
      }
      else{ 
        console.log("non è online")
        setIsOnline(false)
      }
   })

   socket.current.on("tieni", (socket)=>{
      setMe(socket)
      console.log(socket)
    
   })
  
   if(!premuto)
   {console.log("non premuto")
  }
   else{ 
     console.log("premuto")
     navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => { //Accede in locale ai propri dispositivi multimediali, quindi a webcam e microfono
			setStream(stream) //Una volta che ha avuto successo lo stream viene salvato nella variabile di stato stream cosi può essere mostrato sia nell'UI sia inviato
                        //all'altro peer
      console.log(stream)

		})
   }



    socket.current.on("me", (id) => {
      setMe(id)
      console.log("mio")
      console.log(id);
    })
  
//Evento che comunica che l'altro peer ha lasciato la chiamata
    socket.current.on("user left",()=>{
      setChiamata(true)
      setCallAccepted(false);
      delete connectionRef.current;
      window.location.reload();
      
    });
    console.log(callerSignal)
  },[currentChat, socket,navigate, premuto]);
  
  useEffect(() => {
    if (myVideo.current){
     myVideo.current.srcObject = stream;
     if(premuto && stream && chiamante){
      funzioneChiamata();
    }else if(premuto  && answer){
      funzioneRisposta();
    }
  }}, [stream, myVideo,answer]);

 
//Funzione che avvia la videocall
  const funzioneChiamata=()=>{
    const peer = new Peer({ //Creazione di una nuova connection peer
      initiator: true, //E' l'iniziatore
      trickle: false, //Tricke ICE disabilitato
      stream: stream, //Associo lo stream locale al peer
      //Togliere il commento alle righe seguenti per il deploy
      //secure: true,
      //host: "happyappesame.herokuapp.com", 
      //port: 443
    })
    peer.on("signal", (data) => { //Emetto l'evento per inviare i dati di segnalazione al peer remoto
      socket.current.emit("callUser", { //Emetto l'evento che sto chiamando l'utente
        userToCall: socketClient, //Passo come parametri: la socket del chiamato, i dati, e l'id di chi chiama
        signalData: data,
        from: socket.current.id,
      })
      console.log(data)
    })

    peer.on("stream", (stream) => { //Attendo l'evento stream, nel cui payload vi è lo stream del peer remoto
      userVideo.current.srcObject = stream 
      console.log(stream)
    })
  
    socket.current.on("callAccepted", (signal) => { //Resto in ascolto dell'evento callAccepted, dove nel payload vi è il signal del peer remoto
      setCallAccepted(true)
      peer.signal(signal) //Chiamato dunque quando l'altro peer fa peer.on("signal"), con questo metodo mi connetto all'altro peer
      console.log(signal)
    })
   
    connectionRef.current = peer

    
    
  }

  //Funzione di risposta alla videocall
  const funzioneRisposta=()=>{
    setCallAccepted(true)
  
    const peer = new Peer({ //Creo la connection peer
      initiator: false, //Non è l'iniziatore
      trickle: false, //Disabilito trickle ICE
      stream: stream, //Associo lo stream locale al peer
      //Togliere il commento alle righe seguenti per il deploy
      //secure: true,
      //host: "happyappesame.herokuapp.com", 
      //port: 443
    })
    peer.on("signal", (data) => { //Emetto l'evento per inviare i dati di segnalazione al peer remoto
      socket.current.emit("answerCall", { signal: data, to: caller }) //Emetto l'evento answerCall che ha come payload il segnale da inviare e la socket di chi ha chiamato
      console.log(data)
    })
    peer.on("stream", (stream) => { //Attendo l'evento stream, nel cui payload vi è lo stream del peer remoto
      userVideo.current.srcObject = stream
      console.log(stream)
    })
   
    peer.signal(callerSignal) //Uso questo metodo per connettermi con il peer remoto
    connectionRef.current = peer
    
    console.log(callerSignal)


  }


const callUser=() =>{
  console.log("caller")

  setChiamata(true)
  setPremuto(true)
  setChiamante(true)
  socket.current.emit("stochiamando", {socketClient, currentUser, currentUserName});

  console.log(currentUser.name)
  
}


const answerCall = () => {
 

  console.log("sono chi riceve")
  console.log(caller)
  setChiamata(true)
  setPremuto(true)
  setAnswer(true)
  setProva(false)
}


//Chiusura chiamata
const leaveCall = () => {
  console.log("chiamata terminata")
  setChiamata(true)
  setCallEnded(true)


  connectionRef.current.destroy()
  if(callAccepted){
  socket.current.emit("chiudichiamata", socketClient);
  }
  window.location.reload();
}


  return (
    
<>
    

     {chiamata? (
      <Video>
  

              <div className="video-container">
              <div className="video">
                {callAccepted && !callEnded ?
                <div>
                <video playsInline ref={userVideo} autoPlay style={{ width: "600px"}} />
               <h2>{currentChat.username}</h2>
                </div>:
                null}
              
              </div>
              <div className="myvideo-container">
              <div className="video">
                {stream &&  <video playsInline muted ref={myVideo} autoPlay style={{ width: "200px" }} />}
                <h2>You</h2>
              </div>
              </div>    

            
              <div className="buttonEndCall" onClick={leaveCall}>
               <IoMdClose/>
              </div>
</div>
       </Video>
   
     ):
    (
      <Container>

      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt=""  
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
         
            {(() => {
              if (isOnline && !typing) {
                return (
                  <div>Online</div>
                )
              } else if (isOnline && typing) {
                return (
                  <div>Typing...</div>
                )
              } else {
                return (
                  <div>Offline</div>
                )
              }
      })()}
          </div>
        </div>
       <div className="icons">
        {isOnline ? (
       <Button onClick={callUser}><FaVideo /> </Button>
        ):(<ButtonOpacity ><FaVideo /> </ButtonOpacity>)}
        <Logout/>
      {prova ? (answerCall()):null}
      
       </div>
      
      </div>
   
      <div className="chat-messages">
        { messages?.map((message) => { //Scorro tutti i messaggi in messages
           return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${message.fromSelf ? "sended" : "recieved"}`} //In base al tipo applico anche un diverso CSS
              >
                <div className="content "> 
                  <p>{message.message}</p> {/*di ogni messaggio considero il campo messaggio*/}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} currentChat={currentChat} />
      </Container>
    )
}
</>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: #9a192c;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
          margin-bottom:0.5rem;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #9a192c;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: black;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: white;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9a192c;
      
      }
    }
  }
  

    .icons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2rem;
      flex-direction: row;
      gap: 1rem;
    }
`;
const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: white;
  border: none;
  cursor: pointer;
  svg {
    font-size: 1.3rem;
    color: #9a192c;
  }
`;

const ButtonOpacity = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: white;
  border: none;
  cursor: default;
  svg {
    font-size: 1.3rem;
    color: #9a192c;
    opacity: 0.5;
  }
`;



const Video = styled.div`
.buttonEndCall{
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #9a192c;
  border: none;
  cursor: pointer;
  margin-right: 10rem;
  margin-left: 20rem;
  margin-top: -3rem;
  height:40px;
  width: 40px;
  svg {
    font-size: 1.3rem;
    color: white;
  }
  &:hover {
    opacity: 0.8;
 }

}
.containervideo {
	display: grid;
	grid-template-columns: 7fr 3fr;

}

.video-container {

	display: grid;
	grid-template-columns: 1fr 1fr;
	justify-content: center;
	align-content: center;
	margin-top: 2rem;
  margin-left: 5rem;


}

.myvideo-container {

	display: grid;
	grid-template-columns: 1fr 1fr;
	justify-content: center;
	align-content: center;
	margin-top: 32rem;
  margin-left:5rem;

}

.caller {
	text-align: center;
	color: #fff;
}

body {
	background: #4776e6; /* fallback for old browsers */
	background: -webkit-linear-gradient(to right, #8e54e9, #4776e6); /* Chrome 10-25, Safari 5.1-6 */
	background: linear-gradient(
		to right,
		#8e54e9,
		#4776e6
	); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}
`;