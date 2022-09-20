import express from "express";
import http from "http";
import { Server } from "socket.io";
import routerProduct from "./router/products.router.js";
import routerProductTest from "./router/productsTest.router.js";
import routerLogin from "./router/login.router.js";
import ContenedorChat from "./classes/ContenedorChatFile.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import ContenedorUser from "./classes/ContenedorUser.js";
import bcryptjs from "bcryptjs";

const app = express();

const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
const db = new ContenedorChat("./public/db/dbNormalized.json");
const myMongoDB = new ContenedorUser();
//Template Engines

//CONFIGURACION EXPRESS-SESSION
// mongodb
app.use(cookieParser());
app.use(
  session({
    store: new MongoStore({
      mongoUrl:
        "mongodb+srv://ABurga:g5kNcaBKcEodAE83@cluster0.4upmc2o.mongodb.net/?retryWrites=true&w=majority",
      advancedOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      ttl: 60000,
    }),
    secret: "orwell",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use("/api/uploads", express.static("uploads"));
app.use("/public", express.static("public"));

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
  res.render("main", {
    urlProd: "home",
    user: req.session.currentUser,
  });
});

app.use("/api/productos", routerProduct);
app.use("/api/productos-test", routerProductTest);

//LOGIN
app.use("/login", routerLogin);
//LOGIN
app.use("/chat", (req, res) => {
  //db.myDenormalized();
  res.render("index");
});

//LOG OUT (el header.ejs envia un post al localhost/logout)
app.post("/logout", (req, res) => {
  let user = req.session.currentUser;
  req.session.destroy();
  res.send(`<h1>Hasta luego ${user} </h1>`);
});
//SIGNUP
app.get("/signup", (req, res) => {
  res.render("signup", { user: req.session.currentUser });
});
app.post("/signup", async (req, res) => {
  let usersData = await myMongoDB.read();
  let userCtrl = usersData.some((u) => u.username == req.body.user);
  if (!userCtrl) {
    let password = req.body.password;
    let salt = bcryptjs.genSaltSync(8);
    password = bcryptjs.hashSync(String(password), salt);

    let userData = {
      username: req.body.user,
      email: req.body.email,
      password,
    };
    myMongoDB.save(userData);
    res.redirect("/");
  } else {
    res.send("El nombre de usuario ya existe!");
  }
});

io.on("connection", (socket) => {
  console.log("Somebody connected!");

  socket.on("chat-in", (data) => {
    const date = new Date().toLocaleTimeString();
    const dataOut = {
      text: data.text,
      author: data.author,
      date,
    };
    // Guardar en DB
    db.save(dataOut);
    db.normalizarChat();

    console.log(dataOut);
    io.sockets.emit("chat-out", dataOut);
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log("Running...");
});
