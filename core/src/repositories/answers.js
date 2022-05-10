const Sequelize = require('sequelize');
const sequelize = require('../config/db.config');
const { responseHandler, conditionalHelper, format } = require('../helpers');
const { answerPost, voteAnswer } = require('../kafka/answer');
const { logAnswerCreate } = require('../kafka/logs');
const { UsersModelSequelize, AnswersModelSequelize } = require('../models');
const { VoteModelSequelize } = require('../models/vote');

exports.create = async (newAnswer, result) => {
  await AnswersModelSequelize.create({
    body: newAnswer.body,
    user_id: newAnswer.userId,
    post_id: newAnswer.postId,
  })
    .then((response) => {
      answerPost(response)
      logAnswerCreate(response)
      result(
        null,
        responseHandler(true, 200, 'Answer Added', response.id),
      );
    })
    .catch((error) => {
      console.log(error);
      result(responseHandler(false, 500, 'Some error occurred while adding the answer.', null), null);
    });
};

exports.remove = async (id, result) => {
  await AnswersModelSequelize.destroy({
    where: { id },
  })
    .then(() => {
      result(null, responseHandler(true, 200, 'Answer Removed', null));
    })
    .catch((error) => {
      console.log(error.message);
      result(responseHandler(false, 404, 'This answer doesn\'t exists', null), null);
    });
};

exports.retrieveAll = async (ids, result) => {
  const postId = ids.postId
  const userId = ids.userId
  const queryResult = await AnswersModelSequelize.findAll({
    where: {
      post_id: postId,
    },
    attributes: [
      'id',
      'user_id',
      'post_id',
      'body',
      'created_at',
      [Sequelize.literal('user.username'), 'username'],
      [Sequelize.literal('user.gravatar'), 'gravatar'],
    ],
    include: {
      model: UsersModelSequelize,
      attributes: [],
    },
  }).catch((error) => {
    console.log(error);
    return result(responseHandler(false, 500, 'Something went wrong!', null), null);
  });

  const queryResultMap = queryResult.map((answer) => format.sequelizeResponse(
    answer,
    'id',
    'user_id',
    'post_id',
    'body',
    'created_at',
    'username',
    'gravatar',
  ));

  for(const answer of queryResultMap) {
    const votes = await VoteModelSequelize.findAll({
      where: {
        answer_id: answer.id
      },
      attributes: [
        [sequelize.fn('sum', sequelize.col('vote_type')), 'total_vote'],
      ]
    }).catch((error) => {
      console.log(error);
      return result(responseHandler(false, 500, 'Something went wrong!', null), null);
    });
    answer['votes'] = votes[0]?.get('total_vote') ?? '0'
    if(userId != null) {
      const currentUserVote = await VoteModelSequelize.findOne(
        {
          where: {
            user_id: userId,
            answer_id: answer.id,
          },
          attributes: [
            'voteType'
          ]
        }
      ).catch((error) => {
        console.log(error);
        return result(responseHandler(false, 500, 'Something went wrong!', null), null);
      });
      answer['currentUserVote'] = currentUserVote?.get('voteType')
    }

  };
  return result(null, responseHandler(true, 200, 'Success', queryResultMap));
};

exports.addVote = async (vote, result) => {
  const entry = await VoteModelSequelize.findOne({
    where: {
      user_id : vote.userId,
      answer_id : vote.answerId,
    },
    attributes: [
      'id',
      'voteType'
    ]
  }).catch((error) => {
    console.log(error);
    return result(responseHandler(false, 500, 'Something went wrong!', null), null);
  });
  if(entry == null) {
    await VoteModelSequelize.create({
      voteType : vote.voteType,
      user_id : vote.userId,
      answer_id : vote.answerId,
    }).catch((error) => {
      console.log(error);
      return result(responseHandler(false, 500, 'Something went wrong while adding new vote!', null), null);
    });
  } else if(entry.voteType != vote.voteType) {
    await VoteModelSequelize.update({
      voteType : vote.voteType,
    }, {
      where: {
        id: entry.id
      }
    })



  } else {
    return result(null, responseHandler(true, 200, "Already Voted", null))
  }
  const answer = await AnswersModelSequelize.findOne({
    where: {
      id: vote.answerId
    }, attributes: [
      'user_id',
    ]
  }).catch((error) => {
    console.log(error);
    return result(responseHandler(false, 500, 'Something went wrong!', null), null);
  });
  if(answer != null) {
    voteAnswer({
      authUser: vote.userId,
      answer_id: vote.answerId,
      voteType: vote.voteType,
      user_id: answer.get('user_id'),
      prevVote: entry?.voteType ?? null
    })
  }
  return result(null, responseHandler(true, 200, 'Success', null));
}
