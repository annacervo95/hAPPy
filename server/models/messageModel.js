const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId, //mongoose.Schema.Types.ObjectId permette di riferirsi a un altro schema della collezione, indicato da ref e in questo caso è User in quanto si vuole l’id del mittente del messaggio
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", MessageSchema);