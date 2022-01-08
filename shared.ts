/**
 * Game Objects exist on both server and clients; these have a serialized component, 
 *      which is updated each frame by the server
 */
interface GameObject {
    /**
     * Update the game object (on the server, this will be )
     */
    update() : void;
    /**
     * Returns a JSON object of simple fields that represent any non-determinstic data;
     *  that is to say, data that the clients could not predict based on previous data.
     *  This is usually caused by another player's input event or game randomness.
     */
    getUpdatedData() : JSON;
    /**
     *  Update this game object with the same type of JSON data recieved from
     *   getUpdatedData(); this will be called on the server side to 
     */
    updateFromData(inputs: JSON) : void;
}