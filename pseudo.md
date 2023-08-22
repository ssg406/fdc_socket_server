# Draft Pseudocode

## Connection
- Player connects with player ID, tour ID, and action in handshake
- Draft player object created and initialized

## Draft player initialization
- If action is to create room
    * Call room manager > create 
    * Add player to room
    * Emit player list
    * Return true
- If action is to join
    * Call room manager > join
    * Emit player list
    * Return true
- Call draft player > isReady
- If room Manager > are players ready returns true, start draft

## Start Draft 
- Shuffle order of players
- Emit 'Server Starts Draft' event
- Start turn
    * Skip turn if player lineup is complete
    * Emit 'Server start turn' event
    * Include current player, list of available picks
    * Start turn timer
- Player ends turn
    * Player sends pick
    * Turn timer canceled
    * Advance turn number
    * Start turn
- Server ends turn
    * Timer runs out
    * Server chooses pick and sends to player
    * Advance turn number
    * Start turn
- When turn number = size of player array, re shuffle players
- Set turn number back to 0
## Player lineup complete
- Player sends lineup complete event
- Server marks player as complete
- If all players are complete, end draft
## Draft Over
- Emit draft over event
- Room manager disconnects sockets and clears room entry from map