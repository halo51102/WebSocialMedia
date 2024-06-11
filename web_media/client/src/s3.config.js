import AWS from "aws-sdk";

export const uploadImagesToS3 = async (file) => {
  // S3 Bucket Name
  const S3_BUCKET = "nhutlamsocialmedia1";

  // S3 Region
  const REGION = "ap-southeast-1";

  // S3 Credentials
  AWS.config.update({
    accessKeyId: "..",
    secretAccessKey: ".." ,
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
    ContentDisposition: 'inline'
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
    // const imageURL = await s3.getSignedUrl('getObject', {
    //   Bucket: S3_BUCKET,
    //   Key: file.name,
    // });
    const imageURL = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/${file.name}`.replace(" ", "+");

    return imageURL;
  }
  catch (err) {
    console.log(err)
  }
};

