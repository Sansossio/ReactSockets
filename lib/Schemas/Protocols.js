// Imports
const Base = require('./Base');

// Protocols base
const Protocols = function (props, context, updater) {
  // Call
  Base.call(this, props, context, updater);
  // Properties
  this.needParams = [];
  this.reconnect = true;
};

// Inheritance
Protocols.prototype = Object.create(Base.prototype);
Protocols.prototype.constructor = Protocols;

// Work with static properties
// Get server
Protocols.prototype.getServer = function () {
  return Protocols.server || false;
};
// Set server
Protocols.prototype.setServer = function (server) {
  Protocols.server = server;
};

// Override react methods
Protocols.prototype.componentWillMount = function () {
  // Validate params
  if (this.ValidateParams()) {
    // Call connect
    this.OnConnect()
      .catch(e => this.OnError(e));
  } else {
    // Error definition
    const paramsError = new Error();
    paramsError.name = 'BAD_PARAMS';
    paramsError.message = 'Missing necessary params';
    // Send error
    throw paramsError;
  }
};

// Show errors
Protocols.prototype.OnError = (myError) => {
  // Call
  Base.prototype.OnError(myError)
    .then((iError) => {
      console.error(iError);
    });
  // Throw
  throw myError;
};

// Handler methods
/**
   * OnConnect
   * @description Establish connection
   */
Protocols.prototype.OnConnect = function () {
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
/**
 * Publish
 * @param message Message to publish
 * @description Publish new message
 */
Protocols.prototype.Publish = function (message) {
  // This
  const self = this;
  // Logic response
  const response = (resolve) => {
    const text = `Publish: ${message}\n${self.Info()}`;
    resolve(text);
  };
  // Return
  return new Promise(response);
};
/**
 * Subscribe
 * @param topic Topic name
 * @description Subscribe to a topic, if is necessary
 */
Protocols.prototype.Subscribe = function (topic) {
  // This
  const self = this;
  // Logic response
  const response = (resolve) => {
    const text = `Subscribe: ${topic}\n${self.Info()}`;
    resolve(text);
  };
  // Return
  return new Promise(response);
};
// Listen
Protocols.prototype.OnMessage = function (message) {
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
// Logic methods
Protocols.prototype.updateState = function (nState) {
  // This
  const self = this;
  // newState
  const newState = JSON.parse(JSON.stringify(nState));
  // Get keystrust
  const storage = self.getKeysTrust();
  // Loop
  storage.forEach((val) => {
    // Get info
    const { pname, property } = val;
    const nextValue = newState[pname];
    // Condition
    switch (property) {
      // Save all in array
      case 'storage':
        // Convert in array
        if (!Array.isArray(self.state[pname])) self.state[pname] = [];
        // Push
        newState[pname] = self.state[pname];
        newState[pname].push(nextValue);
        break;
      // Increase / concat
      case 'increment':
        newState[pname] = (self.state[pname] || 0) + newState[pname];
        break;
      // Decrement
      case 'decrement':
        newState[pname] = (self.state[pname] || 0) - newState[pname];
        break;
      default:
        newState[pname] = newState[pname];
    }
  });
  // Get all keys
  // Update state
  self.setState(newState);
};
/**
 * ValidateParams
 * @description Verif if exists all require params
 */
Protocols.prototype.ValidateParams = function () {
  // Response
  let response = true;
  // Loop
  this.needParams.forEach((param) => {
    // If not exists param, false
    if (!(param in this)) response = false;
  });
  // Return
  return response;
};

module.exports = Protocols;
