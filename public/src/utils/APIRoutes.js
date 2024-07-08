//Per il deploy: commentare la riga due e togliere il commento alla riga 3
export const host = "http://localhost:5000";
//export const host = ""; 
export const registerRoute = `${host}/api/auth/register`;
export const loginRoute = `${host}/api/auth/login`;
export const setAvatarRoute = `${host}/api/auth/setAvatar`;
export const allUsersRoute = `${host}/api/auth/allusers`;
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const getAllMessageRoute = `${host}/api/messages/getmsg`;
export const addFriendRoute = `${host}/api/auth/addFriends`;
export const allUsersDBRoute = `${host}/api/auth/allusersdb`;