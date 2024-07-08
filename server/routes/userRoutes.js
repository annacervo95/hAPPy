const {
    register, 
    login, 
    setAvatar,
    getAllUsers,
    addFriends,
    getAllUsersDB
} = require("../controllers/userController");

const router = require("express").Router();

router.post("/register",register);
router.post("/login",login);
router.post("/setAvatar/:id",setAvatar);
router.get("/allusers/:id", getAllUsers);
router.post("/addFriends/:id", addFriends);
router.get("/allusersdb/:id", getAllUsersDB);
module.exports = router;