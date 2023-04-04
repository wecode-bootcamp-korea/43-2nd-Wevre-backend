const { WebSocketServer, WebSocket } = require('ws');

const { bidDao } = require('../models');

const bidItemService = async (message, itemId, buyerId) => {
  return;
};

const createWebSocketServer = async (itemId, buyerId) => {
  try {
    const data = await bidDao.getWebSocketServerByItemId(itemId);

    const webSocketServerObj = data[0];

    let wss = new WebSocketServer({ noServer: true });
    if (!webSocketServerObj) {
      await bidDao.setWebSocketServerByItemId(itemId, JSON.stringify(wss));
    } else {
      Object.assign(wss, webSocketServerObj);
    }

    wss.on('connection', function connection(ws) {
      ws.buyer_id = buyerId;

      ws.on('message', async function message(message) {
        const buffer = Buffer.from(message);
        const bidPriceString = buffer.toString('utf8');
        const bidPrice = +bidPriceString;

        if (isNaN(bidPrice)) {
          ws.send('숫자만 입력하세요.');
        } else {
          await bidDao.makeBids(itemId, ws.buyer_id, bidPrice);
          await bidDao.calculateBidChangeRate(itemId);
          const result = await bidDao.checkIfHighestBidderBidsAgain(
            itemId,
            ws.buyer_id
          );

          wss.clients.forEach(async function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(`구매자 ${ws.buyer_id}번의 입찰가: ${bidPrice}원`, {
                binary: false,
              });
            }
          });
        }
      });
    });

    return wss;
  } catch (err) {
    console.log(`CREATE_WEBSOCKET_SERVER_ERROR: ${err}`);
  }
};

module.exports = {
  createWebSocketServer,
  bidItemService,
};
