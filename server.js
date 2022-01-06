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
  .connect(
    `mongodb+srv://bruno:sarapita88@cluster0.5jn5b.mongodb.net/freeCode?retryWrites=true&w=majority`
  )
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
(
  USER.findById(_id, (err, userData)=> {
    if (err || !userData) {
      return res.json ({
        error: err
      })
    } else {
      let filter = {
        userId: _id
      }


      TRACK.find(filter).exec((err,data)=> {
        if(err || !data) {
          return res.json({
            error: err
          })
        } else {
          const count = data.length;
          const rawLog = data;
          const {username, _id} = userData;

          const log = rawLog.map (l => ({
            description: l.description,
            duration: l.duration,
            date: l.date
          }));
          res.json ({
            username,
            count,
            _id,
            log
          });
        }
      })
    }
  }))



});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
