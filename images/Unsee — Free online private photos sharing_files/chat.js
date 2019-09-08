var pageVisible = true;
var interval;
var texts       = [document.title, 'New chat message'];
var snap        = new Audio('/snap.mp3');
snap.pause();
snap.currentTime = 0;
snap.volume      = .4;

function newChatMessage(mess) {
    $('#chat ul').prepend(mess);

    mess.animate({height: 'toggle', opacity: 'toggle'}, 200);
    try {
        snap.play();
    } catch (e) {
        // I don't care
    }
}

function signalMessage() {
    if (pageVisible) {
        document.title = texts[0];
        return clearInterval(interval);
    }

    document.title = texts[+!jQuery.inArray(document.title, texts)];
}

$(function () {
    $('#chat .toggler').click(function () {
        if ($(this).hasClass('up')) {
            $(this).removeClass('up');
            $('#chat').animate({maxHeight: '40%', bottom: 0});
        } else {
            $(this).addClass('up');
            $('#chat').animate({maxHeight: '0%', bottom: -25});
        }
    });

    $(document).on('show', function () {
        pageVisible = true;
    });

    $(document).on('hide', function () {
        pageVisible = false;
    });

    function onMessage(res) {

        clearInterval(interval);
        if (!pageVisible) {
            interval = setInterval(signalMessage, 1000);
        }

        var mess = $('<li><span class="message"></span><div class="arrow right"></div><span class="name"></span></li>');

        if (typeof res.private !== 'undefined' && res.private) {
            mess.css('opacity', .6);
            res.text = '(' + privately + ') ' + res.text;
        }

        if (typeof res.name !== 'undefined' && res.name.length > 1) {
            $('span.name', mess).text(res.name);
            $('span.name', mess).on('click', function () {
                $('#send_message').val('@' + $(this).text() + ' ').focus();
            });
        } else {
            $('.arrow', mess).remove();
        }

        $('span.message', mess).text(res.text);
        mess.hide();

        if (typeof res.imageId !== 'undefined') {
            mess.click(function () {
                $('#imgHL').trigger('click');
                markImage(res.imageId, res.percentX, res.percentY);

                $('html, body').animate({
                    scrollTop: $("#imgHL").offset().top - jQuery(window).height() / 2
                });
            });
        }

        if (res.color && !res.author) {
            $('span.message', mess).css({'background': 'rgba(' + res.color + ', 1)'});
            $('span.message', mess).css({'border-color': 'rgba(' + res.color + ', 1)'});

            $('.arrow', mess).css({'border-left': '7px solid rgba(' + res.color + ', 1)'});
        }

        var expr  = /(((https?:)?\/\/)?unsee.cc\/([a-z]+)\/?)/ig;
        var found = mess.text().match(expr);

        if (found && found.length) {
            //mess.addClass('link');
            mess.html(mess.html().replace(expr, ' <a href="https://unsee.cc/$4" target="_blank">$4</a> '));
        }

        if (res.author) {
            $('.arrow', mess).removeClass('right');
            $('.arrow', mess).addClass('left');
            mess.addClass('author');
        }

        if (res.imageId && res.percentX) {
            mess.addClass('pin');
        }

        newChatMessage(mess);

    }
});
