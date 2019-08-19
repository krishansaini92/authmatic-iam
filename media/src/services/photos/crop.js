const {
  filesPath: { 
    images: {
      cropped: croppedImageFolder
    }
  }
} = require('config');
const uuid = require('uuid/v4');
const sharp = require('sharp');

const crop = async (imagePath, { width, height }, imageType) => {
  const croppedImageId = uuid();

  const outputImagePath = `${croppedImageFolder}${croppedImageId}.${imageType}`;

  await sharp(imagePath)
    .resize(width, height, {
      kernel: sharp.kernel.nearest,
      fit: 'contain',
      background: {
        r: 255,
        g: 255,
        b: 255,
        alpha: 1
      }
    })
    .toFile(outputImagePath);

  return {
    [`_${width}x${width}`]: {
      path: outputImagePath,
      name: `${croppedImageId}.${imageType}`
    }
  };
};

const cropToResolutions = async ({ imagePath, resolutions, imageType }) => {
  const promises = resolutions.map((resolution) => crop(imagePath, resolution, imageType));

  const response = await Promise.all(promises);

  return response.reduce((result, current) => Object.assign(result, current), {});
};

module.exports = {
  cropToResolutions,
  crop
};
