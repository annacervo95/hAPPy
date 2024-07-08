import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import AssignmentIcon from "@material-ui/icons/Assignment"
import PhoneIcon from "@material-ui/icons/Phone"
import React, { useEffect, useRef, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { useNavigate } from "react-router-dom";
import Peer from "simple-peer"
import io from 'socket.io-client'
import styled from "styled-components"
import { host } from "../utils/APIRoutes"
import { useLocation } from "react-router-dom"


export default function ChatVideo() {
  const [me, setMe] = useState("")
  const [stream, setStream] = useState()
  const [receivingCall, setReceivingCall] = useState(false)
  const [caller, setCaller] = useState("")
  const [callerSignal, setCallerSignal] = useState()
  const [callAccepted, setCallAccepted] = useState(false)
  const [idToCall, setIdToCall] = useState("")
  const [callEnded, setCallEnded] = useState(false)
  const [name, setName] = useState("")
  const [chiamata, setChiamata] = useState(false)
  const myVideo = useRef()
  const userVideo = useRef()
  const socket= useRef()
  const connectionRef = useRef() //peer ref
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(undefined);
  const [socketClient, setSocketClient] = useState("");


  const emp = useLocation();
  const currChat = emp.state.currentChat;
  const answer = emp.state.answer;
  console.log(answer)

  useEffect( () => {
    socket.current = io(host);
    console.log(io(host))
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
  
    socket.current = io(host);
   
    socket.current.emit("getSocketChat", currChat)

    socket.current.on("ricevuto", (socketClient)=>{
  
      if(socketClient){
      console.log(socketClient)
      setSocketClient(socketClient)
      }
      else{ console.log("non è online")}
   })

   socket.current.on("tieni", (socket)=>{
      setMe(socket)
      console.log(socket)
   })

    if (currentUser) {
       
      console.log(socket)
      console.log(currentUser)
      console.log("add")
      socket.current.emit("add-user", currentUser._id);

      }

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
        console.log("qui")
      }
    })

    socket.current.on("me", (id) => {
      setMe(id)
      console.log("mio")
      console.log(id);
    })

    socket.current.on("callUser", (data) => {
      setReceivingCall(true)
      setCaller(data.from)
      setName(data.name)
      setCallerSignal(data.signal)

    })

    socket.current.on("user left",()=>{
      setChiamata(true)
      setReceivingCall(false);
      setCaller("");
      setCallAccepted(false);
  
      delete connectionRef.current;
      navigate("/login")
      
    });

  }, [currentUser,socket, currChat]);

  const callUser = () => {

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    })
    peer.on("signal", (data) => {
      socket.current.emit("callUser", {
        userToCall: socketClient,
        signalData: data,
        from: me,
        name: name
      })
     
    })
    peer.on("stream", (stream) => {

      userVideo.current.srcObject = stream

    })
    socket.current.on("callAccepted", (signal) => {
      setCallAccepted(true)
      peer.signal(signal)
    })

    connectionRef.current = peer
   
  }

  const answerCall = () => {
    setCallAccepted(true)
 
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    })
    peer.on("signal", (data) => {
      socket.current.emit("answerCall", { signal: data, to: caller })
    })
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream
    })
    
    peer.signal(callerSignal)
    connectionRef.current = peer
   
  }

  const leaveCall = () => {
    setChiamata(true)
    setCallEnded(true)
 

    connectionRef.current.destroy()

  
    navigate("/login")
    socket.current.emit("ciao");
  
  }

  return (
		<>
    <Container>
        <h1 style={{ textAlign: "center", color: '#fff' }}>Zoomish</h1>
       <div className="container">
        <div className="video-container">
          <div className="video">
            {stream &&  <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />}
          </div>
          <div className="video">
            {callAccepted && !callEnded ?
            <video playsInline ref={userVideo} autoPlay style={{ width: "300px"}} />:
            null}
          </div>
        </div>
         <div className="myId">
          <TextField
            id="filled-basic"
            label="Name"
            variant="filled"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
          <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
            <Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
              Copy ID
            </Button>
          </CopyToClipboard>

          <TextField
            id="filled-basic"
            label="ID to call"
            variant="filled"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />
          <div className="call-button">
            {callAccepted && !callEnded ? (
              <Button variant="contained" color="secondary" onClick={leaveCall}>
                End Call
              </Button>
            ) : (
              <IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
                <PhoneIcon fontSize="large" />
              </IconButton>
            )}
            {idToCall}
          </div>
        </div>
        <div>
          {receivingCall && !callAccepted ? (
              <div className="caller">
              <h1 >{name} is calling...</h1>
              <Button variant="contained" color="primary" onClick={answerCall}>
                Answer
              </Button>
            </div>
          ) : null}
        </div>
        <div>{chiamata ?(
          <h1> chiamata terminata</h1>
        ):null}
          </div>
      </div>
    </Container>
		</>
	)
}


const Container = styled.div`
.container {
	display: grid;
	grid-template-columns: 7fr 3fr;
}

.myId {
	margin-right: 5rem;
	border-radius: 5px;
	background: #c9d6ff; /* fallback for old browsers */
	background: -webkit-linear-gradient(to right, #e2e2e2, #c9d6ff); /* Chrome 10-25, Safari 5.1-6 */
	background: linear-gradient(
		to right,
		#e2e2e2,
		#c9d6ff
	); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

	padding: 2rem;
	display: grid;
	justify-content: center;
	align-content: center;
}

.call-button {
	text-align: center;
	margin-top: 2rem;
}

.video-container {
	display: grid;
	grid-template-columns: 1fr 1fr;
	justify-content: center;
	align-content: center;
	margin-top: 10rem;
	margin-left: 10rem;
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