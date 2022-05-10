const express = require('express');
const { check } = require('express-validator');
const { auth, checkOwnership } = require('../middleware');
const { postsController } = require('../controllers');
const { VOTES } = require('../constants');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

/** @route      GET /api/posts
 *  @desc       fetch all posts
 */
router.route('/')
  .get(postsController.getPosts);

/** @route      GET /api/posts/tag/:tagname
 *  @desc       fetch all posts of a specific tag
 */
router.route('/tag/:tagname')
  .get(postsController.getTagPosts);

/** @route      GET /api/posts/:id
 *  @desc       fetch a single post
 */
router.route('/:id')
  .get(optionalAuth,postsController.getSinglePost);

/** @route      POST /api/posts/
 *  @desc       add a post
 */
router.route('/')
  .post(
    auth,
    check('title', 'Enter a title with minimum 15 characters').isLength({ min: 15 }),
    check('body', 'Enter a body with minimum 30 characters').isLength({ min: 30 }),
    postsController.addPost,
  );

/** @route      DELETE /api/posts/:id
 *  @desc       delete a post
 */
router.route('/:id')
  .delete(
    auth,
    checkOwnership,
    postsController.deletePost,
  );

/** @route      POST /api/posts/vote/:id
 *  @desc       vote a post
 */
 router.route('/vote/:id')
 .post(
   auth,
   check('voteType', 'Votetype should be 1 or -1').isIn([VOTES.UPVOTE, VOTES.DOWNVOTE]),
   postsController.addVote,
 );
router.route('/status/:id')
  .patch(
    auth,
    postsController.patchPost,
  );

router.route('/:id').patch(auth, postsController.bestAnswer)

module.exports = router;
