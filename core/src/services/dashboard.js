const { dashboardRepository } = require('../repositories');

exports.questionPerDay = (result) => dashboardRepository.questionPerDay(result);
exports.popularQuestion = (result) => dashboardRepository.popularQuestion(result);
exports.popularTag = (result) => dashboardRepository.popularTag(result);
exports.highestReputation = (result) => dashboardRepository.highestReputation(result);
exports.lowestReputation = (result) => dashboardRepository.lowestReputation(result);
