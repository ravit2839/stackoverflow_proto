const express = require('express');
const { check } = require('express-validator');
const { auth, checkOwnership } = require('../middleware');
const { answersController } = require('../controllers');
const { VOTES } = require('../constants');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

/** @route      GET /api/posts/answers/:id
 *  @desc       fetch all answers of a post
 */
router.route('/:id')
  .get(
    optionalAuth,
    answersController.getAnswers
  );

/** @route      POST /api/posts/answers/:id
 *  @desc       add an answer to a post
 */
router.route('/:id')
  .post(
    auth,
    check('text', 'Answer is required').not().isEmpty(),
    answersController.addAnswer,
  );

/** @route      DELETE /api/posts/answers/:id
 *  @desc       delete an answer to a post
 */
router.route('/:id')
  .delete(
    auth,
    checkOwnership,
    answersController.deleteAnswer,
  );

/** @route      POST /api/answers/vote/:id
 *  @desc       vote a post
 */
 router.route('/vote/:id')
 .post(
   auth,
   check('voteType', 'Votetype should be 1 or -1').isIn([VOTES.UPVOTE, VOTES.DOWNVOTE]),
   answersController.addVote,
 );

module.exports = router;
