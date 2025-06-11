import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { connect, save, getData } from "./db/db.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use("/js", express.static(path.join(process.cwd(), "src", "public", "js")));
app.use(
  "/css",
  express.static(path.join(process.cwd(), "src", "public", "css"))
);

app.get("/", (_req, res) => {
  res.sendFile(path.join(process.cwd(), "src", "public", "index.html"));
});

app.get("/load", (_req, res) => {
  getData({ owner: "test" })
    .then((data) => {
      res.json({ code: data || "" });
    })
    .catch((err) => {
      console.error("Error retrieving data:", err);
      res.status(500).send("Error retrieving data");
    });
});

app.post("/save", express.json(), (req, res) => {
  save({ owner: "test", data: req.body.code })
    .then(() => {
      console.log("Data saved successfully");
    })
    .catch((err) => {
      console.error("Error saving data:", err);
      return res.status(500).send("Error saving data");
    });
  res.status(200).send("Data received");
});

io.on("connection", (socket) => {
  socket.on("code", (newData) => {
    socket.broadcast.emit("code", newData);
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
  connect()
    .then(() => console.log("Database connected"))
    .catch((err) => console.error("Database connection error:", err));
});
