const answersController = require('./answers');
const commentsController = require('./comments');
const postsController = require('./posts');
const tagsController = require('./tags');
const usersController = require('./users');
const authController = require('./auth');
const dashboardController = require('./dashboard');

module.exports = {
  answersController,
  commentsController,
  dashboardController,
  postsController,
  tagsController,
  usersController,
  authController,
};
