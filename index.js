const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gsezq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("JwtAuth");
    const usersCollection = database.collection("users");

    //   post users api
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(req.body);
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    // Post login api
    app.post("/login", async (req, res) => {
      try {
        const email = req.body.email;
        const password = req.body.password;

        const userEmail = await usersCollection.findOne({ email: email });

        if (userEmail.password === password) {
          const token = jwt.sign(
            {
              name: userEmail.name,
              email: userEmail.email,
            },
            "secret123",
            {
              expiresIn: "60s",
            }
          );
          // console.log(token);
          userEmail.token = token;
          res.json(userEmail);
        } else {
          res.json({
            error: "Password is wrong",
          });
        }
      } catch (error) {
        res.status(400).send("invalid Email");
      }
    });
    //   get user api
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // get single orders api
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.json(result);
    });

    // Delete an user
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      console.log(result);
      res.json(result);
    });
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello sir, Its working properly");
});

app.listen(port, () => {
  console.log(`listening port is ${port}`);
});
