const { User, UsersModelSequelize } = require('./users');
const { Post, PostsModelSequelize } = require('./posts');
const { Tag, TagsModelSequelize } = require('./tags');
const { PostTagModelSequelize } = require('./posttag');
const { Answer, AnswersModelSequelize } = require('./answers');
const { Comment, CommentsModelSequelize } = require('./comments');
const { VoteModelSequelize } = require('./vote');

UsersModelSequelize.hasMany(PostsModelSequelize, {
  foreignKey: { name: 'user_id', allowNull: false },
});
PostsModelSequelize.belongsTo(UsersModelSequelize);

UsersModelSequelize.hasMany(CommentsModelSequelize, {
  foreignKey: { name: 'user_id', allowNull: false },
});
CommentsModelSequelize.belongsTo(UsersModelSequelize);

UsersModelSequelize.hasMany(AnswersModelSequelize, {
  foreignKey: { name: 'user_id', allowNull: false },
});
AnswersModelSequelize.belongsTo(UsersModelSequelize);

PostsModelSequelize.hasMany(CommentsModelSequelize, {
  foreignKey: { name: 'post_id', allowNull: false },
});
CommentsModelSequelize.belongsTo(PostsModelSequelize);

PostsModelSequelize.hasMany(AnswersModelSequelize, {
  foreignKey: { name: 'post_id', allowNull: false },
});
AnswersModelSequelize.belongsTo(PostsModelSequelize);

PostsModelSequelize.belongsToMany(TagsModelSequelize, { through: PostTagModelSequelize, foreignKey: { name: 'post_id', allowNull: false } });
TagsModelSequelize.belongsToMany(PostsModelSequelize, { through: PostTagModelSequelize, foreignKey: { name: 'tag_id', allowNull: false } });

PostsModelSequelize.hasMany(VoteModelSequelize, {
  foreignKey: { name: 'post_id', allowNull: true },
});
VoteModelSequelize.belongsTo(PostsModelSequelize)

AnswersModelSequelize.hasMany(VoteModelSequelize, {
  foreignKey: { name: 'answer_id', allowNull: true },
});
VoteModelSequelize.belongsTo(AnswersModelSequelize)

module.exports = {
  User,
  Post,
  Answer,
  Comment,
  Tag,
  UsersModelSequelize,
  PostsModelSequelize,
  TagsModelSequelize,
  PostTagModelSequelize,
  AnswersModelSequelize,
  CommentsModelSequelize
};
