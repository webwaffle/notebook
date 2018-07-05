var showdown = require('showdown');
var $ = require('jquery');
$('#edit-form').css('display', 'none');
$('#edit-button').click(() => {
    $('#edit-button').css('display', 'none');
    $('#edit-form').css("display", "inline");
    $('#entry-text').css("display", "inline");
});

var text = document.getElementById('entry-text');
var converter = new showdown.Converter({emoji: true, noHeaderId: true});
text.innerHTML = converter.makeHtml(text.innerHTML);
document.getElementById('edit').addEventListener('input', () => {
    text.innerHTML = converter.makeHtml(document.getElementById('edit').value);
});