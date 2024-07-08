import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginRoute } from "../utils/APIRoutes";
import Logo from "../assets/Pink Atomic Club Logo.png"
export default function Login(){
  const navigate = useNavigate();
  
  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "white",
    };
  const [values, setValues] = useState({
    username: "",
    confirmPassword: "",
  });

//Fa restare loggati
  useEffect(() => {
    if (localStorage.getItem("chat-app-user")) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      const { username, password } = values;
      const { data } = await axios.post(loginRoute, {
        username,
        password,
      });

      if (data.status === false) {
        toast.error(data.msg, toastOptions);
      }
      if (data.status === true) {
        localStorage.setItem(
          "chat-app-user",
          JSON.stringify(data.user)
        );
        navigate("/");
      }
    }
  };

  const handleValidation = () => {
    const { username, password } = values;
    if (username === "") {
      toast.error("Email and Password is required.", toastOptions);
      return false;
    } else if (password === "") {
      toast.error("Email and Password is required.", toastOptions);
      return false;
    }
    return true;
  };

   
    
    const handleChange = (event) => {
        setValues({ ...values, [event.target.name]: event.target.value });
  };

  return (
  <>
  <FormContainer>
  <form action="" onSubmit={(event) => handleSubmit(event)}>
        <div className="brand">
        <img src={Logo} alt="logo" />
            
        </div>
        <input 
            type ="text" 
            placeholder ="Username" 
            name="username" 
            onChange={e=> handleChange(e)}
            min = "3"
        />
        <input 
            type ="password" 
            placeholder ="Password" 
            name="password" 
            onChange={e=>handleChange(e)}
        />
      <button type ="submit">Login user</button>
      <span>
          Don't have an account? <Link to="/register">Register</Link>
          </span>
  </form>
  </FormContainer>
  <ToastContainer />
  </>
 );
}


const FormContainer = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
    align-items: center;
    background-color: #fedbd0;
    .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
        height: 8rem;
    }
    h1 {
        color: black;
        text-transform: uppercase;
    }
    }
    form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: #feeae6;
    border-radius: 2rem;
    padding: 3rem 5rem;
    }
    input {
    background-color: transparent;
    padding: 1rem;
    border: 0.1rem solid #9a192c;
    border-radius: 0.4rem;
    color: black;
    width: 100%;
    font-size: 1rem;
    &:focus {
        border: 0.1rem solid #992b3e;
        outline: none;
    }
    }
    button {
    background-color: #9a192c;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    &:hover {
       opacity: 0.8;
    }
    }
    span {
    color: black;
    text-transform: uppercase;
    a {
        color: #9a192c;
        text-decoration: none;
        font-weight: bold;
    }
    &:hover {
      opacity: 0.8;
   }
    }
`;