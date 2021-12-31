/**
 * Game Objects passed between server and clients; these have a serialized component, 
 *      which is updated each frame by the server
 */
interface GameObject {
    update() : void;
    getSerializedData() : JSON;
}