const { DataTypes } = require('sequelize');
const db = require('../config/db.config');
const { VOTES } = require('../constants');

const Vote = function (vote) {
    this.voteType = vote.voteType;
    this.userId = vote.userId;
    this.postId = vote.postId;
    this.answerId = vote.answerId;
};


const VoteModelSequelize = db.define('vote', {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  voteType: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  db,
  tableName: 'vote',
  underscored: true,
  timestamps: false,
  indexes: [
    {
      name: 'PRIMARY',
      unique: true,
      using: 'BTREE',
      fields: [
        { name: 'id' },
      ],
    },
    {
      name: 'post_id',
      using: 'BTREE',
      fields: [
        { name: 'post_id' },
        // { name: 'user_id' }

        
      ],
    },
    {
      name: 'answer_id',
      using: 'BTREE',
      fields: [
        { name: 'answer_id' },
        // { name: 'user_id' }
      ],
    }
  ],
});

module.exports = { Vote, VoteModelSequelize };
