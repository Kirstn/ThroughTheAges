var username = document.getElementById("username");
var user;

if(username == null) {
    user = 'Anonymous';
}else{
    user = username.innerHTML;
}

$('form').submit(function(){
    var msg = $('#m').val();
    if(msg)
        socket.emit('chat message', {username: user, message: msg});
    $('#m').val('');
    return false;
});

socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg.username + ": " + msg.message));

    var messages = document.getElementById('messages');
    var l = messages.childElementCount;
    messages.children[l - 1].scrollIntoView(true);
});