const { createApp } = require("./app");
const dataSource = require("./api/models/dataSource");

const startServer = async () => {
  const app = createApp();

  await dataSource
    .initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((error) => {
      console.error("Error during Data Source initialization", error);
    });

  const PORT = process.env.PORT || 8001;

  app.listen(PORT, () => {
    console.log(`Listening to request on 127.0.0.1:${PORT}`);
  });
};

startServer();
