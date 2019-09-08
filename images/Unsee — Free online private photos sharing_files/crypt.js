var CryptoJSAesJson = {
    stringify: function (cipherParams) {
        var j = {ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)};
        if (cipherParams.iv) j.iv = cipherParams.iv.toString();
        if (cipherParams.salt) j.s = cipherParams.salt.toString();
        return JSON.stringify(j);
    },
    parse: function (jsonStr) {
        var j = JSON.parse(jsonStr);
        var ct = CryptoJS.enc.Base64.parse(j.ct);
        var cipherParams = CryptoJS.lib.CipherParams.create({ciphertext: ct});
        if (j.iv) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv);
        if (j.s) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s);
        return cipherParams;
    }
};

function convertDataURIToBinary(dataURI) {
    var raw = window.atob(dataURI);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (var i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    return array;
}

function renderImage(canvas, encryptedBody, passPhrase) {

    var base64Image = CryptoJS.AES.decrypt(
        JSON.stringify(encryptedBody),
        passPhrase,
        {format: CryptoJSAesJson}
    ).toString(CryptoJS.enc.Utf8);

    var content = convertDataURIToBinary(base64Image);

    var numComponents, width, height, decoded, parser;
    parser = new JpegDecoder();
    parser.parse(content);

    width = parser.width;
    height = parser.height;
    numComponents = parser.numComponents;
    decoded = parser.getData(width, height);

    canvas.width = width;
    canvas.height = height;
    //$(canvas).css('max-width', width + 'px');

    var ctx = canvas.getContext('2d');
    var imageData = ctx.createImageData(width, height);
    var imageBytes = imageData.data;
    for (var i = 0, j = 0, ii = width * height * 4; i < ii;) {
        imageBytes[i++] = decoded[j++];
        imageBytes[i++] = numComponents === 3 ? decoded[j++] : decoded[j - 1];
        imageBytes[i++] = numComponents === 3 ? decoded[j++] : decoded[j - 1];
        imageBytes[i++] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    return [width, height];
}
