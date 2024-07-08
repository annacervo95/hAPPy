const express = require("express"); //Importa il modulo express, ritorna una funzione express()
const cors = require ("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes")
const messageRoutes = require("./routes/messageRoutes");
const app = express(); //Ritorna una istanza di express
const socket = require("socket.io");
const users ={}
const path = require("path")

require("dotenv").config(); //Utilizzato per prendere le variabili d'ambientedefinite nel file .env e settarle il process.env

app.use(cors());
app.use(express.json()); //express.json- > middleware che analizza il corpo della richiesta post/fetch con payload json (analizza solo Content-Type: application/json.) e che saranno disponibili in req.body

//Deploy: togliere il commento alla seguente riga sposta il client sul server ora ci accedo con http://localhost:5000/
//app.use(express.static(path.join(__dirname + "/public")))//In Express, app.use(express.static()) aggiunge un middleware per fornire file statici all'app Express

app.use("/api/auth", userRoutes);
app.use("/api/messages",messageRoutes);



mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(()=>{
      console.log("DB Connection successfull");
  }).catch((err)=>{
      console.log(err.message);
  });

const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server started on port ${process.env.PORT}`)
});





const io = socket(server, {
    cors: {
      //Per il deploy: togliere il commento alla riga 47 e 49, coomentare la riga 46
      origin: "http://localhost:3000",
      //origin: ["*"],
      methods: ["GET", "POST"], //Metodi supportati dal server
      //secure: true,
      credentials: true, //Note: credentials true if you want to pass cookies and access them at server side. In my case i wanted to access the HttpOnly cookies at server side.
    }
  });
  
  global.onlineUsers = new Map();

  io.on("connection", (socket) => {
    if (!users[socket.id]){
      
      users[socket.id] = socket.id;

    }

    socket.emit("me",socket.id )


    global.chatSocket = socket;
    
    socket.on("add-user", (userId) => {
     
      onlineUsers.set(userId, socket.id);

      socket.emit("tieni",(socket.id))
    });
    
    console.log(onlineUsers)

    /*Chat*/

    //Invio messaggio
    socket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.to); //Verifico che l'utente sia online, se è online ottengo il valore della socket associato al suo id
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data.msg); //Invio un emit al destinatario sulla sua socket
      }
    });


    /*Videocall*/

    //Il server è in ascolto dell'evento callUser da parte di un client che vuole chiamare un altro
    socket.on("callUser", (data) => {
      socket.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from }) //Invio al client da chiamare il segnale e il socket.id di chi ha chiamato
    })
  
    //Il server è in ascolto dell'evento callUser da parte di un client che accetta la chiamata di un altro
    socket.on("answerCall", (data) => {
      socket.to(data.to).emit("callAccepted", data.signal) //Invia a chi aveva iniziato la chiamata un evento di callAccepted che dice che la chiamata è stata accetta e gli invia il signal del chiamato
    })

    socket.on("getSocketChat", (userId)=>{
      console.log(onlineUsers.get(userId._id))

      socket.emit("ricevuto",onlineUsers.get(userId._id))
      
    })

    

	socket.on("disconnect", () => {
    
    console.log("disconnesso");
		delete users[socket.id]
	})

  //Socket che comunica a uno dei peer che l'altro ha deciso di concludere la chiamata
  socket.on("chiudichiamata", (socketClient) => {
    socket.to(socketClient).emit("user left");
	})

  socket.on("inviaAlRichiedente", ({socketClient, currentUser})=>{
    console.log("inviaAlRichiedente")
    console.log(currentUser)
    console.log(onlineUsers.get(currentUser))
    socket.to(socketClient).emit("ricevidallanswer", (onlineUsers.get(currentUser)))
  })

  socket.on("stochiamando",({socketClient, currentUser, currentUserName})=>{
    socket.to(socketClient).emit("ricevichiamata", {currentUser, currentUserName});
   
    console.log(socketClient)
  })

  socket.on("digitando", (socketClient) =>{
  
      socket.to(socketClient).emit("stadigitando", socketClient)
   
  })

  
  


});


