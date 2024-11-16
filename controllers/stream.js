const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;
const axios = require('axios');

const GetStreamUrl = async (req, res) => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`;
    const response = await axios.get(url);
    if (response.data.items.length > 0) {
      const liveVideoId = response.data.items[0].id.videoId;
      res.json({ videoId: liveVideoId });
    } else {
      res.json({ videoId: null, message: 'No live stream found' });
    }
  } catch (error) {
    console.error('Error fetching live video:', error);
    res.status(500).send('Error fetching live video');
  }
};

module.exports = {
  GetStreamUrl,
};
