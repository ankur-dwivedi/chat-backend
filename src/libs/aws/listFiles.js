const AWS = require('aws-sdk')

exports.listFiles = async (path,contentType) => {
    try {
        const s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ID,
            secretAccessKey: process.env.AWS_SECRET,
        })

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Prefix: path,

        }
        let files = []
        while (1) {
            const { Contents, IsTruncated, NextMarker } = await s3.listObjects(params).promise()
            console.group(Contents)
            files = files.concat(Contents)
            if (IsTruncated) params.Marker = Contents[Contents.length - 1].Key
            else break
        }
        const assets = files.map((file) => {
            const { Size, LastModified, Key } = file
            const url = `${process.env.BASE_URL}${Key}`

            return {
                name: Key,
                size: Size,
                updated: LastModified,
                url,
                type: contentType,
            }
        })
        const sortedList = assets.sort(
            (current, prev) => new Date(prev.updated) - new Date(current.updated)
        )
        //console.log(sortedList)    
        return sortedList
    } catch (error) {
        throw error
    }
}