const AWS = require("aws-sdk")
const multerS3 = require("multer-s3")
const multer = require("multer")

AWS.config.update({
  region: 'ap-northeast-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const s3 = new AWS.S3();

const imageUploader = multer({
  storage: multerS3({
    s3: s3,
    acl: "public-read",
    bucket: 'wevre/test',
    key:
      (req, file, callback) => {
        callback(null, `${Date.now()}_${file.originalname}`)
      },
    contentType: multerS3.AUTO_CONTENT_TYPE
  })
})

module.exports = {imageUploader}