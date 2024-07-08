import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Popup from "./Popup";
import { Button, TextField } from "@material-ui/core";
import {addFriendRoute, allUsersDBRoute } from "../utils/APIRoutes";
import axios from "axios";
import PersonAdd  from '@material-ui/icons/PersonAdd';
import Logo from "../assets/Pink Atomic Club Logo.png"



export default function Contacts({ contacts, changeChat }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("")
  const [myEmail, setMyEmail] = useState(false)
  const togglePopup = () => {
    setIsOpen(!isOpen);
    setEmailEmpty(false)
    setMyEmail(false)
  }
 
 

  useEffect(() => {
    const fetchdata = async()=>{
    const data = await JSON.parse(
      localStorage.getItem("chat-app-user")
    );
    setCurrentUserName(data.username);
    setCurrentUserImage(data.avatarImage);
    }

    fetchdata();
  
  }, []);
  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };
  const [emailEmpty, setEmailEmpty] = useState(false)
  const [found, setFound] = useState("")
  const addFriend = async() =>{
    setMyEmail(false)
    console.log(email)
    if(!email){
        console.log("Email non inserita")
       
        setEmailEmpty(true)
        setFound("");
        setMyEmail(false)
    } else{
      console.log("Aggiungo la mail")

        const user = await JSON.parse(localStorage.getItem("chat-app-user")); //parse: analizza la stringa costruendo l'oggetto JS definito nell'Oggeto JSON; localStorage è una proprietà che consente ai siti e alle app JavaScript di salvare coppie chiave-valore in un browser Web senza data di scadenza. Ciò significa che i dati memorizzati nel browser persisteranno anche dopo la chiusura della finestra del browser.
        console.log(user.email)
        if (email === user.email){
          setMyEmail(true)
          setFound("");
          setEmailEmpty(false);
        }
        else{
          setEmailEmpty(false);
          setMyEmail(false);
          const  data2  = await axios.get(`${allUsersDBRoute}/${user._id}`); 
          var i = 0;
          var cont = 0;
         
          for (i=0; i<data2.data.length; i++) {
          console.log(data2.data[i].email)
          if(email === data2.data[i].email){
              cont++;
              console.log("email presente nel db posso aggiungere l'amico")
          }
          }
          console.log(cont)
         if(cont == 1){
            setFound("trovato");
      
          const { data } = await axios.post(`${addFriendRoute}/${user._id}`, {
            emailFriend: email,
          });  
          console.log("aggiungo")
          setIsOpen(false);
          window.location.reload();
        }
        else{
          setFound("nontrovato");
        }
        }
    }
};
  
  return (
    <>
      {currentUserImage && currentUserImage && (
        <Container>
          <div className="brand">
          <img src={Logo} alt="logo" />
          <ButtonAdd onClick={togglePopup}>
              <PersonAdd/>
            </ButtonAdd>
            {isOpen && <Popup
              content={<>
              <h2>Enter your friend's email</h2>
              <TextField  className="textField" placeholder="Inserisci la email" variant="standard"  style ={{width: '80%'} } value={email}   onChange={(e) => setEmail(e.target.value)}/>
             
              <ButtonPopup onClick={addFriend}>
                  Add
              </ButtonPopup>
              {myEmail ? <h3>You can't enter your email!</h3>: null}
              {emailEmpty ? <h3>Enter an email, please!</h3>: null}
              {found === "nontrovato" ?  <h3>Contact not registred!</h3>: null}
              </>}
              handleClose={togglePopup}
            />}
            
          </div>
      
         
          <div className="contacts">
            {contacts.map((contact, index) => {
              return (
                <div
                  key={contact._id}
                  className={`contact ${index === currentSelected ? "selected" : "" }`}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  <div className="avatar">
                    <img
                      src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                      alt=""
                    />
                  </div>
                  <div className="username">
                    <h3>{contact.username}</h3>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="current-user">
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="avatar"
              />
            </div>
            <div className="username">
              <h2>{currentUserName}</h2>

            </div>
          </div>
        </Container>
      )}
    </>
  );
}
const Container = styled.div`

  display: grid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: #feeae6;
  border-right: solid #fedbd0;
  border-width: 6px;
 .textField{
  margin-top: 1rem;
  

  ),
 }


  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-left:3rem;
    img {
      height: 4rem;
    }
    h3 {
      color: black;
      text-transform: uppercase;
   
    }
  }

  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #9a192c;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      background-color: #9a192c;
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
    .selected {
      opacity: 0.7
    }
  }
  .current-user {
    background-color: #9a192c;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: white;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
`;

const ButtonAdd = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #9a192c;
  border: none;
  cursor: pointer;
  margin-left:10rem;
  svg {
    font-size: 1.3rem;
    color: white;
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
