const { usersRepository } = require('../repositories');

exports.register = (newUser, result) => usersRepository.register(newUser, result);

exports.login = async (newUser, result) => usersRepository.login(newUser, result);

exports.retrieveAll = (result) => usersRepository.retrieveAll(result);
exports.retrieveOne = (id, result) => usersRepository.retrieveOne(id, result);

exports.loadUser = (userId, result) => usersRepository.loadUser(userId, result);
exports.userTags = (userId, result) => usersRepository.userTags(userId, result);
exports.userAnswers = (userId, result) => usersRepository.userAnswers(userId, result);
