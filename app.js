import express from "express";
import http from "http";
import { Server } from "socket.io";
import routerProduct from "./router/products.router.js";
import routerProductTest from "./router/productsTest.router.js";
import ContenedorChat from "./classes/ContenedorChatFile.js";

const app = express();

const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
const db = new ContenedorChat("db.json");
//Template Engines

app.use(express.urlencoded({ extended: true }));
app.use("/api/uploads", express.static("uploads"));
app.use("/public", express.static("public"));

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.render("main", {
    urlProd: "home",
  });
});

app.use("/api/productos", routerProduct);
app.use("/api/productos-test", routerProductTest);
app.use("/chat", (req, res) => {
  res.render("index");
});

io.on("connection", (socket) => {
  console.log("Somebody connected!");

  socket.on("chat-in", (data) => {
    const date = new Date().toLocaleTimeString();
    const dataOut = {
      msn: data.msn,
      username: data.username,
      date,
    };
    // Guardar en DB
    db.save(dataOut);

    console.log(dataOut);
    io.sockets.emit("chat-out", dataOut);
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log("Running...");
});
