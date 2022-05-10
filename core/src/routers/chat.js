const express = require("express");
const {
  accessChat,
  fetchChats,
} = require("../controllers/chat");
const { auth, checkOwnership } = require('../middleware');

const router = express.Router();

router.route("/").post(auth, accessChat);
router.route("/").get(auth, fetchChats);

module.exports = router;
