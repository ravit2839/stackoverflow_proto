const { kafkaBroker, clientId } = require("./kafka")
const { findMongoID, findMongoUser } = require("../repositories/users")
const { PostsModelSequelize } = require('../models');
const MongoUser = require("../models/users.mongo");
const { BADGES, VOTES } = require("../constants");
const { create_or_update_badge } = require("./helper");

const producer = kafkaBroker.producer()
const topic = "post"

const keys = {
	create: "create",
	view: "view",
	vote: "vote",
}

function parsePost(post) {
	return {
		postId: post.id,
		postUserId: post.user_id,
		tags: post.tags?.map((t) => (t.tagname)) ?? [],
	}
}


async function produce(post, key) {
	await producer.connect()
	console.log("producing: "+key.toString())
	producer.send({
		topic: topic,
		messages: [{
			key: key,
			value: JSON.stringify(post)
		}]
	})
}

const kafkaCreatePost = async (post) => {
	produce(parsePost(post), keys.create)
}
const viewPost = async (post) => {
	produce(parsePost(post), keys.view)
}

/**
 *
 * @param post
 * @param vote - poddible values(1/-1)
 */
const votePost = async (post, authUser, voteType, prevVote) => {
	post = parsePost(post)
	post.voteType = voteType
	post.authUser = authUser
	post.prevVote = prevVote
	produce(post, keys.vote)
}

const consumer = kafkaBroker.consumer({
	groupId: topic
})

const main = async () => {
	await producer.connect()
	await consumer.connect()
	await consumer.subscribe({
	  topic: topic,
	//   fromBeginning: true
	})
	console.log("Question producer-consumer connected")
	await consumer.run({
	  eachMessage: async ({ topic, partition, message }) => {
		const post = JSON.parse(message.value.toString())
		var mongoId = await findMongoID(post.postUserId)
		if(mongoId == null) {
			console.log(`Question Consumer: Could not find Mongo user of id=${post.postUserId}`)
			return
		}
		switch(message.key.toString()){
			case keys.create:
				create_or_update_badge(mongoId, "curious", 2, 5, 1)
				break
			case keys.view:
					PostsModelSequelize.increment('views',{
						by: 1,
						where: { id: post.postId },
						returning: true
					}).then(async _ => {
						PostsModelSequelize.findOne({
							distinct: true,
							where: {
							  id: post.postId,
							},
							attributes: ['views'],
					}).then(post => {
						var query = {}
						if(post.views == 5) {
							query["badges.notable.badgeType"] = BADGES.GOLD
						} else if(post.views == 15) {
							query["badges.famous.badgeType"] = BADGES.GOLD
						}
						if(Object.keys(query).length > 0) {
							MongoUser.findByIdAndUpdate(mongoId, {$set: query}, {upsert: true, new: true}, (error, user) => {
								if(error != null) {
									console.log(`Question Consumer: couldn't update badgeType for mongoId=${mongoId}, badges=${setBadge}`)
								}
							})
						}
					}
					).catch(error => {
						console.log(`Error in getting post view count: ${error}`)
					})
				}).catch(error => {
					console.log(`Error in updating post view count: ${error}`)
				})
				break
			case keys.vote:
				for(const tag of post.tags) {
					create_or_update_badge(mongoId, tag, 10, 20, post.voteType)
				}
				var authMongoId = await findMongoID(post.authUser)
				if(authMongoId == null) {
					console.log(`Question Consumer: Could not find Mongo user of id=${post.authUser}`)
					return
				}
				if(post.prevVote == VOTES.UPVOTE) {
					await create_or_update_badge(authMongoId, "sportsmanship", 2, 5, -1)
					await create_or_update_badge(mongoId, "popular", 10, 15, -10, false)
				} else if(post.prevVote == VOTES.DOWNVOTE){
					await create_or_update_badge(authMongoId, "critic", 2, 5, -1)
					await create_or_update_badge(mongoId, "popular", 10, 15, 10, false)
				}
				if(post.voteType == VOTES.UPVOTE) {
					await create_or_update_badge(authMongoId, "sportsmanship", 2, 5, 1)
					await create_or_update_badge(mongoId, "popular", 10, 15, 10, false)
				} else if(post.voteType == VOTES.DOWNVOTE){
					await create_or_update_badge(authMongoId, "critic", 2, 5, 1)
					await create_or_update_badge(mongoId, "popular", 10, 15, -10, false)
				}
				break
		}
	  }
	})
  }

  main().catch(async error => {
	console.error(error)
	try {
	  await consumer.disconnect()
	} catch (e) {
	  console.error('Failed to gracefully disconnect question consumer', e)
	}
	process.exit(1)
  })

module.exports = { viewPost, votePost, kafkaCreatePost }
