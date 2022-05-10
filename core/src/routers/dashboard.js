const express = require('express');
const { check } = require('express-validator');
const { auth } = require('../middleware');
const { dashboardController } = require('../controllers');

const router = express.Router();

// The number of question posted per day
router.route('/count/question')
  .get(auth, dashboardController.questionPerDay);

// Top 10 most viewed question
router.route('/popular/question')
  .get(auth, dashboardController.popularQuestion);

// Top 10 most used tag
router.route('/popular/tag')
  .get(auth, dashboardController.popularTag);

// Top 10 user with the highest reputation
router.route('/reputation/user/highest')
  .get(auth, dashboardController.highestReputation);

// Top 10 user with the lowest reputation
router.route('/reputation/user/lowest')
  .get(auth, dashboardController.lowestReputation);

module.exports = router;
