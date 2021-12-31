// Handle rendering and IO with the websocket
class Game {
    private readonly game_container : HTMLElement;
    private readonly drawing_surface : HTMLCanvasElement;
    private render_context : CanvasRenderingContext2D;
    private webclient : Client;

    constructor(game_container : HTMLElement, webclient : Client) {
        this.game_container = game_container;
        this.webclient = webclient;
        this.drawing_surface = document.createElement("canvas")
        this.drawing_surface.id = "game-surface"
        let render_context = this.drawing_surface.getContext("2d");
        if (render_context == null) {
            console.log("ERROR: No rendering context exists for our canvas!")
        }
        this.render_context = <CanvasRenderingContext2D> render_context;
        this.render()
    }

    public handle_input(input : string) : void {
      if (input == "start") { // TODO: This is temp, obviously
        this.game_container.innerHTML = "";
        this.game_container.appendChild(this.drawing_surface)
      }
      console.log(`Data received from server: ${input}`);
    }

    public render() : void {
        this.render_context.fillStyle = "#F00"
        this.render_context.fillRect(0, 0, 400, 400)
    }

    public start() : void {
        let loop = true;
        console.log('running')
        this.handle_input('start')
    }
}