import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logout from "./Logout";
import Logo from "../assets/Pink Atomic Club Logo.png"
export default function Welcome() {
  const [userName, setUserName] = useState("");


  useEffect( () => {

    const fetchData = async()=>{
        const data = await JSON.parse(
            localStorage.getItem("chat-app-user")).username
          setUserName(data)
    }
    fetchData();
  }, []);


  return (
    <Container>
      <img src={Logo} alt="logo" />
      <h1>
        Welcome, <span>{userName}!</span>
      </h1>
      <h3>Please select a chat to Start messaging.</h3>
    <Container1>
      <div className="button"><Logout/></div>
    </Container1>
    </Container>


  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: column;
  img {
    height: 5rem;
  }
  span {
    color: #9a192c;
  }
  bottone{
   
  }
`;

const Container1 = styled.div`
 .button {
  display: flex;
  position:absolute;
  flex-direction: column;
  top:6rem;
  right:12rem;
}
`;