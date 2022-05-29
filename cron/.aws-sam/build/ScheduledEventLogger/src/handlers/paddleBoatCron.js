const axios = require("axios").default;
/**
 * A Lambda function that logs the payload received from a CloudWatch scheduled event.
 */
exports.paddleBoatCronHandler = async (event) => {
  try {
    console.info(JSON.stringify(event));
    //prod server api uncomment it if want to call this api for prod server
    // const response = await axios.get('http://a61ff110149944e9b89bbfaeabe36b2e-1973880885.ap-south-1.elb.amazonaws.com:4000/api/v1/userTrack/runCronJob');
    // console.log(response);
    //dev server api calling
    const response = await axios.get('http://adaf9d1bcafbf466bb533811b3474b4d-553103630.ap-south-1.elb.amazonaws.com:4000/api/vi/userTrack/runCronJob');
    console.info(response);
  } catch (error) {
    console.error(error);
  }
};
