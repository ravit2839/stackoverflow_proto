const Sequelize = require('sequelize');

const {
  responseHandler,
} = require('../helpers');
const {
  UsersModelSequelize,
} = require('../models');
const sequelize = require('../config/db.config');
const mongo = require('../config/db.mongo');
const MongoUser = require('../models/users.mongo');
const { getOrSetCache } = require('../cache/cache');

exports.questionPerDay = async (result) => {
  const data = await getOrSetCache('questionPerDay', async () => {
    const [queryResult, metadata] = await sequelize.query('SELECT DATE(created_at) Date, '
      + 'COUNT(id) Total FROM posts GROUP BY DATE(created_at) ORDER BY DATE(created_at) DESC LIMIT 7;');
    return queryResult;
  }).catch();
  result(null, responseHandler(true, 200, 'valid', data));
};

exports.popularQuestion = async (result) => {
  const data = await getOrSetCache('popularQuestion', async () => {
    const [queryResult, metadata] = await sequelize.query('SELECT * FROM posts '
      + 'ORDER BY views DESC LIMIT 10;');
    return queryResult;
  });
  result(null, responseHandler(true, 200, 'valid', data));
};

exports.popularTag = async (result) => {
  const data = getOrSetCache('popularTag', async () => {
    const [tagIDResult, metadata1] = await sequelize.query('SELECT tag_id, count(*) as count FROM '
      + 'posttag group by tag_id ORDER BY count DESC LIMIT 10');
    // eslint-disable-next-line camelcase
    const tagIDs = `("${tagIDResult.map(({ tag_id }) => tag_id)
      .join('","')}")`;
    const [tags, metadata2] = await sequelize.query(`SELECT * FROM tags WHERE id in ${tagIDs}`);
    return tags;
  });
  result(null, responseHandler(true, 200, 'valid', data));
};

exports.highestReputation = async (result) => {
  const data = await getOrSetCache('highestReputation', async () => {
    const userIDResults = await MongoUser.find().sort({ 'badges.popular.count': -1 }).limit(10).exec();
    const userIDs = `("${userIDResults.map(({ name }) => name)
      .join('","')}")`;
    const [users, metadata2] = await sequelize.query(`SELECT * FROM users WHERE username in ${userIDs}`);
    return users;
  });
  result(null, responseHandler(true, 200, 'valid', data));
};

exports.lowestReputation = async (result) => {
  const data = await getOrSetCache('lowestReputation', async () => {
    const userIDResults = await MongoUser.find().sort({ 'badges.popular.count': 1 }).limit(10).exec();
    const userIDs = `("${userIDResults.map(({ name }) => name)
      .join('","')}")`;
    const [users, metadata2] = await sequelize.query(`SELECT * FROM users WHERE username in ${userIDs}`);
    return users;
  });
  result(null, responseHandler(true, 200, 'valid', data));
};
