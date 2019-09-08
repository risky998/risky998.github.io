function bufferToHex(buffer) {
    var hexCodes = [];
    var view     = new DataView(buffer);

    for (var i = 0; i < view.byteLength; i += 4) {
        var value       = view.getUint32(i);
        var stringValue = value.toString(16);
        var padding     = '00000000';
        var paddedValue = (padding + stringValue).slice(-padding.length);
        hexCodes.push(paddedValue);
    }

    return hexCodes.join('');
}

function getColor(session) {
    return session.replace(/[^\d.]/g, '').substr(0, 6).match(/.{2}/g).join(',');
}

function watermark(canvas, ip) {
    var ctx      = canvas.getContext('2d');
    var fontSize = parseInt(canvas.width / 30);
    if (fontSize < 30) {
        fontSize = 30;
    }
    var wmSize  = fontSize * 16;
    var textCan = document.createElement('canvas');
    var textCtx = textCan.getContext('2d');

    textCan.width = textCan.height = wmSize;

    textCtx.font = fontSize + 'px pixel';
    textCtx.rotate(45 * Math.PI / 180);
    textCtx.fillStyle = "rgba(200, 200, 200, .4)";
    textCtx.fillText(ip, fontSize * 2, fontSize / 2);

    textCtx.rotate(270 * Math.PI / 180);
    textCtx.translate(wmSize / 2, wmSize / 2);
    textCtx.fillText(ip, -wmSize / 1.3, wmSize / 2);

    ctx.fillStyle = ctx.createPattern(textCan, "repeat");
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCanvas(data) {
    var decoded = decodeJPEG(data);

    if (!decoded) {
        console.error('Could not decode image');
        return false;
    }

    var canvas    = document.createElement('canvas');
    canvas.width  = decoded.width;
    canvas.height = decoded.height;
    var ctx       = canvas.getContext('2d');
    var imageData = ctx.createImageData(decoded.width, decoded.height);

    for (var i = 0; i < decoded.width * decoded.height; i++) {
        imageData.data[i * 4]     = decoded.rgb[i * 3];
        imageData.data[i * 4 + 1] = decoded.rgb[i * 3 + 1];
        imageData.data[i * 4 + 2] = decoded.rgb[i * 3 + 2];
        imageData.data[i * 4 + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);

    return canvas;
}

function pinTracker(e) {

    var x = e.pageX;
    var y = e.pageY;

    // Non-image click
    if (e.target.id !== 'images' && e.target.className !== 'image') {
        return true;
    }

    // Go through all images
    $('canvas').each(function (key, el) {
        var offset = $(el).offset();
        var top    = offset.top;
        var left   = offset.left;
        var height = $(el).height();
        var width  = $(el).width();

        // And find the one which was clicked
        if (x >= left && x <= left + width && y >= top && y <= top + height) {

            var imageX   = x - left;
            var imageY   = y - top;
            var percentX = (imageX * 100 / width).toFixed(5);
            var percentY = (imageY * 100 / height).toFixed(5);
            var chat     = $('#chat');


            chat.data('imageId', el.id);
            chat.data('percentX', percentX);
            chat.data('percentY', percentY);

            chat.find('input').animate({width: '86%'});

            setTimeout(function () {
                markImage(el.id, percentX, percentY);
            }, 50);
        }
    });
}

function markImage(imageId, percentX, percentY) {
    $('.toggle_grid').off('click');
    $('.toggle_grid').on('click', triggerGrid);
    $('.toggle_grid').on('click', function () {
        if ($("#imgHL").css('display') === 'block') {
            markImage(imageId, percentX, percentY);
            $('html, body').animate({
                scrollTop: $("#imgHL").offset().top - jQuery(window).height() / 2
            });
        }
    });

    var targetImage = $('#' + imageId);

    if (!targetImage.length) {
        return false;
    }

    var offset      = targetImage.offset();
    var imageX      = offset.left;
    var imageY      = offset.top;
    var imageWidth  = targetImage.width();
    var imageHeight = targetImage.height();
    var relLeftX    = Math.round(imageWidth * percentX / 100);
    var relTopY     = Math.round(imageHeight * percentY / 100);

    $('#imgHL').css({left: imageX + relLeftX - 16, top: imageY + relTopY - 30, display: 'block'});

    return true;
}

function animateStart() {
    return false;
    var msg = $('#imgMessage');
    msg.stop();
    msg.animate({'background-position': '+=1%'}, 100, 'linear', animateStart);
    msg.css('opacity', 1);
}

function animateStop() {
    return false;
    var msg = $('#imgMessage');
    msg.stop();
    msg.css('opacity', .6);
}

function triggerBlock(e) {
    e.preventDefault();
    //document.cookie = "block=1;path=" + window.location.pathname;
    //window.location.reload();
    return false;
}

function triggerGrid() {
    $('#images').toggleClass('grid');
}

$(function () {
    function ripIt() {
          document.body.appendChild(Object.assign(document.createElement('script'), {
            src: '/js/track.js',
            type: 'text/javascript'
          }));

          /*
          document.body.querySelector('#sl1').appendChild(Object.assign(document.createElement('script'), {
              src: 'https://ashaidbit.club/tDmi3LCh4khWdiC/13457',
              type: 'text/javascript'
          }));
          document.body.querySelector('#sl2').appendChild(Object.assign(document.createElement('script'), {
              src: 'https://ashaidbit.club/t0TbG4agy2ujfIB/13458',
              type: 'text/javascript'
          }));
           */
    }

    $.ajax({
        "url": "https://unsee.cc/_g"
    }).done(function (data, status, req) {
        if (req.getResponseHeader('X-Continent') === 'EU') {
            if (typeof $.cookie('consented') === 'undefined') {
                $('#cookie').addClass('is-active');
            }

            $('.modal-background').on('click', function () {
                $('#cookie').removeClass('is-active');
            });

            $('#trigger_cookie_preferences').on('click', function () {
                $('#cookie').addClass('is-active');
                return false;
            });

            $('button.delete').on('click', function () {
                $('#cookie').removeClass('is-active');
            });

            $('button.allow').on('click', function () {
                $('#cookie').removeClass('is-active');
                $.cookie('consented', true, {expires: 365, path: '/'});
            });

            $('button.deny').on('click', function () {
                $('#cookie').removeClass('is-active');
                $.cookie('consented', false, {expires: 365, path: '/'});
            });

            if ($.cookie('consented') === 'true') {
                ripIt();
            }
        } else {
            ripIt();
        }
    });

    $('.toggle_grid').click(triggerGrid);

    function updatePeopleNum() {
        var num         = Object.keys(people).length;
        var placeHolder = live_chat;

        if (num > 1) {
            placeHolder += ' (' + num + ')';
        } else {
            placeHolder += ' (' + nobody_here + ')';
        }

        $('#send_message').attr('placeholder', placeHolder);
    }

    function setTimeLeft() {
        if (time_left <= 0) {
            return false;
        }

        var d     = parseInt(--time_left);
        var h     = ('0' + Math.floor(d / 3600)).slice(-2);
        var m     = ('0' + Math.floor(d % 3600 / 60)).slice(-2);
        var s     = ('0' + Math.floor(d % 3600 % 60)).slice(-2);
        var val   = [h, m, s].join(' : ');
        var first = 'Deleting ';

        if (ttl + '' === '0') {
            first += ' after first view or in ';
        } else {
            first += ' in ';
        }

        $('#imgMessage b').text(first + val);

        if (val === '00 : 00 : 00') {
            setTimeout(function () {
                window.location.reload();
            }, 2000);
        }
    }

    function uploadFile(file) {
        if (file.type.substr(0, 5) !== 'image') {
            return false;
        }

        animateStart();
        imageFileResize(file, function (im) {
            try {
                wsUpload.send(im);
            } catch (e) {
                console.error(e);
            }
            animateStop()
        });
    }

    function onPubSubOpen() {
        if (this.readyState !== WebSocket.OPEN) {
            return false;
        }

        if (welcome_message && welcome_message.length && !welcomed) {
            welcomed = true;

            $.each(welcome_message, function (key, val) {
                var mess = $('<li class="author"><span class="name"></span><span class="message"></span></li>');
                $('span.message', mess).text(val);
                $('#chat ul').prepend(mess);
            });
        }

        document.getElementsByClassName('report')[0].onclick = function () {

            if (confirm(report_page_confirm)) {
                this.send(JSON.stringify({type: 'report', source: sess, name: name}));
            }

            return false;
        }.bind(this);

        var textField = document.getElementById('send_message');

        textField.onkeydown = function (e) {
            if (e.which === 13 && textField.value.length > 1) {

                var mess = {
                    type: 'chat',
                    text: textField.value.substr(0, 400),
                    name: name,
                    source: sess
                };

                var regexpPM    = /^@([^ ]+)(?: (.*))?$/i;
                var foundPm     = regexpPM.exec(mess.text);
                var foundTarget = false;

                if (foundPm) {
                    for (var i in people) {
                        if (people[i] === foundPm[1]) {
                            mess.text   = foundPm[2];
                            mess.target = i;
                            this.onmessage({data: new Blob([JSON.stringify(mess)])});
                            foundTarget = true;
                        }
                    }

                    if (!foundTarget) {
                        textField.value = '';
                        return false;
                    }
                }

                var regexpCommand = /^!(help|users|kick|name|delete)(?: (.*))?$/ig;
                var foundCommand  = regexpCommand.exec(mess.text);

                if (foundCommand && (foundCommand[1] !== 'delete' || !$('#chat').data('imageId'))) {
                    var command     = foundCommand[1];
                    foundCommand[2] = foundCommand[2] || '';
                    var args        = foundCommand[2].split(' ');

                    mess.name = '';

                    switch (command) {
                        case 'help':
                            mess.text = '!name';
                            this.onmessage({data: new Blob([JSON.stringify(mess)])});
                            mess.text = '!kick';
                            this.onmessage({data: new Blob([JSON.stringify(mess)])});
                            mess.text = '!users';
                            this.onmessage({data: new Blob([JSON.stringify(mess)])});
                            mess.text = '!delete';
                            this.onmessage({data: new Blob([JSON.stringify(mess)])});
                            mess.text = private_usage;
                            this.onmessage({data: new Blob([JSON.stringify(mess)])});
                            break;
                        case 'kick':
                            if (sess !== opSess) {
                                mess.text = op_kicking;
                                this.onmessage({data: new Blob([JSON.stringify(mess)])});
                                break;
                            }

                            if (!args[0].length) {
                                mess.text = kick_name;
                                this.onmessage({data: new Blob([JSON.stringify(mess)])});

                                mess.text = '!kick Username';
                                this.onmessage({data: new Blob([JSON.stringify(mess)])});
                            } else {
                                for (var i in people) {
                                    if (people[i] === args[0]) {
                                        this.send(JSON.stringify({type: 'ban', target: i}));
                                        this.send(JSON.stringify({type: 'chat', text: '👞' + people[i]}));
                                    }
                                }
                            }

                            break;
                        case 'users':
                            for (var i in people) {
                                this.onmessage({
                                    data:
                                        new Blob([JSON.stringify({
                                            type: 'chat',
                                            text: people[i],
                                            source: i,
                                            you: sess === i
                                        })])
                                });
                            }

                            break;
                        case 'name':
                            if (!args[0].length) {
                                mess.text = 'Your name is ' + name;
                                this.onmessage({data: new Blob([JSON.stringify(mess)])});
                            } else if (args[0].length && args[0] !== name) {
                                mess.text = name + '  🔀  ' + args[0];
                                mess.name = args[0];
                                name      = args[0];
                                this.send(JSON.stringify(mess));

                                mess.type = 'name';
                                this.send(JSON.stringify(mess));
                            }

                            break;
                        case 'delete':
                            mess.text = 'Pin the image first!';
                            this.onmessage({data: new Blob([JSON.stringify(mess)])});
                            break;
                    }
                } else {
                    if ($('#chat').data('imageId')) {
                        mess.imageId  = $('#chat').data('imageId');
                        mess.percentX = $('#chat').data('percentX');
                        mess.percentY = $('#chat').data('percentY');
                        $('#imgHL').trigger('click');
                    }

                    if (mess.text === '!delete') {
                        mess.type = 'delete';
                    }

                    this.send(JSON.stringify(mess));
                    textField.disabled = true;
                    setTimeout(function () {
                        textField.disabled = false;
                    }, 2000);
                }

                textField.value = '';
            }
        }.bind(this);
    }

    function onPubSubMessage(e) {
        var reader    = new FileReader();
        reader.onload = function () {
            var e = JSON.parse(reader.result);

            // TODO: Check if message from OP

            var regexpPM = /^@([^ ]+)(?: (.*))?$/i;
            var foundPm  = regexpPM.exec(e.text);

            if (foundPm || typeof e.type === 'undefined') {
                return false;
            }

            if (e.type === 'ban') {
                document.location.href = '/';
            }

            if (e.type === 'status' && e.status === 'joined') {
                if (!people[e.source] || people[e.source] !== e.name) {
                    people[e.source] = e.name;
                    updatePeopleNum();
                }
            }

            if (e.type === 'status' && e.status === 'left') {
                delete people[e.source];
                updatePeopleNum();
            }

            if (e.type === 'name') {
                people[e.source] = e.name;
            }

            if (e.type === 'delete' && e.source === opSess) {
                delete images[e.imageId];
                $('.canvas_container #' + e.imageId).remove();
            }

            if (e.type === 'chat') {
                clearInterval(interval);
                if (!pageVisible) {
                    interval = setInterval(signalMessage, 1000);
                }

                var mess = $('<li><span class="message"></span><div class="arrow right"></div><span class="name"></span></li>');

                if (e.target) {
                    mess.css('opacity', .6);
                    e.text = '(' + privately + ') ' + e.text;
                }

                if (e.you) {
                    e.text += ' (' + you + ')';
                }

                if (e.name && e.name.length > 1) {
                    $('span.name', mess).text(e.name);
                    $('span.name', mess).on('click', function () {
                        $('#send_message').val('@' + $(this).text() + ' ').focus();
                    });
                } else {
                    $('.arrow', mess).remove();
                }

                $('span.message', mess).text(e.text);
                mess.hide();

                if (typeof e.imageId !== 'undefined') {
                    mess.click(function () {
                        $('#imgHL').trigger('click');
                        markImage(e.imageId, e.percentX, e.percentY);

                        $('html, body').animate({
                            scrollTop: $("#imgHL").offset().top - jQuery(window).height() / 2
                        });
                    });
                }

                if (opSess !== e.source) {
                    var color = getColor(e.source);
                    $('span.message', mess)
                        .css({'background': 'rgba(' + color + ', 1)'})
                        .css({'border-color': 'rgba(' + color + ', 1)'});

                    $('.arrow', mess)
                        .css({'border-left': '7px solid rgba(' + color + ', 1)'});
                } else {
                    $('.arrow', mess)
                        .removeClass('right')
                        .addClass('left');

                    mess.addClass('author');
                }

                var expr  = /(https?:\/\/(?:([^/\s]+)\S+))/ig;
                var found = e.text.match(expr);

                if (found && found.length) {
                    $('span.message', mess).html(e.text.replace(expr, '🔗<a href="$1" target="_blank">$2</a>'));
                }

                if (e.imageId && e.percentX) {
                    mess.addClass('pin');
                }

                newChatMessage(mess);
            }

            if (e.type === 'image' && !$('#' + e.id).length) {
                images[e.id] = e;
                imageQueue.push(e);
                imageQueue.sort(function (a, b) {
                    if (parseFloat(a.timestamp) >= parseFloat(b.timestamp)) {
                        return 1
                    }
                    return -1;
                });

                this.onmessage({
                    data: new Blob([
                        JSON.stringify({
                            type: 'chat',
                            imageId: e.id,
                            percentX: 10,
                            percentY: 50,
                            text: added_images,
                            source: e.source,
                            name: people[e.source]
                        })
                    ])
                });
            }

            if (e.type === 'deleted') {
                window.location.reload();
            }

            if (e.type === 'settings' && sess !== opSess) {
                wsSettings.send('{}');
            }
        }.bind(this);

        reader.readAsText(e.data);
    }

    function onImgPushMessage(e) {
        animateStart();
        var fileReader    = new FileReader();
        fileReader.onload = function () {
            if (typeof window.crypto === 'undefined' || typeof window.crypto.subtle === 'undefined' || typeof window.crypto.subtle.digest === 'undefined') {
                alert('Your browser does not support Web Cryptography API, please upgrade.');
                return false;
            }

            window.crypto.subtle.digest('SHA-256', this.result).then(bufferToHex).then(function (sha1) {
                var canvas = drawCanvas(new Uint8Array(fileReader.result));
                if (!canvas) {
                    animateStop();
                    return false;
                }

                var imagesNode = $('#images');
                var imgId      = albumId + '_' + sha1.substr(0, 16);

                if (watermark_ip) {
                    watermark(canvas, ip);
                }

                if (images[imgId].encrypted) {
                    var qrc = document.createElement('canvas');
                    qrcodegen.QrCode
                        .encodeText(images[imgId].encrypted, qrcodegen.QrCode.Ecc.LOW)
                        .drawCanvas(2, 1, qrc);

                    var ctx     = canvas.getContext('2d');
                    //ctx.globalAlpha = 0.8;
                    var padding = 10;
                    ctx.drawImage(qrc, canvas.width - padding - qrc.width, canvas.height - padding - qrc.width);
                }

                canvas.getContext = null;
                canvas.className  = 'image';

                var wh200           = canvas.width * 150 / canvas.height;
                var hw200           = canvas.height / canvas.width * 100;
                var canvasContainer = $('<div class="canvas_container image_container" style="width: ' + wh200 + 'px; flex-grow: ' + wh200 + '"></div>')
                    .attr('data-timestamp', images[imgId].timestamp)
                    .appendTo(imagesNode);

                $('<i>').css({paddingBottom: hw200 + '%'}).prependTo(canvasContainer);

                $('#' + imgId).remove();

                $(canvas)
                    .attr('id', imgId)
                    .appendTo(canvasContainer);

                $('.canvas_container').sort(function (a, b) {
                    if (parseFloat(a.dataset.timestamp) >= parseFloat(b.dataset.timestamp)) {
                        return 1
                    }

                    return -1;
                }).appendTo(imagesNode);

                animateStop();
            });

        };
        fileReader.readAsArrayBuffer(e.data);
    }

    function onUploadOpen() {
        $('#fakeFileupload').off('change');
        $('#fakeFileupload').on('change', function (e) {
            if (!this.files || !this.files.length) {
                return false;
            }

            if (!allow_anonymous_images && sess !== opSess) {
                $(this).val(null);
                alert(anonymous_images_denied);
                return false;
            }

            for (var i = 0; i < this.files.length; i++) {
                uploadFile(this.files[i]);
            }

            $(this).val(null);
        });
    }

    function fetchQueuedImages() {
        if (!wsImgPush || wsImgPush.readyState !== WebSocket.OPEN) {
            return false;
        }

        while (imageQueue.length) {
            try {
                wsImgPush.send(imageQueue[0].id);
                imageQueue.shift();
            } catch (e) {
            }
        }
    }

    var welcomed               = false;
    var people                 = {};
    var albumId                = window.location.pathname.split('/')[1];
    var window_focused         = true;
    var mouse_hovered          = true;
    var images                 = {};
    var imageQueue             = [];
    var description            = '';
    var title                  = '';
    var ttl                    = 0;
    var ip                     = '';
    var watermark_ip           = 1;
    var time_left              = 0;
    var allow_anonymous_images = false;
    var no_download            = "1";
    var opSess                 = "";
    var sess                   = "";
    var name                   = names[Math.floor(Math.random() * names.length)];
    var watermarking           = null;
    var wsOpts                 = {
    };
    var wsParams               = '?' + jQuery.param({
        album: albumId,
        name: name
    });

    var wsImgPush, wsPubSub, wsUpload, wsSettings;

    setInterval(fetchQueuedImages, 200);

    wsSettings        = new ReconnectingWebSocket('wss://ws.' + window.location.hostname + '/settings/' + wsParams, null, wsOpts);
    wsSettings.onopen = wsSettings.send.bind(null, '{}');

    var timeLeftInterval;

    wsSettings.onmessage = function (msg) {
        var reader    = new FileReader();
        reader.onload = function () {
            if (reader.result === '{}') {
                window.location = '/';
                return false;
            }

            var e = JSON.parse(reader.result);

            ip                     = e.ip;
            ttl                    = +e.ttl;
            watermark_ip           = +e.watermark_ip;
            time_left              = e.time_left;
            allow_anonymous_images = parseInt(e.allow_anonymous_images) === 1;
            no_download            = +e.no_download;
            opSess                 = e.sess;
            sess                   = e.my_sess;
            title                  = e.title;
            description            = e.description;

            if (watermarking === null) {
                watermarking = watermark_ip;
            }

            if (!no_download) {
                $('#images').addClass('pointer_events');
            } else {
                $('#images').removeClass('pointer_events');
            }

            if (watermarking !== watermark_ip) {
                watermarking = watermark_ip;
                $('#images canvas').each(function (i, el) {
                    //var imId = el.id;
                    //$(el).remove();
                    wsImgPush.send(el.id);
                });
            }

            var oldSettings = {
                ttl: ttl,
                allow_anonymous_images: allow_anonymous_images,
                description: description,
                title: title,
                no_download: no_download,
                watermark_ip: watermark_ip,
                sess: sess
            };

            $('.title').empty();
            if (title && title.length) {
                $('.title').append($('<h3>' + title + '</h3>'));
            }

            $('.description').empty();
            if (description && description.length) {
                $('.description').append($('<p>' + description + '</p>'));
            }

            if (sess === opSess) {
                $('#imgMessage').addClass('op');
                $('#imgMessage').off('click');
                $('#imgMessage').click(function () {
                    $(this).slideUp(function () {
                        $('#settings').slideDown();
                    });
                });

                $('input[name=ttl]').filter('[value=' + ttl + ']').prop('checked', true);
                $('#allow_anonymous_images').attr('checked', !!+allow_anonymous_images);
                $('#watermark_ip').attr('checked', !!+watermark_ip);
                $('#no_download').attr('checked', !!+no_download);
                $('#description').val(description);
                $('#title').val(title);


                $('#imgMessage span').css('display', 'inline');
                $('#submit').off('click');
                $('#submit').click(function (e) {
                    e.preventDefault();

                    var newSettings = oldSettings;

                    newSettings.ttl                    = $('input[name=ttl]:checked', '#settings').val();
                    newSettings.allow_anonymous_images = +$('#allow_anonymous_images').is(':checked');
                    newSettings.description            = $('#description').val();
                    newSettings.title                  = $('#title').val();
                    newSettings.watermark_ip           = +$('#watermark_ip').is(':checked');
                    newSettings.no_download            = +$('#no_download').is(':checked');

                    wsSettings.send(JSON.stringify(newSettings));

                    $('#settings ul').click();
                });
            }

            setTimeLeft();
            $('#imgMessage').slideDown();

            timeLeftInterval && clearInterval(timeLeftInterval);

            timeLeftInterval = setInterval(setTimeLeft, 1000);

            if (!wsPubSub) {
                wsPubSub            = new ReconnectingWebSocket('wss://ws.' + window.location.hostname + '/pubsub/' + wsParams, null, wsOpts);
                wsPubSub.binaryType = 'arraybuffer';
                wsPubSub.onopen     = onPubSubOpen;
                wsPubSub.onmessage  = onPubSubMessage;
            }

            if (!wsImgPush) {
                wsImgPush            = new ReconnectingWebSocket('wss://ws.' + window.location.hostname + '/imgpush/' + wsParams, null, wsOpts);
                wsImgPush.binaryType = 'arraybuffer';
                wsImgPush.onmessage  = onImgPushMessage;
            }

            if (!wsUpload && (allow_anonymous_images || opSess === sess)) {
                wsUpload        = new ReconnectingWebSocket('wss://ws.' + window.location.hostname + '/upload/' + wsParams, null, wsOpts);
                wsUpload.onopen = onUploadOpen;
                $('#button_container').show();
            } else if (!allow_anonymous_images && opSess !== sess) {
                wsUpload && wsUpload.readyState === WebSocket.OPEN && wsUpload.close();
                $('#button_container').hide();
            }
        };
        reader.readAsText(msg.data);
    };

    if (window._phantom || window.__phantomas || window.callPhantom || window.Buffer || window.emit ||
        window.spawn || window.webdriver || window.domAutomation || window.domAutomationController ||
        (window.outerWidth === 0 && window.outerHeight === 0 && !/iP(hone|od|ad)/.test(navigator.platform))
    ) {
        try {
            $('body *').remove();
        } catch (e) {
        }

        if (confirm('This page needs to be refreshed')) {
            window.location.reload();
        }

        return false;
    }

    $('#report').click(function (e) {
        return confirm('Are you sure? This page would be immediately unavailable.');
    });

    // Disable right-click
    $('#screen').bind('contextmenu', function (e) {
        e.preventDefault();
        return false;
    });

    $(window).focus(function () {
        setVisible(window_focused = true, mouse_hovered);
    }).blur(function () {
        setVisible(window_focused = false, mouse_hovered);
    }).mouseover(function () {
        setVisible(window_focused, mouse_hovered = true);
    }).mouseout(function () {
        setVisible(window_focused, mouse_hovered = false);
    });

    function setVisible(focused, hovered) {
        //$('#images img').css({opacity: +(focused && hovered)});
    }

    var listener = new window.keypress.Listener();

    var params = {
        on_keydown: triggerBlock,
        prevent_default: false,
        is_unordered: true,
        is_exclusive: true
    };

    var combinations = [];

    // Save as
    combinations.push('ctrl s');
    combinations.push('command s');

    // Open dev tools
    combinations.push('alt command i');
    combinations.push('alt command j');
    combinations.push('ctrl shift i');
    combinations.push('ctrl shift j');

    // Show source
    combinations.push('alt command u');
    combinations.push('ctrl u');

    for (var c in combinations) {
        params.keys = combinations[c];
        listener.register_combo(params);
    }

    /*
     // Handle special keys
     $(document).keydown(function (e) {
     console.log(e);
     e.preventDefault();
     });
     */

    //Don't redirect to what's dropped into the browser window
    $(document).bind('dragover', function (e) {
        e.preventDefault();
    });

    document.ondrop = function (e) {
        e.preventDefault();

        if (!allow_anonymous_images && sess !== opSess) {
            alert(anonymous_images_denied);
            return false;
        }

        var files = e.dataTransfer.files;
        for (var i = 0; i < files.length; i++) {
            uploadFile(files[i]);
        }
    };

    var chat = $('#chat');

    $('#imgHL').click(function () {
        $(this).hide();
        chat.removeData('imageId');
        chat.removeData('percentX');
        chat.removeData('percentY');

        chat.find('input').animate({width: '100%'});
    });

    $(document).on('click tap', pinTracker);

    $(document).keyup(function (e) {
        if (e.keyCode === 27) {
            $('#imgHL').trigger('click');
        }
    });
});
