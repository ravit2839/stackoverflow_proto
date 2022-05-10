const postsService = require('./posts');
const answersService = require('./answers');
const commentsService = require('./comments');
const usersService = require('./users');
const tagsService = require('./tags');
const dashboardService = require('./dashboard');

module.exports = {
  postsService,
  answersService,
  commentsService,
  usersService,
  tagsService,
  dashboardService
};
