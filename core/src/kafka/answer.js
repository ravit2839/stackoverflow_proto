const { kafkaBroker } = require("./kafka")
const { findMongoID, findMongoUser } = require("../repositories/users")
const { PostsModelSequelize, AnswersModelSequelize } = require('../models');
const MongoUser = require("../models/users.mongo");
const { BADGES, VOTES } = require("../constants");
const { create_or_update_badge } = require("./helper");

const producer = kafkaBroker.producer()
const topic = "answer"

const keys = {
	create: "create",
	vote: "vote",
	best_ans: "best_ans"
}

function parsePost(answer) {
	return {
		answerId: answer.answer_id,
		userId: answer.user_id
	}
}


async function produce(answer, key) {
	await producer.connect()
	await producer.send({
		topic: topic,
		messages: [{
			key: key,
			value: answer
		}]
	})
}

const answerPost = async (answer) => {
    produce(JSON.stringify(parsePost(answer)), keys.create)
}

const voteAnswer = async (answer) => {
	const parsed = parsePost(answer)
	parsed['voteType'] = answer.voteType
	parsed['authUser'] = answer.authUser
	parsed['prevVote'] = answer.prevVote
	produce(JSON.stringify(parsed), keys.vote)
}

const chooseBestAnswer = async (oldId, newId) => {
	const parsed = {
		oldId: oldId,
		newId: newId
	}
	produce(JSON.stringify(parsed), keys.best_ans)
}
const consumer = kafkaBroker.consumer({
	groupId: topic
})
async function getAnswerOwner(answerId) {
	if(answerId == null) {
		return null
	}
	try {
		const answer = await AnswersModelSequelize.findOne({
			where: { id: answerId },
			attributes: [
				'user_id'
			]
		})
		return answer?.get('user_id') ?? null
	} catch(e) {
		console.log(`Couldn't find owner of answer id=${answerId}`)
		return null
	}
}


const main = async () => {
	await producer.connect()
	await consumer.connect()
	await consumer.subscribe({
	  topic: topic,
	//   fromBeginning: true
	})
	console.log("Answer producer-consumer connected")
	await consumer.run({
	  eachMessage: async ({ topic, partition, message }) => {
		const answer = JSON.parse(message.value.toString())
		if(answer.userId != null) {
			var mongoId = await findMongoID(answer.userId)
			if(mongoId == null) {
				console.log(`Answer Consumer: Could not find Mongo user of id=${answer.postUserId}`)
				return
			}
		}
		switch(message.key.toString()){
			case keys.create:
				create_or_update_badge(mongoId, "helpfulness", 2, 5, 1)
				break
			case keys.vote:
				// authUser
				var authMongoId = await findMongoID(answer.authUser)
				if(authMongoId == null) {
					console.log(`Answer Consumer: Could not find Mongo user of id=${answer.authUser}`)
					return
				}
				if(answer.prevVote == VOTES.UPVOTE) {
					create_or_update_badge(authMongoId, "sportsmanship", 2, 5, -1)
					create_or_update_badge(mongoId, "popular", 10, 15, -5, false)

				} else if(answer.prevVote == VOTES.DOWNVOTE){
					create_or_update_badge(authMongoId, "critic", 2, 5, -1)
					create_or_update_badge(mongoId, "popular", 10, 15, 5, false)
				}
				if(answer.voteType == VOTES.UPVOTE) {
					create_or_update_badge(authMongoId, "sportsmanship", 2, 5, 1)
					create_or_update_badge(mongoId, "popular", 10, 15, 5, false)

				} else if(answer.voteType == VOTES.DOWNVOTE){
					create_or_update_badge(authMongoId, "critic", 2, 5, 1)
					create_or_update_badge(mongoId, "popular", 10, 15, -5, false)
				}
				break
			case keys.best_ans:
				const oldUser = await getAnswerOwner(answer.oldId)
				const newUser = await getAnswerOwner(answer.newId)
				const oldUserMongoId = await findMongoID(oldUser)
				const newUserMongoId = await findMongoID(newUser)
				if(oldUserMongoId != null) {
					create_or_update_badge(oldUserMongoId, "popular", 10, 15, -15, false)
				}
				if(newUserMongoId != null) {
					create_or_update_badge(newUserMongoId, "popular", 10, 15, 15, false)
				}
		}
	  }
	})
  }

  main().catch(async error => {
	console.error(error)
	try {
	  await consumer.disconnect()
	} catch (e) {
	  console.error('Failed to gracefully disconnect answer consumer', e)
	}
	process.exit(1)
  })

module.exports = { answerPost, voteAnswer, chooseBestAnswer }
