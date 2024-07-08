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



  useEffect(() => {
  
  

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setStream(stream);
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
        console.log("qui")
      }
    })

   

    })

   
 


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