const bidService = require('../services/bidService');

const bidItem = async (ws, req) => {
  const userId = req.userId;
  const { itemId } = req.params;

  ws.on('message', bidService.bidItemService(message, itemId, userId));

  ws.on('close', () => {
    console.log('WebSocket disconnected');
  });
};

module.exports = {
  bidItem,
};
