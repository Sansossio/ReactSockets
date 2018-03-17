// Connections pool and receive info

// Properties
const OnMessagesPool = [];
const ConnectionsPool = [];

// Methods
// Send a message to all ws pools
const SendToPool = (msg) => {
  // Extract all pools
  const allPools = Object.keys(OnMessagesPool);
  // Loop
  allPools.forEach((pool) => {
    // Send to pool
    OnMessagesPool[pool](msg);
  });
};
const registerAtPool = (module) => {
  // Extract properties
  const { name } = module.constructor;
  // Register
  OnMessagesPool[name] = m => module.OnMessage(m);
};

// Export
module.exports = {
  registerAtPool,
  SendToPool, // Send message to all pool
  ConnectionsPool, // List of connections
};
