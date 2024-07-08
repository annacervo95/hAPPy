# hAPPy

hAPPy is a web application that leverages the open-source WebRTC (Web Real-Time Communication) project, which allows a web browser to communicate in real time through the use of APIs.

The developed application implements two main features: instant messaging and video calls between two registered users. After registering and logging in, the user can start exchanging real-time messages and initiate video calls with other registered users who are also in their contact list.

The design of the application was divided into two parts:

A server application (back-end) that provides services.
A client application (front-end) that manages the user interface and allows requests for services from the server.
The tools used were Node.js, useful for writing server-side applications, and React, for implementing the graphical interface. For real-time communication, the JavaScript libraries socket.io and simple-peer were used. MongoDB was chosen for data storage.

Finally, Postman was used for testing REST APIs and Heroku for deploying the app.

**Running the Back-end:**
```bash
cd server
yarn install
yarn start
```

**Running the Front-end:**
```bash
cd public
yarn install
yarn start
```
