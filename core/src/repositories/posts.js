const { Sequelize } = require('sequelize');
const sequelize = require('../config/db.config');
const db = require('../config/db.config');
const {
  responseHandler,
  conditionalHelper,
  investApi,
  format,
} = require('../helpers');
const { chooseBestAnswer } = require('../kafka/answer');
const { logPostCreate } = require('../kafka/logs');
const { viewPost, kafkaCreatePost, votePost } = require('../kafka/question');
const {
  PostsModelSequelize,
  PostTagModelSequelize,
  TagsModelSequelize,
  AnswersModelSequelize,
  CommentsModelSequelize,
  UsersModelSequelize,
} = require('../models');
const { VoteModelSequelize } = require('../models/vote');

exports.create = async (newPost, result) => {
  let transaction;
  try {
    transaction = await db.transaction();

    const tags = newPost.tagName.split(',')
      .map((item) => item.trim());

    if (tags.length > 5) {
      return result(responseHandler(false, 400, 'Only Tags Upto 5 Are Allowed', null), null);
    }

    const post = await PostsModelSequelize.create({
      title: newPost.title,
      body: newPost.body,
      images: newPost.images,
      status: newPost.status,
      user_id: newPost.userId,
    })
      .catch((error) => {
        console.log(error);
        result(responseHandler(false, 500, 'Something went wrong', null), null);
        return null;
      });

    const mapAllTags = [];
    const mapAllTagsWithoutDesc = [];
    let mapNewTags = [];

    for (const item of tags) {
      const tag = await TagsModelSequelize.findOne({
        where: {
          tagname: item,
        },
      })
        .catch((error) => {
          console.log(error);
          result(responseHandler(false, 500, 'Something went wrong', null), null);
          return null;
        });

      if (!conditionalHelper.isNull(tag)) {
        mapAllTags.push({
          post_id: post.id,
          tag_id: tag.id,
        });
      } else {
        mapAllTagsWithoutDesc.push(item);
      }
    }

    /**
     * prepare a string of tags with ";" as delimeter
     * for eg:- [java, javascript] will become "java;javascript"
     */
    const mapAllTagsWithoutDescString = mapAllTagsWithoutDesc.join(';');

    const resp = await investApi.fetchTagDesc(mapAllTagsWithoutDescString);
    mapNewTags = investApi.prepareTags(mapAllTagsWithoutDesc, resp);

    const newCreatedTags = await TagsModelSequelize.bulkCreate(mapNewTags)
      .catch((error) => {
        console.log(error);
        result(responseHandler(false, 500, 'Something went wrong', null), null);
        return null;
      });

    for (const tag of newCreatedTags) {
      mapAllTags.push({
        post_id: post.id,
        tag_id: tag.id,
      });
    }

    await PostTagModelSequelize.bulkCreate(mapAllTags)
      .catch((error) => {
        console.log(error);
        result(responseHandler(false, 500, 'Something went wrong', null), null);
        return null;
      });
    kafkaCreatePost(post);
    logPostCreate(post)
    result(null, responseHandler(true, 200, 'Post Created', post.id));

    await transaction.commit();
  } catch (error) {
    console.log(error);
    result(responseHandler(false, 500, 'Something went wrong', null), null);
    if (transaction) {
      await transaction.rollback();
    }
  }
};

exports.remove = async (id, result) => {
  let transaction;

  try {
    transaction = await db.transaction();

    await PostTagModelSequelize.destroy({ where: { post_id: id } });

    await AnswersModelSequelize.destroy({ where: { post_id: id } });

    await CommentsModelSequelize.destroy({ where: { post_id: id } });

    await PostsModelSequelize.destroy({ where: { id } });

    result(
      null,
      responseHandler(true, 200, 'Post Removed', null),
    );

    await transaction.commit();
  } catch (error) {
    console.log(error);
    result(responseHandler(false, 500, 'Something went wrong', null), null);
    if (transaction) {
      await transaction.rollback();
    }
  }
};

exports.retrieveOne = async (ids, result) => {
  postId = ids.postId
  userId = ids.userId
  let queryResult = await PostsModelSequelize.findOne({
    distinct: true,
    where: {
      id: postId,
    },
    attributes: [
      'id',
      'user_id',
      [Sequelize.literal('user.gravatar'), 'gravatar'],
      [Sequelize.literal('user.username'), 'username'],
      'best_answer',
      'title',
      ['body', 'post_body'],
      'images',
      'status',
      'created_at',
      'updated_at',
      'views',
    ],
    include: [
      {
        model: TagsModelSequelize,
        required: true,
        attributes: ['id', 'tagname'],
      },
      {
        model: UsersModelSequelize,
        required: true,
        attributes: [],
      },
    ],
  })
    .catch((error) => {
      console.log(error);
      return result(responseHandler(false, 500, 'Something went wrong!', null), null);
    });

  const answersCount = await PostsModelSequelize.count({
    where: {
      id: postId,
    },
    include: {
      model: AnswersModelSequelize,
      required: true,
      attributes: [],
    },
  })
    .catch((error) => {
      console.log(error);
      return result(responseHandler(false, 500, 'Something went wrong!', null), null);
    });

  const commentsCount = await PostsModelSequelize.count({
    where: {
      id: postId,
    },
    include: {
      model: CommentsModelSequelize,
      required: true,
      attributes: [],
    },
  })
    .catch((error) => {
      console.log(error);
      return result(responseHandler(false, 500, 'Something went wrong!', null), null);
    });

  if (conditionalHelper.isNull(queryResult)) {
    return result(responseHandler(false, 404, 'There isn\'t any post by this id', null), null);
  }

  queryResult = format.sequelizeResponse(
    queryResult,
    'id',
    'user_id',
    'gravatar',
    'username',
    'title',
    'post_body',
    'images',
    'status',
    'created_at',
    'updated_at',
    'views',
    'tags',
    'best_answer',
  );

  const votes = await VoteModelSequelize.findAll({
    where: {
      post_id: postId
    },
    attributes: [
      [sequelize.fn('sum', sequelize.col('vote_type')), 'total_vote'],
    ]
  }).catch((error) => {
    console.log(error);
    return result(responseHandler(false, 500, 'Something went wrong!', null), null);
  });
  const response = {
    answer_count: answersCount,
    comment_count: commentsCount,
    votes: votes[0]?.get('total_vote') ?? '0',
    ...queryResult,
  };
  if(userId != null) {
    const currentUserVote = await VoteModelSequelize.findOne(
      {
        where: {
          user_id: userId,
          post_id: postId,
        },
        attributes: [
          'voteType'
        ]
      }
    ).catch((error) => {
      console.log(error);
      return result(responseHandler(false, 500, 'Something went wrong!', null), null);
    });
    response['currentUserVote'] = currentUserVote?.get('voteType') ?? null
  }



  viewPost(response);
  return result(null, responseHandler(true, 200, 'Success', response));
};

exports.retrieveAll = async (result) => {
  const posts = await PostsModelSequelize.findAll({
    distinct: true,
    attributes: [
      'id',
      'user_id',
      'views',
      [Sequelize.literal('user.username'), 'username'],
      [Sequelize.literal('user.gravatar'), 'gravatar'],
      'images',
      'status',
      'best_answer',
      'created_at',
      'updated_at',
      'title',
      'body',
    ],
    include: [
      {
        model: TagsModelSequelize,
        required: true,
        attributes: ['id', 'tagname'],
      },
      {
        model: UsersModelSequelize,
        required: true,
        attributes: [],
      },
    ],
    order: [['created_at', 'DESC']],
  })
    .catch((error) => {
      console.log(error);
      return result(responseHandler(false, 500, 'Something went wrong!', null), null);
    });

  const postCounts = await PostsModelSequelize.findAll({
    distinct: true,
    attributes: [
      'id',
      [Sequelize.literal('COUNT(DISTINCT(answers.id))'), 'answer_count'],
      [Sequelize.literal('COUNT(DISTINCT(comments.id))'), 'comment_count'],
    ],
    include: [
      {
        model: AnswersModelSequelize,
        required: false,
        attributes: [],
      },
      {
        model: CommentsModelSequelize,
        required: false,
        attributes: [],
      },
    ],
    group: ['id'],
    order: [['created_at', 'DESC']],
  })
    .catch((error) => {
      console.log(error);
      return result(responseHandler(false, 500, 'Something went wrong!', null), null);
    });

  const postsMap = posts.map((post) => format.sequelizeResponse(
    post,
    'id',
    'user_id',
    'views',
    'title',
    'images',
    'status',
    'body',
    'tags',
    'username',
    'gravatar',
    'best_answer',
    'created_at',
    'updated_at',
  ));

  // if (conditionalHelper.isArrayEmpty(postsMap)) {
  //   return result(responseHandler(false, 404, 'There are no posts', null), null);
  // }

  const postCountsMap = postCounts.map((post) => format.sequelizeResponse(post, 'id', 'answer_count', 'comment_count'));

  const response = format.mergeById(postsMap, postCountsMap);

  return result(null, responseHandler(true, 200, 'Success', response));
};

exports.retrieveAllTag = async (tagName, result) => {
  const posts = await PostsModelSequelize.findAll({
    where: {
      '$tags.tagname$': tagName,
    },
    distinct: true,
    attributes: [
      'id',
      'user_id',
      'views',
      [Sequelize.literal('user.username'), 'username'],
      [Sequelize.literal('user.gravatar'), 'gravatar'],
      'best_answer',
      'created_at',
      'updated_at',
      'title',
      'body',
    ],
    include: [
      {
        model: TagsModelSequelize,
        required: true,
        attributes: ['id', 'tagname'],
      },
      {
        model: UsersModelSequelize,
        required: true,
        attributes: [],
      },
    ],
    order: [['created_at', 'DESC']],
  })
    .catch((error) => {
      console.log(error);
      return result(responseHandler(false, 500, 'Something went wrong!', null), null);
    });

  const postCounts = await PostsModelSequelize.findAll({
    distinct: true,
    where: {
      '$tags.tagname$': tagName,
    },
    attributes: [
      'id',
      [Sequelize.literal('COUNT(DISTINCT(answers.id))'), 'answer_count'],
      [Sequelize.literal('COUNT(DISTINCT(comments.id))'), 'comment_count'],
    ],
    include: [
      {
        model: TagsModelSequelize,
        required: true,
        attributes: [],
      },
      {
        model: AnswersModelSequelize,
        required: false,
        attributes: [],
      },
      {
        model: CommentsModelSequelize,
        required: false,
        attributes: [],
      },
    ],
    group: ['id'],
    order: [['created_at', 'DESC']],
  })
    .catch((error) => {
      console.log(error);
      return result(responseHandler(false, 500, 'Something went wrong!', null), null);
    });

  // if (conditionalHelper.isArrayEmpty(posts)) {
  //   return result(responseHandler(false, 404, 'There are no posts', null), null);
  // }

  const postsMap = posts.map((post) => format.sequelizeResponse(
    post,
    'id',
    'user_id',
    'views',
    'title',
    'body',
    'tags',
    'images',
    'status',
    'username',
    'gravatar',
    'created_at',
    'updated_at',
    'best_answer',
  ));

  const postCountsMap = postCounts.map((post) => format.sequelizeResponse(post, 'id', 'answer_count', 'comment_count'));

  const response = format.mergeById(postsMap, postCountsMap);

  return result(null, responseHandler(true, 200, 'Success', response));
};

exports.addVote = async (vote, result) => {
  const entry = await VoteModelSequelize.findOne({
    where: {
      user_id : vote.userId,
      post_id : vote.postId,
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
      post_id : vote.postId,
    }).catch((error) => {
      console.log(error);
      return result(responseHandler(false, 500, 'Something went wrong while adding new vote!', null), null);
    });
  } else if(entry.voteType != vote.voteType){
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

  this.retrieveOne({postId: vote.postId}, (err, data) => {
    if(err != null) {
      return
    }
    votePost(data.data, vote.userId, vote.voteType, entry?.voteType ?? null)
  })
  return result(null, responseHandler(true, 200, 'Success', null));

}
exports.patch = async (id, partialPost, result) => {
  await PostsModelSequelize.update(partialPost,
    {
      where: { id },
    })
    .catch((error) => {
      console.log(error);
      result(responseHandler(false, 500, 'Something went wrong', null), null);
      return null;
    });

  result(null, responseHandler(true, 200, 'Post Updated', null));
};

exports.bestAnswer = async (id, answerId, result) => {
  try {

    const oldPost = await PostsModelSequelize.findOne({
      where: {
        id: id
      },
      attributes: [
        'best_answer'
      ]
    })
    await PostsModelSequelize.update(
      {
        best_answer: answerId,
      },
      { where: { id } },
    );
    chooseBestAnswer(oldPost.get('best_answer'), answerId)
    result(
      null,
      responseHandler(true, 200, 'Accepted answer', null),
    );
  } catch (error) {
    console.log(error);
    result(responseHandler(false, 500, 'Something went wrong', null), null);
  }
};
