const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const db = process.env.MONGO;

const bodyParser = require("body-parser");

const TRACK = require("./model/exercise");
const USER = require("./model/user");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("Connected"))
  .catch((e) => console.log(e));

app.post("/api/users", async (req, res) => {
  const { username } = req.body;
  let user = await USER.findOne({
    username: username,
  });

  if (user) {
    // console.log ('user found: ', user)
    return res.json(user);
  } else {
    try {
      user = new USER({
        username: username,
      });
      // console.log ('user created', user)
      user.save();
      return res.json(user);
    } catch (e) {
      console.log("error", e);
    }
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { _id } = req.params;
  const { description, date, duration } = req.body;
  const newDate = new Date(date).toDateString();

  const findId = await USER.findById(_id);

  if (!findId) {
    return res.json({
      error: "User not Found",
    });
  } else {
    try {
      const newExerc = new TRACK({
        username: findId.username,
        description: description,
        duration: duration,
        date: newDate,
        userId: findId._id,
      });
      newExerc.save();
      console.log(newExerc);
      return res.send({
        username: findId.username,
        description: description,
        duration: duration,
        date: newDate,
        userId: findId._id,
      });
    } catch (e) {
      console.log("error ,", e);
    }
  }
});

app.get("/api/users", async (req, res) => {
  const users = await USER.find({});
  console.log(users);
  res.json(users);
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const { _id } = req.params;
  const user = await USER.findById(_id);
  const idIsFound = await TRACK.find({});

  const getUser = idIsFound.filter((item) => item.userId === _id);
  console.log(getUser);
  // console.log (idIsFound.length);
  // console.log ( idIsFound);
  // console.log (typeof user);
  if (!idIsFound) {
    return res.json("Not found");
  } else {
    const { userId, description, duration, date } = getUser;
    const { username } = user;
    return res.json({
      username,
      userId,
      logs: getUser,
    });
  }
});

const listener = app.listen(process.env.PORT || 8000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
