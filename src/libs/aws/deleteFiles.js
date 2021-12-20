


  exports.deleteFiles = async (files) => {
    try {
      const AWS = require('aws-sdk')
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET,
      })

      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
      }

      const ObjectsList = files.map((fileName) => {
        return {
          Key: fileName,
        }
      })

      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Delete: {
          Objects: ObjectsList,
        },
      }
      const deleteResponse = await s3.deleteObjects(deleteParams).promise()
     /// console.log(deleteResponse)
      return {
        success: true,
        message: 'Deleted Successfully',
      }
    } catch (error) {
      throw error
    }
  }