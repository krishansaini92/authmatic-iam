const express = require('express');
const multer = require('multer');
const {
  image: { mimetypes, resolutions }
} = require('config');
const User = require('../../../models/user');
const checkAuthentication = require('../../../lib/check-authentication');
const { cropAndUpload } = require('../../../services/media');

const multipart = multer({ dest: './uploads' });
const router = express.Router();

const validateImage = async ({ image, logger }) => {
  if (!mimetypes[image.mimetype]) {
    logger.error('Invalid mimetype of image');
    throw new Error('INVALID_IMAGE');
  }

  // should be < 10 MB
  if (image.size > 10485760) {
    logger.error('Image size greater than maximum allowed');
    throw new Error('INVALID_IMAGE');
  }

  return true;
};

router.post(
  '/update_photo',
  multipart.single('photo'),
  async ({
    auth, file: image, logger, requestId
  }, res, next) => {
    try {
      checkAuthentication(auth, ['user']);

      if (!image) {
        throw new Error('INVALID_IMAGE');
      }

      await validateImage({ image, logger });

      const images = await cropAndUpload({
        mediaPath: image.path,
        resolutions,
        mimeType: image.mimetype,
        requestId
      });
      
      await User.findOneAndUpdate(
        { _id: auth.user.id },
        {
          $set: {
            photo: images
          }
        }
      );

      const user = await User.findById(auth.user.id);

      res.send({ statusCode: 200, message: 'Successfully updated photo', user });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
