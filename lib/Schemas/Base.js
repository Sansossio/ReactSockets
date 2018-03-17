// Imports
const { Component } = require('react');
const camelCase = require('camelcase');

// Information
const nodePackage = require('../../package.json');

// Base module
const Base = function (props, context, updater) {
  // Call component
  Component.call(this, props, context, updater);
};

// Inheritance
Base.prototype = Object.create(Component.prototype);
Base.prototype.constructor = Base;

// Internal methods
// Get keys trust name
Base.prototype.getKeyStoreName = function () {
  return `keysStorage${this.constructor.name}`;
};
// Set keystrust
Base.prototype.setKeysTrust = function (keys) {
  // Comprobe
  const myKeys = !Array.isArray(keys) ? [] : keys;
  // Name storage
  const name = this.getKeyStoreName();
  // Set
  if (!this[name]) this[name] = [];
  // Parser keys
  const nextKeys = [];
  // Create
  const createField = (pname, property = null) => ({ pname, property });
  // Loop
  myKeys.forEach((val) => {
    // Comprobe type
    if (typeof val === 'object') {
      const oKeys = Object.keys(val);
      oKeys.forEach((key) => {
        // New key
        const thisKey = createField(key, val[key]);
        // Push
        nextKeys.push(thisKey);
      });
      return;
    }
    nextKeys.push(createField(val));
  });
  // Add keys
  this[name] = nextKeys;
};
// Get keys trust
Base.prototype.getKeysTrust = function () {
  // Name storage
  const name = this.getKeyStoreName();
  // Response
  return this[name] || ['*'];
};
// Validate keys
Base.prototype.KeysValidation = function (o) {
  // This
  const self = this;
  // Property
  const keysTrust = self.getKeysTrust();
  let obj = o;
  // Logic response
  const lResponse = (resolve, reject) => {
    // Response
    const response = {};
    // Comprobe
    if (typeof obj !== 'object') {
      // Parser new json
      try {
        obj = JSON.parse(o);
      } catch (e) {
        reject(e); // Send error of parser
      }
    }
    // Extract all keys
    const keys = Object.keys(obj);
    // Comprobe conditional
    const condKey = keysTrust.filter(val => val.pname === '*').length;
    if (condKey > 0) resolve(obj);
    // Validation
    keys.forEach((key) => {
      // Check other
      const check = keysTrust.filter(val => val.pname === key).length;
      // Validate
      if (check > 0) {
        response[key] = obj[key];
      }
    });
    // Resolve
    resolve(response);
  };
  // Return
  return new Promise(lResponse);
};
/**
* OnMessage
* @param {string|object} message Received message
* @returns Promise
*/
Base.prototype.OnMessage = function (message) {
  // This
  const self = this;
  // Logic response
  const response = (resolve) => {
    // Validation
    const validation = self.KeysValidation(message);
    // Resolve
    resolve(validation);
  };
  // Return
  return new Promise(response);
};
/**
* OnError
* @param {object} error Error
* @description Error handler
*/
Base.prototype.OnError = function (err) {
  // Error
  let error = err;
  if (!(error instanceof Error)) {
    error = new Error();
    error.message = err;
    error.name = 'GENERIC_ERROR';
  }
  // This
  const self = this;
  // Logic response
  const response = (resolve) => {
    resolve(`Reconnected: ${self.reconnect}, Error: ${error.name} = ${error.message}`);
  };
  // Return
  return new Promise(response);
};
/**
* OnClose
* @description Server-client connection break
*/
Base.prototype.OnClose = function () {
  // This
  const self = this;
  // Logic response
  const response = (resolve) => {
    resolve(`OnClose event, reconnect: ${self.reconnect}`);
  };
  // Return
  return new Promise(response);
};

// Information methods
/**
* Info
* @description Get information about library
* @returns String
*/
Base.prototype.Info = function () {
  // Extract info
  const { version, name } = nodePackage;
  // Response
  return `Library info:\n\tName: ${camelCase(name)}\n\tVersion: ${version}`;
};

// Export
module.exports = Base;
