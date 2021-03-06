# React-Sockets
Manage sockets connection easily with the react power, is how a orm but of sockets :)

## General Schema
![public/reactsockets.jpeg?raw=true](public/reactsockets.jpeg?raw=true)

## How to install?
```sh
npm install --save reactsockets
```

### Accepts protocols
WebSockets
Socket.IO (Develop phase)

# WebSockets Implementation

##### Required params
- Protocol 
    - ws or wss
- Host / Ip
- Port

##### Config params
- KeysTrust
    - List of keys that are used to decode the message and update the react state

### Example
```js
// Imports
import React from 'react';
import { WebSockets } from 'reactsockets';

class ChatInput extends WebSockets {
  constructor(props) {
    // Parent
    super(props);
    // State
    this.state = {
      message: '',
    };
    // Sockets config
    this.protocol = 'ws';
    this.host = 'localhost';
    this.port = 8080;
    // KeysTrust
    this.setKeysTrust(['message']);
  }
  // Render component
  render() {
    return (
      <div id="chat-input">{this.state.message}</div>
    );
  }
}

export default ChatInput;
```

# SocketIO Implementation
##### Required params
- Url
  - Server url

##### Config params
- KeysTrust
    - List of keys that are used to decode the message and update the react state

### Example
```js
// Imports
import React from 'react';
import { SocketIO } from 'reactsockets';

class ChatInput extends SocketIO {
  constructor(props) {
    // Parent
    super(props);
    // State
    this.state = {
      message: '',
    };
    // Sockets config
    this.url = 'http://localhost:8080';
    // KeysTrust
    this.setKeysTrust([]);
  }
  // Render component
  render() {
    return (
      <div id="chat-input">{this.state.message}</div>
    );
  }
}

export default ChatInput;
```

# KeysTrust
The parametter 'keytrust' must a be an array of strings or array strings/objects

## Example
```js
const keysTrust = [
    'name',    
    { messages: 'storage' },
];
```
### Why objects?
With a object you are define type of keys, type are:
    - Storage
        - All values with this keys are save in a array
    - Increment
        - Increment previous value with the new received value
    - Decrement
        - Decrement previous value with the new received value
        
# Code example

WebSockets
<https://github.com/Sansossio/ReactSockets-Chat>

SocketIO
<https://github.com/Sansossio/ReactSockets-Chat-IO>
