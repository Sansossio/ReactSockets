// Imports
const socketIo = require('socket.io-client');
const Protocols = require('../Schemas/Protocols');
const { registerAtPool, SendToPool, ConnectionsPool } = require('../Pool');

// SocketIO
const SocketIO = function SocketIO(props, context, updater) {
  // Call parent
  Protocols.call(this, props, context, updater);
  // Properties
  this.needParams = ['url'];
  this.myBaseName = this.constructor.name;
  this.SocketClient = null;
};

// Inheritance
SocketIO.prototype = Object.create(Protocols.prototype);
SocketIO.prototype.constructor = SocketIO;

// Override methods
// Publish
SocketIO.prototype.Publish = function (tail, message) {
  // This
  const self = this;
  // Get server
  self.getServer()
    .then((server) => {
      // Parser message
      const msg = typeof message === 'object' ? JSON.stringify(message) : message;
      try {
        // Send message
        server.emit(tail, msg);
      } catch (errorSend) { // Error handler
        // Resend in 0.5 s
        setTimeout(() => {
          self.Publish(message);
        }, 500);
        // Error handler
        self.OnError(errorSend);
      }
    })
    .catch(e => self.OnError(e));
};
// Subscribe
SocketIO.prototype.Subscribe = function (t) {
  // Topics
  let topic = t;
  // This
  const self = this;
  // Topics
  if (!Array.isArray(topic)) topic = [t];
  // Loop
  topic.forEach((tp) => {
    // Handler
    self.SocketClient.on(tp, msg => SendToPool(msg));
  });
};
// Handler basic
SocketIO.prototype.handlerBasic = function (resolve, reject) {
  // This
  const self = this;
  // Handler events
  // Open connection
  self.SocketClient.on('connect', () => {
    // Wait for connection
    if (self.SocketClient && self.SocketClient.readyState === 1) {
      // Resolve
      resolve(self.SocketClient);
    } else {
      // Wait for connection 0.5s
      setTimeout(() => {
        // Resend basics
        self.handlerBasic(resolve, reject);
      }, 500);
    }
  });
  // Error handler
  self.SocketClient.on('error', (myError) => {
    // Error handlers
    reject(myError);
    self.OnError(myError);
  });
  // Close event
  self.SocketClient.on('close', () => {
    // Error handlers
    self.OnClose();
    // Reconnected
    setTimeout(() => {
      self.OnClose()
        .then(resolve)
        .catch(reject);
    }, 1000);
  });
  // Save pool
  registerAtPool(self);
};
// Get server
SocketIO.prototype.getServer = function () {
  // This
  const self = this;
  // Logic response
  const response = (resolve, reject) => {
    // Comprobe
    if (!self.SocketClient) {
      // Create connection
      // Properties
      const serverRoute = `${self.url}`;
      // Find if exists
      // Only a connection by component to a equal server route
      if (ConnectionsPool[serverRoute]) {
        // Pass by pointer
        self.SocketClient = ConnectionsPool[serverRoute];
        // Register pool
        registerAtPool(self);
        // Return server
        resolve(self.SocketClient);
      } else {
        // Register if not exists
        // Instance new server
        /* eslint-disable no-undef */
        self.SocketClient = socketIo(serverRoute);
        // Save connection
        ConnectionsPool[serverRoute] = self.SocketClient;
        // Handler events
        self.handlerBasic(resolve, reject);
        /* eslint-enable no-undef */
      }
    } else {
      // Response connection
      resolve(self.SocketClient);
    }
  };

  return new Promise(response);
};
// Errors
SocketIO.prototype.OnClose = function () {
  return this.getServer();
};

// Export
module.exports = SocketIO;
