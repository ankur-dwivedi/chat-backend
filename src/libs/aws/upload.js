
const fs = require('fs');

exports.uploadFiles = async (bucketName, files) => {
  try {
    const s3Config = {
      accessKeyId: process.env.AWS_ID,
      secretAccessKey: process.env.AWS_SECRET,
    }
    let type = bucketName.split('/')
    //console.log(type)
    const AWS = require('aws-sdk')
    const stream = require('stream')
    const s3 = new AWS.S3(s3Config)
    //console.log("WOAHH")
    const uploadedFiles = files.map((file) => {
      return new Promise(async (resolve, reject) => {
        const hashedName = file.originalname

        const pass = new stream.PassThrough()
        const params = {
          Key: hashedName,
          ContentType: type[2] == "gif" ? "image/gif" : 'multipart/form-data',
          Bucket: bucketName,
          Body: pass,
        }
        params.ACL = 'public-read'

        //console.log(bucketName)
        const readStream = fs.createReadStream(file.path)
        readStream.pipe(pass)

        s3.upload(params, (err, data) => {
          if (err) reject(err)
          resolve(data)
        })
      })
    })

    return Promise.all(uploadedFiles)
  } catch (error) {
    throw error
  }
}