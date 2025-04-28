const NotificationTokenSchema = require('../model/notificationToken');
const admin = require('../middleware/firebaseAdmin');

const SendNotification = async ({ searchObject, title, body }) => {
  try {
    const userToken = await NotificationTokenSchema.find(searchObject);

    const tokens = userToken.map((doc) => doc.token);
    const message = {
      notification: {
        title,
        body,
      },
      tokens,
    };

    if (tokens && tokens.length > 0) {
      admin
        .messaging()
        .send(message)
        .then((response) => {
          console.log(
            response.successCount + ' messages were sent successfully'
          );
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });
    } else {
      console.log('No tokens provided.');
    }
    console.log(response.successCount + ' messages were sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

module.exports = SendNotification;
