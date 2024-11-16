const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID;
const axios = require('axios');
const { google } = require('googleapis');

const CLIENT_ID =
  '483138805363-0acd5b25u82cuq2sqvekoo268ao97oei.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:5173/dashboard/stream';
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl',
];

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

const GetAuth = async (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  res.json(authUrl);
};

const CreateStream = async (req, res) => {
  const youtube = google.youtube('v3');
  const { title, description, scheduledStartTime, access_token } = req.body;


  oAuth2Client.setCredentials({ access_token });
  console.log('OAuth2Client credentials set successfully');
  try {
    // Create a live broadcast
    const broadcastResponse = await youtube.liveBroadcasts.insert({
      auth: oAuth2Client,
      part: 'snippet,contentDetails,status',
      requestBody: {
        snippet: {
          title: title || 'My Live Stream',
          description: description || 'Streaming via API',
          scheduledStartTime,
        },
        status: {
          privacyStatus: 'public',
        },
        contentDetails: {
          monitorStream: {
            enableMonitorStream: true,
          },
        },
      },
    });

    // Create a live stream
    const streamResponse = await youtube.liveStreams.insert({
      auth: oAuth2Client,
      part: 'snippet,cdn,contentDetails,status',
      requestBody: {
        snippet: {
          title: title || 'My Live Stream',
        },
        cdn: {
          frameRate: '30fps',
          ingestionType: 'rtmp',
          resolution: '720p',
        },
      },
    });

    // Bind the live stream to the broadcast
    await youtube.liveBroadcasts.bind({
      auth: oAuth2Client,
      part: 'id,contentDetails',
      id: broadcastResponse.data.id,
      requestBody: {
        streamId: streamResponse.data.id,
      },
    });

    res.json({
      broadcastId: broadcastResponse.data.id,
      streamId: streamResponse.data.id,
      ingestionAddress: streamResponse.data.cdn.ingestionInfo.ingestionAddress,
      streamKey: streamResponse.data.cdn.ingestionInfo.streamName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  GetStreamUrl,
  GetAuth,
  CreateStream,
};
