const User = require("../models/userModel");
const bcrypt = require("bcrypt"); //Per la memorizzazione della password non in chiaro, dunque non come una semplice stringa, è stata utilizzata la libreria bcrypt che permette di fare il password hashing.



module.exports.register = async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const usernameCheck = await User.findOne({ username });
      if (usernameCheck)
        return res.json({ msg: "Username already used", status: false });
      const emailCheck = await User.findOne({ email });
      if (emailCheck)
        return res.json({ msg: "Email already used", status: false });
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        username,
        password: hashedPassword,
      });
      delete user.password;
      return res.json({ status: true, user });
    } catch (ex) {
      next(ex);
    }
  };

  module.exports.login = async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user)
        return res.json({ msg: "Incorrect username or password", status: false });
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
       return res.json({ msg: "Incorrect username or password", status: false });
      delete user.password;
      return res.json({ status: true, user });
    } catch (ex) {
      next(ex);
    }
  };

  module.exports.setAvatar = async (req, res, next) => {
    try {
      const userId = req.params.id;
      const avatarImage = req.body.image;
      const userData = await User.findByIdAndUpdate(
        userId,
        {
          isAvatarImageSet: true,
          avatarImage,
        },
        { new: true }
      );
      return res.json({
        isSet: userData.isAvatarImageSet,
        image: userData.avatarImage,
      });
    } catch (ex) {
      next(ex);
    }
  };
  module.exports.getAllUsers = async (req, res, next) => {
  try {           //$ne: seleziona tutti gli id che non sono uguali a quelli passati in ne
   /* const users = await User.find({ _id: { $ne: req.params.id } }).select([ //Select indica i campi che voglio estrapolare, in questo caso voglio tutti ma se tipo levassi tutti e lasciassi solo id mi stamperebbe solo tutti gli id degli utenti, di tutti gli utenti tranne dell'utente in cui mi trovo
      "email",
      "username",
      "avatarImage",
      "_id",
      "friends"
    ]);*/
    //Lista email amici utente
    const emailFriend = await User.find({_id:req.params.id}).distinct("friends") //Ritorna solo il valore del campo friends
  
    const friends = await User.find({email: emailFriend}) //Torna tutti gli utenti con email uguale alla lista amici dell'utente

    return res.json(friends);
  } catch (ex) {
    next(ex);
  }
};

//Ritorna tutti gli utenti nel db la loro mail
module.exports.getAllUsersDB = async (req, res, next) => {
  try {           //$ne: seleziona tutti gli id che non sono uguali a quelli passati in ne
    const users = await User.find({ _id: { $ne: req.params.id } }).select([ //Select indica i campi che voglio estrapolare, in questo caso voglio tutti ma se tipo levassi tutti e lasciassi solo id mi stamperebbe solo tutti gli id degli utenti, di tutti gli utenti tranne dell'utente in cui mi trovo
      "email",
    ]);
    //Lista email amici utente
   console.log(users)
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};

module.exports.addFriends = async(req, res, next) =>{
  try {
    const userId = req.params.id;
    const emailFriend = req.body.emailFriend;

    const userData = await User.findByIdAndUpdate(
     userId,
      {$push: {friends: emailFriend}},
      {new: true, upsert: true}
    );
  
    if (userData) return res.json({ msg: "Friend added successfully." });
    else return res.json({ msg: "Failed to add friend to the database" });

  }catch (ex) {
    next(ex);
  }
};
  