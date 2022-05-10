const { answersRepository } = require('../repositories');

exports.create = (newAnswer, result) => answersRepository.create(newAnswer, result);

exports.remove = (id, result) => answersRepository.remove(id, result);

exports.retrieveAll = (postId, result) => answersRepository.retrieveAll(postId, result);

exports.addVote = (vote, result) => answersRepository.addVote(vote, result);