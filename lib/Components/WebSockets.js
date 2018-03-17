// Imports
const Protocols = require('../Schemas/Protocols');
const { registerAtPool, SendToPool, ConnectionsPool } = require('../Pool');

// WebSockets
const WebSockets = function WebSockets(props, context, updater) {
  // Call parent
  Protocols.call(this, props, context, updater);
  // Properties
  this.needParams = ['protocol', 'host', 'port'];
  this.myBaseName = this.constructor.name;
  this.SocketClient = null;
};

// Inheritance
WebSockets.prototype = Object.create(Protocols.prototype);
WebSockets.prototype.constructor = WebSockets;

// Override methods
// Publish
WebSockets.prototype.Publish = function (message) {
  // This
  const self = this;
  // Get server
  self.getServer()
    .then((server) => {
      // Parser message
      const msg = typeof message === 'object' ? JSON.stringify(message) : message;
      try {
        // Send message
        server.send(msg);
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
// Listen
WebSockets.prototype.OnMessage = function (message) {
  // This
  const self = this;
  // Extract message
  const { data } = message;
  // Validation
  self.KeysValidation(data)
    .then((msg) => {
      // Update state
      self.updateState(msg);
    })
    .catch(e => self.OnError(e));
};
// Handler basic
WebSockets.prototype.handlerBasic = function (resolve, reject) {
  // This
  const self = this;
  // Handler events
  // Open connection
  self.SocketClient.onopen = function () {
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
  };
  // Error handler
  self.SocketClient.onerror = function (myError) {
    // Error handlers
    reject(myError);
    self.OnError(myError);
  };
  // Close event
  self.SocketClient.onclose = function () {
    // Error handlers
    self.OnClose();
    // Reconnected
    setTimeout(() => {
      self.OnClose()
        .then(resolve)
        .catch(reject);
    }, 1000);
  };
  // Messages
  self.SocketClient.onmessage = function (msg) {
    SendToPool(msg);
  };
  // Save pool
  registerAtPool(self);
};
// Get server
WebSockets.prototype.getServer = function () {
  // This
  const self = this;
  // Logic response
  const response = (resolve, reject) => {
    // Comprobe
    if (!self.SocketClient) {
      // Create connection
      // Properties
      const serverRoute = `${self.protocol}://${self.host}:${self.port}`;
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
        self.SocketClient = new WebSocket(serverRoute, 'echo-protocol');
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
// OnConnect
WebSockets.prototype.OnConnect = function () {
  // This
  const self = this;
  // Logic response
  const response = (resolve, reject) => {
    // Get server
    self.getServer()
      .then((server) => {
        // Resolve
        resolve(server);
      })
      .catch(reject);
  };
  // Return
  return new Promise(response);
};
// Errors
WebSockets.prototype.OnClose = function () {
  return this.getServer();
};

// Export
module.exports = WebSockets;
