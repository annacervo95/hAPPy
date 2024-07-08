
import React from "react";
 import styled from "styled-components";

const Popup = props => {
  return (
    <Container>
    <div className="popup-box">
      <div className="box">
        <span className="close-icon" onClick={props.handleClose}>x</span>
        {props.content}
      </div>
    </div>
    </Container>
  );
};
 
export default Popup;

const Container = styled.div`


.popup-box {
    position: fixed;
    width: 50%;
    height: auto;
    top: .center;
    left:.center;

  }
   
  .box {
    margin: 70px auto;
    padding: 20px;
    background: #9a192c;
    border-radius: 5px;
    width: 60%;
    position: relative;
    transition: all 5s ease-in-out;
    margin-top: 0;
    color: white;
    border-radius: 25px;
    
  }
   
  .close-icon {
    cursor: pointer;
    position: absolute;
    top: 20px;
    right: 30px;
    transition: all 200ms;
    font-size: 30px;
    font-weight: bold;
    text-decoration: none;
    color: white;
  }
  @media screen and (max-width: 700px) {
    .box {
      width: 70%;
    }
  `;