$(function () {
    $('#settings li').click(function (e) {
        e.preventDefault();
        $('#settings li').removeClass('active');
        $(this).addClass('active');

        $('#settings table').hide();
        $('#settings table.' + $(this).data('page')).show();
        return false;
    });

    $('#settings ul').click(function () {
        if (typeof ga !== 'undefined') {
            ga('send', 'event', 'album', 'settings');
        }

        $('#settings').slideUp(function () {
            $('#imgMessage').slideDown();
        });
    });

    $(document).keyup(function (e) {
        if (e.keyCode === 27) {
            $('#settings ul').click();
        }
    });
});
