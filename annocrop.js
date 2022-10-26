const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const myimagepath = path.join(__dirname, 'images');
let images = fs.readdirSync(myimagepath);
let XMLannotationsPath = path.join(__dirname, 'annotations');
let imageCropPath = path.join(__dirname, 'cropped');
//create folder if not exist
if (!fs.existsSync(imageCropPath)) {
  fs.mkdirSync(imageCropPath);
}

// Loop through all the images
for (let i = 0; i < images.length; i++) {
  let image = images[i];
  let imagepath = path.join(myimagepath, image);
  let imageAnnotations = [];
  let imagesizes = [];
  let imageAnnotationsPath = path.join(
    XMLannotationsPath,
    image.split('.')[0] + '.xml',
  );
  let imageAnnotationsFile = fs.readFileSync(imageAnnotationsPath);
  parser.parseString(imageAnnotationsFile, function (err, result) {
    imageAnnotations = result.annotation.object;
    imagesizes = result.size;
  });
  // Loop through all the annotations
  for (let j = 0; j < imageAnnotations.length; j++) {
    console.log(j + '/' + imageAnnotations.length);
    let annotation = imageAnnotations[j];
    let annotationName = annotation.name[0];
    let annotationBndbox = annotation.bndbox[0];
    let x = parseInt(annotationBndbox.xmin[0]);
    let y = parseInt(annotationBndbox.ymin[0]);
    let width = parseInt(annotationBndbox.xmax[0]) - x;
    let height = parseInt(annotationBndbox.ymax[0]) - y;
    let imageCropName = image.split('.')[0] + '_' + annotationName + '.jpg';
    let imageCropPathName = path.join(imageCropPath, imageCropName);
    Jimp.read(imagepath, function (err, lenna) {
      if (err) throw err;
      lenna.crop(x, y, width, height).write(imageCropPathName);
    });
  }
}
