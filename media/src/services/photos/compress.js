const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

const compress = async ({ source, destination }) => {
  const files = await imagemin([source], destination, {
    plugins: [imageminJpegtran(), imageminPngquant({ quality: [0.65, 0.8] })]
  });

  return files;
};

module.exports = compress;
