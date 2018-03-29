const youtube = require('./client')

async function updateChannelStats() {
  const P110 = await youtube.channelStats()
  console.log(P110.statistics.subscriberCount)
}

updateChannelStats()