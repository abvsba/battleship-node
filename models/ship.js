const db = require('../util/connectionDB');

module.exports = class Ship {
    constructor(type, length, isHorizontal, isVisible, hit, head) {
        this.type = type;
        this.length = length;
        this.isHorizontal = isHorizontal;
        this.isVisible = isVisible;
        this.hit = hit;
        this.head = head;
    }


    static async saveGame(game, userid, date) {

        const results = await db.promise().execute(
            'INSERT INTO games (name, date, user_id) VALUES (?, ?, ?)', [game.name, date, userid]
        );

        let gameId = results[0].insertId;

        console.log()
        for (let i = 0; i < game.selfShips.length; i++) {
            await this.saveShip(gameId, game.selfShips[i], 'self_ships');
            await this.saveShip(gameId, game.rivalShips[i], 'rival_ships');
        }

        console.log(game.rivalBoard)

        for (let cell of game.selfBoard) {
            await this.saveCell(gameId, cell, 'self_board');
        }

        for (let cell of game.rivalBoard) {
            await this.saveCell(gameId, cell, 'rival_board');
        }

        return gameId;
    }


    static async saveShip(gameId, ship, table) {

        ship.oldHead = ship.oldHead === undefined ? null : `${ship.oldHead.row},${ship.oldHead.col}`;
        ship.head = `${ship.head.row},${ship.head.col}`;

        return db.promise().execute(
            'INSERT INTO ' + table + ' (type, length, isHorizontal, isVisible, hit, head, game_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [ship.type, ship.length, ship.isHorizontal, ship.isVisible, ship.hit, ship.head, gameId]
        );

    }


    static async saveCell(gameId, cell, table) {

        let hit = cell.hit === undefined ? null : cell.hit;

        return db.promise().execute(
            'INSERT INTO ' + table + ' (row, col, hit, game_id) VALUES (?, ?, ?, ?)',
            [cell.row, cell.col, hit, gameId]
        );

    }

}