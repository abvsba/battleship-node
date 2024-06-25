require("dotenv").config();
//require('./util/createTable');

const userRoute = require('./router/user');

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors());

app.use('/users', userRoute);

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Listening on port ${port}`));

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4200",
  },
});

const games = {};

io.on("connection", (socket) => {
  let playerIndex;
  let enemyIndex;
  let gameId;

  socket.on("joinGame", (id) => {
    gameId = id;
    let playerCount = 0;

    if (!games[id]) {
      games[id] = {
        players: new Array(2),
        turn: Math.random() > 0.5 ? 0 : 1,
        readyCount: 0,
        nextIndex: 0,
        ships: new Array(2)
      };
    }
    else {
      playerCount = games[gameId].players.reduce((playerCount, player) => playerCount + (player !== undefined ? 1 : 0), 0);
    }

    if (playerCount === 2) {
      console.error(`Maximum user reached`);
    }
    else {
      playerIndex = games[id].nextIndex++;
      enemyIndex = 1 - playerIndex;
      games[id].players[playerIndex] = socket.id;

      console.log(`Client ${socket.id} joined game: ${id}.`);

      if (++playerCount === 2) {
        games[gameId].players.forEach((player, index) => {
          io
              .to(player)
              .emit("enemyConnected");
        });
      }
    }
  });

  socket.on("disconnect", () => {
    games[gameId].players[playerIndex] = undefined;

    games[gameId] = {
      ...games[gameId],
      turn: Math.random() > 0.5 ? 0 : 1,
      readyCount: 0,
      nextIndex: playerIndex,
    };

    console.log(`Player [${socket.id}] disconnected from the lobby.`);


    if (!games[gameId].players[enemyIndex]) {
      games[gameId] = undefined;
      console.log(`Both players have left the game`);
    } else {
      io
          .to(games[gameId].players[enemyIndex])
          .emit("enemyDisconnected");
    }
  });


  socket.on("playerReady", (ships) => {
    console.log(`Player [${socket.id}] is ready.`);

    games[gameId].ships[playerIndex] = ships;

    io
        .to(games[gameId].players[enemyIndex])
        .emit("enemyReady");

    if (++games[gameId].readyCount === 2) {
      games[gameId].players.forEach((player, index) => {
        io
          .to(player)
          .emit("bothPlayersReady", games[gameId].ships[1-index], games[gameId].turn === index);
      });
      console.log(`Both players [${games[gameId].players}] are ready.`);
    }

  });


  socket.on("clickCell", (row, col) => {
    io
      .to(games[gameId].players[enemyIndex])
      .emit("clickCellReply", row, col);
  });

});

module.exports = app;
