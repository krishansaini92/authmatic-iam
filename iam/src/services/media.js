const fs = require('fs');
const util = require('util');
const request = require('request');
const {
  url: { media: mediaUrl }
} = require('config');

const requestPromise = util.promisify(request);

const cropAndUpload = async ({
  mediaPath, resolutions, mimeType, requestId
}) => new Promise(async (resolve, reject) => {
  try {
    const options = {
      method: 'POST',
      url: `${mediaUrl}media/mutations/crop_upload`,
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-request-id': requestId
      },
      formData: {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        photo: fs.createReadStream(mediaPath),
        resolutions: JSON.stringify(resolutions),
        mimeType
      }
    };
    const response = await requestPromise(options);
    // eslint-disable-next-line
      fs.unlinkSync(mediaPath);

    resolve(JSON.parse(response.body).data);
  } catch (error) {
    reject(error);
  }
});

module.exports = {
  cropAndUpload
};
