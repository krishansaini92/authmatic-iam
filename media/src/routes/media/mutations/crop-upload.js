const fs = require('fs');
const express = require('express');
const multer = require('multer');
const uuid = require('uuid/v4');
const Joi = require('joi');
const {
  image: { mimetypes },
  filesPath: { 
    images: {
      compressed: compressedImageFolder,
      original: originalImageFolder
  }
}
} = require('config');

const compressImage = require('../../../services/photos/compress');
const { cropToResolutions } = require('../../../services/photos/crop');
const { uploadMultiple: upload } = require('../../../services/photos/upload');
const { joiFailurePrettier } = require('../../../lib/joi-validate');

const multipart = multer({ dest: './uploads' });
const router = express.Router();

const validateRequest = (payload) => {
  const { error, value } = Joi.validate(
    payload,
    Joi.object({
      resolutions: Joi.string()
        .trim()
        .required(),
      mimeType: Joi.any().valid('image/png', 'image/jpeg')
    })
  );
  if (error) {
    joiFailurePrettier(error);
  }

  value.resolutions = JSON.parse(value.resolutions);

  return value;
};

router.post(
  '/crop_upload',
  multipart.single('photo'),
  async ({ body: payload, file: image, logger }, res, next) => {
    try {
      const { resolutions, mimeType } = validateRequest(payload);

      if (!image || !image.path) {
        throw new Error('Image not provided');
      }

      const imageUuid = uuid();
      // eslint-disable-next-line security/detect-object-injection
      const originalImagePath = `${originalImageFolder}${imageUuid}.${mimetypes[mimeType]}`;
      // eslint-disable-next-line security/detect-object-injection
      const compressedImagePath = `${compressedImageFolder}${imageUuid}.${mimetypes[mimeType]}`;

      // eslint-disable-next-line
      await fs.renameSync(image.path, originalImagePath);
      await compressImage({ source: originalImagePath, destination: compressedImageFolder, logger });

      const croppedPhotos = await cropToResolutions({
        imagePath: compressedImagePath,
        resolutions: Object.values(resolutions),
        // eslint-disable-next-line security/detect-object-injection
        imageType: mimetypes[mimeType]
      });

      const uploadedPhotos = await upload({ images: croppedPhotos, mimeType, logger });

      res.send({ statusCode: 200, message: 'Successfully uploaded', data: uploadedPhotos });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
