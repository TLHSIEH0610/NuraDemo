import createApp from "./app.js";
import http from "http";
import { connectSocket } from "./websocket/socketConnection.js";
import { config } from "./config.js";
import { setIO } from "./websocket/broadcast.js";
import { startWeatherWatcher } from "./websocket/weatherWatcher.js";

const app = createApp();
const server = http.createServer(app);
const io = connectSocket(server);
setIO(io);
startWeatherWatcher(io);

server.listen(config.port, () => {
  console.log(`server listening on http://localhost:${config.port}`);
});
