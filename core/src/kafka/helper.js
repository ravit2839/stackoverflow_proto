const { BADGES } = require("../constants")
const MongoUser = require("../models/users.mongo")

async function create_or_update_badge(mongoId, tag, l, r, inc, deleteOnZero = true) {
	var query = {}
	query[`badges.${tag}.count`] = inc
	MongoUser.findByIdAndUpdate(mongoId, {$inc: query}, {new: true}, (error, user) => {
		if(error || user == null) {
			console.log(`Couldn't update answers count for mongoId=${mongoId}`)
		}
		const setBadge = {}
		const currentTag = user.badges?.get(tag)
		const currentBadge = currentTag?.badgeType
		const count = user.badges.get(tag).count
		if(count >= 1 && count <= l && currentBadge != BADGES.BRONZE) {
			setBadge[`badges.${tag}.badgeType`] = BADGES.BRONZE
		} else if(l < count && count < r && currentBadge != BADGES.SILVER) {
			setBadge[`badges.${tag}.badgeType`] = BADGES.SILVER
		} else if(count >= r && currentBadge != BADGES.GOLD) {
			setBadge[`badges.${tag}.badgeType`] = BADGES.GOLD
		} else if(count <= 0) {
			const q = {}
			if(deleteOnZero) {
				q[`badges.${tag}`] = 1
			} else {
				q[`badges.${tag}.badgeType`] = 1
			}
			MongoUser.findByIdAndUpdate(mongoId, {$unset: q}, (error, user)=>{
				if(error != null) {
					console.log(`Couldn't delete ${tag} badgeType for mongoId=${mongoId}, badges=${setBadge}`)
				}
			});

		}
		if(Object.keys(setBadge).length > 0) {
			MongoUser.findByIdAndUpdate(mongoId, {$set: setBadge}, {upsert: true, new: true}, (error, user) => {
				if(error != null) {
					console.log(`Couldn't update ${tag} badgeType for mongoId=${mongoId}, badges=${setBadge}`)
				}
			})
		}
	})
}
module.exports = { create_or_update_badge }
