function JoinRoom(roomId:string, clientName: string) {
  console.log("Establishing websocket connection with server...")
  let game_container = <HTMLElement> document.querySelector('#game-container');
  if (game_container == null) {
    alert("Something went wrong with this page")
    console.log("ERROR: Could not find game container on page")
  };
  let client = new Client(roomId, clientName, "ws://65.96.171.239:8999") //);"ws://127.0.0.1:8999"
  let game = new Game(game_container, client);
  game.start();
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
  JoinRoom(url_params.substring(room_idx + param_str.length), "test_client_name")
}, false);