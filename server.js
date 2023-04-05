const http = require("http");
const url = require("url");
const cron = require("cron");
const jwt = require("jsonwebtoken");

const { createApp } = require("./app");
const dataSource = require("./api/models/dataSource");
const bidService = require("./api/services/bidService");
const itemService = require("./api/services/itemService");
const { checkIfBidEnded } = require("./api/utils/validator");
const { BID_STATUS_ID } = require("./api/utils/enum");

const webSocketServers = {};

const startServer = async () => {
  const app = createApp();
  const server = http.createServer(app);

  await dataSource
    .initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((error) => {
      console.error("Error during Data Source initialization", error);
    });

  const PORT = process.env.PORT || 8001;

  const cronJob = new cron.CronJob("* * * * *", async () => {
    try {
      const items = await itemService.getAllBidStatus();

      items.forEach(async (item) => {
        const itemId = item.id;

        if (webSocketServers[itemId] && checkIfBidEnded(item.bid_status_id)) {
          webSocketServers[itemId].clients.forEach((client) => {
            client.terminate();
          });

          webSocketServers[itemId].close();
          delete webSocketServers[itemId];
        }
      });
    } catch (err) {
      console.log(`CRON_JOB_ERROR: ${err}`);
    }
  });

  cronJob.start();

  server.on("upgrade", async function upgrade(request, socket, head) {
    try {
      const pathname = url.parse(request.url).pathname;
      const accessToken = url.parse(request.url, true).query.accessToken;
      const itemId = parseInt(pathname.match(/\d+/)[0], 10);

      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
      const buyerId = decoded.userId;

      const [item] = await itemService.getBidStatusByItemId(itemId);

      if (!webSocketServers[itemId] && !checkIfBidEnded(item.bid_status_id)) {
        webSocketServers[itemId] = await bidService.createWebSocketServer(
          itemId,
          buyerId
        );
      }

      const wss = webSocketServers[itemId];

      if (wss) {
        wss.handleUpgrade(request, socket, head, function done(ws) {
          wss.emit("connection", ws);
        });
      } else {
        socket.destroy();
      }
    } catch (err) {
      console.log(`SERVER_UPGRADE_ERROR: ${err}`);
    }
  });

  server.listen(process.env.PORT, process.env.HOST, () =>
    console.log(
      `Server is listening on ${process.env.HOST}:${process.env.PORT}`
    )
  );
};

startServer();
