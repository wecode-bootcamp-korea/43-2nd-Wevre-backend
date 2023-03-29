const http = require("http");
const url = require("url");
const cron = require("cron");
const jwt = require("jsonwebtoken");

const { createApp } = require("./app");
const dataSource = require("./api/models/dataSource");
const bidService = require("./api/services/bidService");
const { checkIfBidEnded } = require("./api/utils/validator");

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
      const items = await dataSource.query(
        `
        SELECT 
          id,
          bidding_start,
          bidding_end
        FROM items
        `
      );

      items.forEach(async (item) => {
        const itemId = item.id;

        if (webSocketServers[itemId] && checkIfBidEnded(item.bidding_end)) {
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
      const user = await userDao.getUserById(decoded.id);
      const buyerId = user.id;

      const [item] = await dataSource.query(
        `
          SELECT 
            bidding_start,
            bidding_end
          FROM items
          WHERE id = ?
        `,
        [itemId]
      );

      if (!webSocketServers[itemId] && !checkIfBidEnded(item.bidding_end)) {
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
