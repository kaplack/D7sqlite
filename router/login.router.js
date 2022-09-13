import express from "express";
import session from "express-session";
import multer from "multer";

import { Router } from "express";

const routerLogin = Router();

routerLogin.get("/", (req, res) => {
  res.render("login");
});

const upload = multer();
routerLogin.post("/", upload.none(), (req, res, next) => {
  let user = {
    user: req.body.user,
  };

  if (req.session.currentUser) {
    res.redirect("/");
  } else {
    req.session.currentUser = user;
    res.redirect("/");
  }
});

export default routerLogin;
