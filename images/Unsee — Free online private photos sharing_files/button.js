function imageFileResize(file, cb) {
    var img     = new Image();
    var ratio   = 1;
    var maxSize = 1600;
    var canvas  = document.createElement('canvas');
    var ctx     = canvas.getContext("2d");

    img.src    = URL.createObjectURL(file);
    img.onload = function () {
        if (img.width > maxSize || img.height > maxSize) {
            ratio = maxSize / (img.width > maxSize ? img.width : img.height);
        }

        canvas.width  = img.width * ratio;
        canvas.height = img.height * ratio;

        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(cb, 'image/jpeg');
    };
}
