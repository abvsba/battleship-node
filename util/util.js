

function toCell(head) {
    if (head) {
        const newHead = head.split(',');
        return { row: parseInt(newHead[0]), col: parseInt(newHead[1]) };
    }
    return null;
}

function toBoolean(number) {
    return number === 1
}

exports.convertShip = (ship) => {
    ship.head = toCell(ship.head);
    ship.oldHead = toCell(ship.oldHead);
    ship.isHorizontal = toBoolean(ship.isHorizontal);
};
