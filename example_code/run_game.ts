function JoinRoom(roomId:string, clientName: string) {
  console.log("Establishing websocket connection with server...")
  let game_container = <HTMLElement> document.querySelector('#game-container');
  if (game_container == null) {
    alert("Something went wrong with this page")
    console.log("ERROR: Could not find game container on page")
  }
  let client = new Client(roomId, clientName, "ws://65.96.171.239:8999"); //"ws://127.0.0.1:8999");
  let game = new Game(game_container, client);
  game.start();
}

document.addEventListener("DOMContentLoaded", function() {
  let url_params : string = window.location.search.substring(1);
  let roomString : string = "room=";
  let clientString : string = "clientName=";
  let parameters = url_params.split("&");
  let room = "";
  let clientName = "";
  parameters.forEach(parameter => {
    if (parameter.indexOf(roomString) == 0) {
      room = parameter.substring(roomString.length);
    } else if (parameter.indexOf(clientString) == 0) {
      clientName = parameter.substring(clientString.length);
    }
  });
  if (room != "" && clientName != "") {
    JoinRoom(room, clientName);
  } else {
    console.log("Missing room or client name!");
    alert("Missing room or client name!");
    window.location.href = "index.html";
  }
}, false);