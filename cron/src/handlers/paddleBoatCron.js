const axios = require('axios').default;
/**
 * A Lambda function that logs the payload received from a CloudWatch scheduled event.
 */
exports.paddleBoatCronHandler = async (event) => {
    try {
        console.info(JSON.stringify(event));
        const response = await axios.get('{{baseUrl}}/userTrack/runCronJob');
        console.log(response);
      } catch (error) {
        console.error(error);
      }


}
