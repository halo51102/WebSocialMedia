import AWS from "aws-sdk";

export const uploadImagesToS3 = async (file) => {
  console.log(process.env.AWS_ACCESS_KEY_ID)
  // S3 Bucket Name
  const S3_BUCKET = "nhutlamsocialmedia1";

  // S3 Region
  const REGION = "ap-southeast-1";

  // S3 Credentials
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
  const s3 = new AWS.S3({
    params: { Bucket: S3_BUCKET },
    region: REGION,
  });

  // Files Parameters
  const params = {
    Bucket: S3_BUCKET,
    Key: file.name,
    Body: file,
    ACL: 'public-read',
    ContentDisposition: 'inline',
    ContentType: 'image/jpeg'
  };

  // Uploading file to s3

  var upload = s3
    .putObject(params)
    .on("httpUploadProgress", (evt) => {
      // File uploading progress
      console.log(
        "Uploading " + parseInt((evt.loaded * 100) / evt.total) + "%"
      );
    })
    .promise();

  try {
    await upload.then((data) => {
      console.log(data);
      // Fille successfully uploaded
    });
    const imageURL = await s3.getSignedUrl('getObject', {
      Bucket: S3_BUCKET,
      Key: file.name,
    });
    return imageURL;
  }
  catch (err) {
    console.log(err)
  }

};

