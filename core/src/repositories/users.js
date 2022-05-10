const Sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
var mongoose = require('mongoose');

const constantsHolder = require('../constants');
const {
  responseHandler,
  calcHelper,
  conditionalHelper,
  getJwtToken,
  format,
} = require('../helpers');
const {
  UsersModelSequelize,
  PostsModelSequelize,
  TagsModelSequelize,
  AnswersModelSequelize,
  CommentsModelSequelize,
} = require('../models');
const MongoUser = require('../models/users.mongo');
const { logUserLogin } = require('../kafka/logs');

exports.register = async (newUser, result) => {
  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(newUser.password, salt);
  const gravatar = constantsHolder.GRAVATAR_URL(calcHelper.getRandomInt());
  const mongoId = mongoose.Types.ObjectId()
    .toString();

  await UsersModelSequelize.create({
    username: newUser.username,
    password: newUser.password,
    gravatar: gravatar,
    mongoId: mongoId,
    email: newUser.email,
    location: newUser.location,
    is_admin: newUser.is_admin,
  })
    .then((response) => {
      const payload = {
        user: response,
      };
      logUserLogin(response)

      getJwtToken(payload, 'User registered', result);

      //TODO: Update Email
      MongoUser.create({
        _id: mongoId,
        name: newUser.username,
        email: newUser.email,
        pic: gravatar,
      });
      return payload;
    })
    .catch((error) => {
      console.log(error.message);
      result(responseHandler(false, 500, 'Some error occurred while registering the user in mongo.', null), null);
      return null;
    });
};

exports.login = async (newUser, result) => {
  const user = await UsersModelSequelize.findOne({
    where: {
      username: newUser.username,
    },
  })
    .catch((error) => {
      console.log(error.message);
      result(
        responseHandler(false, 500, 'Some error occurred while logging in the user.', null),
        null,
      );
      return null;
    });

  if (user === null) {
    result(
      responseHandler(
        false,
        404,
        'User does not exists',
        null,
      ),
      null,
    );
    return null;
  }

  const isMatch = await bcrypt.compare(newUser.password, user.password);

  if (!isMatch) {
    result(
      responseHandler(false, 400, 'Incorrect password', null),
      null,
    );

    return null;
  }

  const payload = {
    user: user
  };
  logUserLogin(user)
  getJwtToken(payload, 'User logged in', result);

  return payload;
};

exports.retrieveAll = async (result) => {
  const queryResult = await UsersModelSequelize.findAll({
    distinct: true,
    attributes: [
      'id',
      'username',
      'email',
      'location',
      'is_admin',
      'gravatar',
      'views',
      'created_at',
      [Sequelize.literal('COUNT(DISTINCT(posts.id))'), 'posts_count'],
      [Sequelize.literal('COUNT(DISTINCT(tagname))'), 'tags_count'],
    ],
    include: [
      {
        model: PostsModelSequelize,
        attributes: [],
        include: {
          model: TagsModelSequelize,
          attributes: [],
        },
      },
    ],
    group: ['users.id'],
    order: [[Sequelize.col('posts_count'), 'DESC']],
  })
    .catch((error) => {
      console.log(error);
      return result(responseHandler(false, 500, 'Something went wrong!', null), null);
    });

  const usersMap = queryResult.map((user) => format.sequelizeResponse(
    user,
    'id',
    'username',
    'email',
    'location',
    'is_admin',
    'gravatar',
    'views',
    'created_at',
    'posts_count',
    'tags_count',
  ));

  // if (conditionalHelper.isArrayEmpty(usersMap)) {
  //   return result(responseHandler(false, 404, 'There are no users', null), null);
  // }

  return result(null, responseHandler(true, 200, 'Success', usersMap));
};

exports.retrieveOne = async (id, result) => {
  await UsersModelSequelize.increment('views',
    {
      by: 1,
      where: { id },
    })
    .catch((error) => {
      console.log('error: ', error);
      return result(
        responseHandler(
          false,
          error ? error.statusCode : 404,
          error ? error.message : 'There isn\'t any user by this id',
          null,
        ),
        null,
      );
    });

  let queryResult = await UsersModelSequelize.findOne({
    where: { id },
    attributes: [
      'id',
      'username',
      'email',
      'location',
      'is_admin',
      'gravatar',
      'views',
      'created_at',
      'mongoId',
      [Sequelize.literal('COUNT(DISTINCT(posts.id))'), 'posts_count'],
      [Sequelize.literal('COUNT(DISTINCT(tagname))'), 'tags_count'],
      [Sequelize.literal('COUNT(DISTINCT(answers.id))'), 'answers_count'],
      [Sequelize.literal('COUNT(DISTINCT(comments.id))'), 'comments_count'],
    ],
    include: [
      {
        required: true,
        model: PostsModelSequelize,
        attributes: [],
        include: {
          attributes: [],
          required: true,
          model: TagsModelSequelize,
        },
      },
      {
        attributes: [],
        required: false,
        model: AnswersModelSequelize,
      },
      {
        attributes: [],
        required: false,
        model: CommentsModelSequelize,
      },
    ],
    group: ['users.id'],
  })
    .catch((error) => {
      console.log(error);
      return result(responseHandler(false, 500, 'Something went wrong', null), null);
    });
  if (conditionalHelper.isNull(queryResult)) {
    const data = await UsersModelSequelize.findOne({
      where: { id },
      attributes: [
        'id',
        'username',
        'email',
        'location',
        'is_admin',
        'gravatar',
        'views',
        'created_at',
        'mongoId',
      ],
    })
      .catch((error) => {
        console.log(error);
        return result(responseHandler(false, 500, 'Something went wrong', null), null);
      });
    data.dataValues = {
      posts_count: 0,
      tags_count: 0,
      answers_count: 0,
      comments_count: 0,
      ...data.dataValues,
    };
    queryResult = data;
  }

  queryResult = format.sequelizeResponse(
    queryResult,
    'id',
    'username',
    'email',
    'location',
    'is_admin',
    'gravatar',
    'views',
    'created_at',
    'mongoId',
    'posts_count',
    'tags_count',
    'answers_count',
    'comments_count',
  );

  // get mongo user
  const mongoUser = await MongoUser.findById(queryResult.mongoId )
  const parsedUser = JSON.parse(JSON.stringify(mongoUser))
  queryResult.reputation = parsedUser?.badges?.popular?.count ?? 0
  queryResult.badges = parsedUser?.badges ?? []

  return result(null, responseHandler(true, 200, 'Success', queryResult));
};

exports.loadUser = async (userId, result) => {
  await UsersModelSequelize.findOne({
    where: { id: userId },
    attributes: ['id', 'username', 'email', 'location', 'is_admin', 'gravatar', 'views', 'created_at', 'mongoId'],
  })
    .then((response) => {
      result(null, responseHandler(true, 200, 'Success', response));
    })
    .catch((error) => {
      console.log('error: ', error);
      result(responseHandler(false, error.statusCode, 'User not found', null), null);
    });
};

exports.set_admin = async (username) => {
  const count = await UsersModelSequelize.update({ is_admin: true },
    {
      where: { username },
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
  console.log(count);
  if (count > 0) {
    return 'Successfully Grant admin access.';
  }
  return 'User not found';
};

exports.findMongoID = async (userId) => {
  if(userId == null) {
    return null
  }
  try {
    const mongoId = await UsersModelSequelize.findOne({
      where: { id: userId },
      attributes: ['mongoId'],
    });
    return mongoId.mongoId;
  } catch (e) {
    console.error(e)
    return null;
  }
};

exports.findMongoUser = async (userId) => {
  const mongoId = await this.findMongoID(userId);
  if (mongoId != null) {
    const user = await MongoUser.findById(mongoId);
    return user;
  }
  return null;
};

exports.userTags = async (userId, result) => {
  const queryResult = await PostsModelSequelize.findAll({
    where: {
      '$user_id$': userId,
    },
    distinct: true,
    attributes: [
      'user_id',
      [Sequelize.literal('tags.id'), 'id'],
      [Sequelize.literal('tags.tagname'), 'tagname'],
      [Sequelize.literal('tags.description'), 'description'],
      [Sequelize.literal('tags.created_at'), 'created_at'],
    ],
    include: [
      {
        model: TagsModelSequelize,
        required: true,
        attributes: ['id', 'tagname', 'description', 'created_at'],
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

  const tagsMap = queryResult.map((tag) => format.sequelizeResponse(
    tag,
    'id',
    'tagname',
    'description',
  ));

  result(null, responseHandler(true, 200, 'Success', tagsMap));
};


exports.userAnswers = async (userId, result) => {
  const queryResult = await AnswersModelSequelize.findAll({
    where: {
      '$user_id$': userId,
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

  result(null, responseHandler(true, 200, 'Success', queryResultMap));
};
