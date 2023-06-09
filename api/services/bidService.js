const { WebSocketServer, WebSocket } = require("ws");

const { bidDao } = require("../models");

const createWebSocketServer = async (itemId) => {
  try {
    const data = await bidDao.getWebSocketServerByItemId(itemId);

    const webSocketServerObj = data[0];

    let wss = new WebSocketServer({ noServer: true });
    if (!webSocketServerObj) {
      await bidDao.setWebSocketServerByItemId(itemId, JSON.stringify(wss));
    } else {
      Object.assign(wss, webSocketServerObj);
    }

    wss.on("connection", function connection(ws) {
      ws.on("message", async function message(message) {
        const buffer = Buffer.from(message);
        const bidPriceString = buffer.toString("utf8");
        const bidPrice = +bidPriceString;

        if (isNaN(bidPrice)) {
          ws.send("숫자만 입력하세요.");
        } else {
          await bidDao.makeBids(itemId, ws.buyer_id, bidPrice);
          await bidDao.calculateBidChangeRate(itemId);
          const result = await bidDao.checkIfHighestBidderBidsAgain(
            ws.buyer_id,
            itemId
          );

          wss.clients.forEach(async function each(client) {
            const data = await bidDao.getBidsByBuyerIdAndItemId(
              ws.buyer_id,
              itemId
            );
            client.send(JSON.stringify(data), { binary: false });
          });
        }
      });
    });

    return wss;
  } catch (err) {
    console.log(`CREATE_WEBSOCKET_SERVER_ERROR: ${err}`);
  }
};

const getBidsByBuyerIdAndItemId = async (buyerId, itemId) => {
  return bidDao.getBidsByBuyerIdAndItemId(buyerId, itemId);
};

const deleteWebSocketServerByItemId = async (itemId) => {
  bidDao.deleteWebSocketServerByItemId(itemId);
};

const getBidsByBuyerId = async (buyerId) => {
  return bidDao.getBidsByBuyerId(buyerId);
};

module.exports = {
  createWebSocketServer,
  getBidsByBuyerIdAndItemId,
  deleteWebSocketServerByItemId,
  getBidsByBuyerId,
};
