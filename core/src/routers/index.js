const express = require('express');
const {
  auth,
  checkOwnership
} = require('../middleware');
const { allUsers } = require('../controllers/users');

const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/posts', require('./posts'));
router.use('/tags', require('./tags'));
router.use('/posts/answers', require('./answers'));
router.use('/posts/comments', require('./comments'));
router.use('/chat', require('./chat'));
router.use('/message', require('./message'));
router.use('/dashboard', require('./dashboard'));

router.route('/user')
  .get(auth, allUsers);

module.exports = router;
