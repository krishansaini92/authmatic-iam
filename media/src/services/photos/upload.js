const fs = require('fs');
const Aws = require('aws-sdk');
const {
  s3: {
    bucketName,
    folders: { image: imageFolderName },
    credentials: { accessKeyId, secretAccessKey },
    domain: s3Domain
  }
} = require('config');

Aws.config.update({ accessKeyId, secretAccessKey });
const s3 = new Aws.S3();

const upload = async (filePath, nameToSave, mimeType, deleteLocally = true) => {
  // eslint-disable-next-line
  const fileBuffer = await fs.readFileSync(filePath);
  const params = {
    Bucket: bucketName,
    Key: `${imageFolderName}${nameToSave}`,
    Body: fileBuffer,
    ACL: 'public-read',
    ContentType: mimeType
  };

  await s3.putObject(params).promise();
  // eslint-disable-next-line
  deleteLocally && fs.unlinkSync(filePath);

  const uploadedImageUrl = `${s3Domain}${bucketName}/${imageFolderName}${nameToSave}`;

  return uploadedImageUrl;
};

const uploadMultiple = async ({ images, mimeType, logger }) => {
  if (typeof images !== 'object') {
    throw new Error('Invalid image object provided');
  }

  const response = {};

  // eslint-disable-next-line
  for (const key in images) {
    // eslint-disable-next-line
    const uploadedImageUrl = await upload(images[key].path, images[key].name, mimeType);

    // eslint-disable-next-line security/detect-object-injection
    response[key] = uploadedImageUrl;

    // eslint-disable-next-line security/detect-object-injection
    logger.info('Successfully Uploaded', images[key]);
  }

  return response;
};

module.exports = {
  upload,
  uploadMultiple
};
