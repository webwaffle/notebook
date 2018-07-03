document.getElementById('edit-form').style.display = "none";
document.getElementById('edit-button').addEventListener('click', () => {
    document.getElementById('edit-button').style.display = "none";
    document.getElementById('edit-form').style.display = "inline";
    document.getElementById('entry-text').style.display = "inline";
    //document.getElementById('entry-text').style.border = "0px solid black";
});

var text = document.getElementById('entry-text');
var converter = new showdown.Converter({emoji: true, noHeaderId: true});
text.innerHTML = converter.makeHtml(text.innerHTML);
document.getElementById('edit').addEventListener('input', () => {
    text.innerHTML = converter.makeHtml(document.getElementById('edit').value);
});