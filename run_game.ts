function JoinRoom(roomId:string) {
  console.log("Establishing websocket connection with server...")
  let socket = new WebSocket("ws://127.0.0.1:8999");//65.96.171.239:8999");

  socket.onopen = function(e) {
    console.log("Connection established");
    socket.send("ROOM: " + roomId);
  };

  socket.onmessage = function(event) {
    console.log(`[message] Data received from server: ${event.data}`);
    alert("Data Recieved from the Server: ${event.data}")
  };

  socket.onclose = function(event) {
    if (event.wasClean) {
      console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      console.log('[close] Connection died');
    }
  };

  socket.onerror = function(error) {
      console.log(error)

  };
  console.log("Exiting method")
}

document.addEventListener("DOMContentLoaded", function() {
  let param_str : string = "room=";
  let url_params : string = window.location.search;
  let room_idx : number = url_params.indexOf(param_str)
  if (room_idx < 0) {
      console.log("ERROR! Room ID Missing!")
      alert("ERROR! Room ID Missing!")
      window.location.href = "index.html"
  }
  JoinRoom(url_params.substring(room_idx + param_str.length))
}, false);