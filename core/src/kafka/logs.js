const { kafkaBroker } = require("./kafka")
const producer = kafkaBroker.producer()
const TOPICS = {
    POST: "postCreate",
    ANSWER: "answerCreate",
    LOGIN: "userLogin"
}

async function produce(topic, message) {
	await producer.connect()
    console.log(`Producing: ${message}`)
    await producer.send({
		topic: topic,
		messages: [{
			value: JSON.stringify(message)
		}]
	})
}

exports.logPostCreate = async (message) => {
    produce(TOPICS.POST, message)
}

exports.logAnswerCreate = async (message) => {
    produce(TOPICS.ANSWER, message)
}

exports.logUserLogin = async (message) => {
    produce(TOPICS.LOGIN, message)
}
