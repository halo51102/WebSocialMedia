const dotenv = require("dotenv");
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

dotenv.config();

aws.config.update({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  region: 'ap-southeast-1',
})

const s3 = new aws.S3();

// Multer S3 storage configuration
const uploadLocalFile = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'nhutlamsocialmedia1',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read', // Set ACL to public-read for public access
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      // Set the file name in the S3 bucket
      console.log(file);
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});

// Function to upload an image buffer to S3
const uploadImageToS3 = async (buffer, fileName, mimeType) => {
  const params = {
    Bucket: 'nhutlamsocialmedia1',
    Key: fileName,
    Body: buffer,
    ContentType: mimeType,
    ContentDisposition: 'inline',
    ACL: 'public-read', // Access control level for the file
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // The URL of the uploaded file
  } catch (err) {
    throw new Error('Error uploading image to S3: ' + err.message);
  }
};

module.exports = {uploadLocalFile, uploadImageToS3};