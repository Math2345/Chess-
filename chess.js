class Game {
    constructor(board) {
        this.storage = [];
        this.board = board;
        this.player = 'white';
        this.counterMove = 0;
        this.killedFigures = [];
        this.errors = null;
    }

    /**
     *   метод startGame - запускаем игру. Генерируем доску и раставляем фигуры, далее сохраняем растоновку в storage
     */
    startGame() {
        const board = this.board.resetMap();
        this.storage.push(board);

        this.initErrors();
    }

    initErrors() {
        this.errors = {
            valid: 'Неверные координаты',
            player: 'Сейчас ходит соперник',
            validMove: 'Ход не верный'
        }
    }

    /**
     * Ищем фигуру на заданной позиции
     * @param pos  - позиции, на которой лежит фигура
     * @param storage - объект, где храняться фигуры
     * @returns {*} - вернет фигуру
     */

    static searchFigure(pos, storage) {
        return storage[pos];
    }

    /**
     * Проверяем тип игрока
     * @param typePlayer - тип либо черный либо белый
     * @returns {boolean} - если тип верен возвращаем true, иначе false
     */

    checkPlayer(typePlayer) {
        return typePlayer === this.player;
    }

    /**
     * Проверяяем на можно ли сделать ход по заданной траектории
     * @param startPos - страртовая позиуия
     * @param endPos - конечная позиция
     * @returns {boolean|boolean|*} - вернет true если все условия для этого выполнены
     */
    canMove(startPos, endPos) {
        const lastChangeGame = this.storage[this.storage.length - 1];
        const myFigure = Game.searchFigure(startPos, lastChangeGame);
        const otherFigure = Game.searchFigure(endPos, lastChangeGame);

        const canMoveFrom = this.canMoveFrom(startPos, myFigure);
        const canMoveTo = this.canMoveTo(endPos, otherFigure);
        if (!canMoveFrom) {
            return false;
        }

        let isCorrectMove = false;

        if (myFigure instanceof Rock || myFigure instanceof Bishop || myFigure instanceof Queen) {
            isCorrectMove = myFigure.checkMove(startPos, endPos, lastChangeGame, myFigure);

        } else {
            isCorrectMove = myFigure.checkMove(startPos, endPos, myFigure, lastChangeGame);
        }

        return canMoveFrom && canMoveTo && isCorrectMove;
    }


    /**
     *  Проверяем на наличие фигуры и на соотвествие цвета фигуры с цветом игрока в стартовой позиции
     * @param pos - стартовая позиция
     * @param figure - фигура, лежащая на этой позиции
     * @returns {boolean} - вернет true если на позиции pos есть фигура или цвет фигуры и цвет игрока не совпадают
     */
    canMoveFrom(pos, figure) {

        if (!figure || figure.color !== this.player) {
            return false;
        } else {
            return true;
        }
    }
    /**
     *  Проверяем на наличие фигуры и на соотвествие цвета фигуры с цветом игрока в конечной позиции
     * @param pos - конечная позиция
     * @param figure - фигура, лежащая на этой позиции
     * @returns {boolean} - вернет true если на позиции pos есть фигура или цвет фигуры и цвет игрока не совпадают
     */
    canMoveTo(pos, figure) {

        if (!figure || figure.color !== this.player) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Переключатель между игроками
     * @returns {string} - вернет состояние либо 'black' либо 'white'
     */

    switcherPlayer() {
        return (this.player === 'white') ? 'black' : 'white';
    }


    /**
     * Осуществляем движение фигуры по заданной траектории, если траектория не верна вернется ошибка!!!
     * @param typePlayer  - тип игрока
     * @param startPos - страртовая позиция
     * @param endPos  - конечная позиция
     * @returns {string}
     */
    move(typePlayer, startPos, endPos) {

        // проверяем валидные ли данные
        if (!(startPos && endPos && typeof startPos === 'string' && typeof endPos === "string")) return this.errors.valid;
        const isRightTypePlayer = this.checkPlayer(typePlayer);

        // проверяем тип игрока, игроки должны меняться поочередно, начиная с белого
        if (!isRightTypePlayer) return this.errors.player;

        const canMove = this.canMove(startPos, endPos);

        // проверяем на определение фигуры и на наличие совпадения цвета игрока с цветом фигуры, а также на всевозможные ходы фигуры
        if (!canMove) return this.errors.validMove;

        const storage = this.storage[this.storage.length - 1];
        const figure = Game.searchFigure(startPos, storage);

        const newMap = this.board.changeMap(startPos, endPos, figure, this.storage[this.storage.length - 1]);
        this.storage.push(newMap);

        console.log(this.storage);

        this.player = this.switcherPlayer();
    }

    getStorage() {
        return this.storage;
    }
}

class Board {

    constructor() { }

    static #sizeBoard = 8;

    /**
     * Генерируем доску и раставляем фигуры
     * @returns {{}} - возворащаем расположение фигур
     */
    resetMap() {
        const map = {};

        for (let i = 1; i <= Board.#sizeBoard; i++) {
            for (let j = 1; j <= Board.#sizeBoard; j++) {
                let pos = `${j}${i}`;

                if (i === 2) {
                    map[pos] = new Pawn('white');
                } else if (i === 7) {
                    map[pos] = new Pawn('black');
                } else if (i === 1 && (j === 1 || j === 8)) {
                    map[pos] = new Rock('white');
                } else if (i === 8 && (j === 1 || j === 8)) {
                    map[pos] = new Rock('black');
                } else if (i === 1 && (j === 2 || j === 7)) {
                    map[pos] = new Knight('white');
                } else if (i === 8 && (j === 2 || j === 7)) {
                    map[pos] = new Knight('black');
                } else if (i === 1 && (j === 3 || j === 6)) {
                    map[pos] = new Bishop('white')
                } else if (i === 8 && (j === 3 || j === 6)) {
                    map[pos] = new Bishop('black');
                } else if (i === 1 && j === 4) {
                    map[pos] = new Queen('white');
                } else if (i === 8 && j === 4) {
                    map[pos] = new Queen('black');
                } else if (i === 1 && j === 5) {
                    map[pos] = new King('white');
                } else if (i === 8 && j === 5) {
                    map[pos] = new King('black');
                }
            }
        }

        return map;
    }

    /**
     * Изменяем расположение фигуры, перегенерирум шахм.доску
     * @param pos - начальная позиция фигуры
     * @param nextPos - конечная позиция фигуры
     * @param myFigure - сама фигура
     * @param map - последние изменения
     * @returns {*}
     */
    changeMap(pos, nextPos, myFigure, map) {
        const newMap = Object.assign({}, map);
        let copyFigure;

        if (myFigure instanceof Pawn) {
            copyFigure = Object.assign(new Pawn(), myFigure);
        } else if (myFigure instanceof Rock) {
            copyFigure = Object.assign(new Rock(), myFigure);
        } else if (myFigure instanceof Bishop) {
            copyFigure = Object.assign(new Bishop(), myFigure);
        } else if (myFigure instanceof Queen) {
            copyFigure = Object.assign(new Queen(), myFigure);
        } else if (myFigure instanceof King) {
            copyFigure = Object.assign(new King(), myFigure);
        } else if (myFigure instanceof Knight) {
            copyFigure = Object.assign(new Knight(), myFigure);
        }

        delete newMap[pos];
        newMap[nextPos] = copyFigure;

        return newMap;
    }
}



class Figure {

    constructor(color) {
        this.color = color;
    }

    isOnMapFigure(st, storage) {
        const keys = Object.keys(storage);

        return keys.some((pos => st === pos));
    }

    isCorrectLineMove(st, end, data, figure) {
        let delta_x = Math.sign(end.x - st.x);
        let delta_y = Math.sign(st.y - end.y);

        if (figure instanceof Bishop) {
            if (Math.abs(delta_x) + Math.abs(delta_y) != 2) {
                return false;
            }
        } else if (figure instanceof Rock) {
            if (Math.abs(delta_x) + Math.abs(delta_y) != 1) {
                return false;
            }
        }

        do {
            st.x += delta_x;
            st.y += delta_y;

            if (st.x === end.x && st.y === end.y) return true;

            if (this.isOnMapFigure(st.x.toString() + st.y.toString(), data)) {
                return false;
            }

        } while (st.x >= 1 && st.x <= 8 && st.y >= 1 && st.y <= 7)

        return true;
    }

    convertToObj(str) {

        const x = +str[0];
        const y = +str[1];

        return { x, y };
    }
}

class Pawn extends Figure {
    #isAnotherFigure;

    constructor(color, pos) {
        super(color, pos);

        this.#isAnotherFigure = false;
    }

    isCorrectPawnMove(startPos, endPos, storage, sign) {
        const st = this.convertToObj(startPos);
        const end = this.convertToObj(endPos);

        if (st.y < 2 || st.y > 7) return false;
        if (this.isOnMapFigure(endPos, storage)) {
            if (Math.abs(end.x - st.x) !== 1) return false;
            return end.y - st.y === sign;
        }
        if (end.x !== st.x) return false;
        if (end.y - st.y === sign) return true;
        if (end.y - st.y === sign * 2) {
            const newSt = st.x.toString() + (st.y + sign).toString();

            return !this.isOnMapFigure(newSt, storage);
        }
    }

    checkMove(startPos, endPos, figure, storage) {
        if (figure.color === "white") return this.isCorrectPawnMove(startPos, endPos, storage, +1);
        if (figure.color === "black") return this.isCorrectPawnMove(startPos, endPos, storage, -1)
    }
}

class Rock extends Figure {
    constructor(color, pos) {
        super(color, pos);
    }

    checkMove(startPos, endPos, storage, figure) {
        const st = this.convertToObj(startPos);
        const end = this.convertToObj(endPos);

        return this.isCorrectLineMove(st, end, storage, figure);
    }
}

class Knight extends Figure {
    constructor(color, pos) {
        super(color, pos);
    }

    checkMove(startPos, endPos) {
        let isRightMove = false;

        const dx = +endPos['0'] - +startPos['0'];
        const dy = +endPos['1'] - +startPos['1'];

        if ((Math.abs(dx) === 1 && Math.abs(dy) === 2) || (Math.abs(dx) === 2 && Math.abs(dy) === 1)) {
            isRightMove = true;
        }

        return isRightMove;
    }
}

class Bishop extends Figure {
    constructor(color, pos) {
        super(color, pos);
    }

    checkMove(startPos, endPos, storage, figure) {
        const st = this.convertToObj(startPos);
        const end = this.convertToObj(endPos);

        return this.isCorrectLineMove(st, end, storage, figure);
    }
}

class Queen extends Figure {
    constructor(color, pos) {
        super(color, pos);
    }

    checkMove(startPos, endPos, storage) {
        const st = this.convertToObj(startPos);
        const end = this.convertToObj(endPos);

        return this.isCorrectLineMove(st, end, storage);
    }
}

class King extends Figure {
    constructor(color, pos) {
        super(color, pos);
    }

    checkMove(startPos, endPos) {
        let isRightMove = false;

        const dx = +endPos['0'] - +startPos['0'];
        const dy = +endPos['1'] - +startPos['1'];

        if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
            isRightMove = true;
        }

        return isRightMove;
    }
}


const game = new Game(new Board());

game.startGame();

console.log(game.move('white', '42', '44')); // ход верный (ход пешкой)
console.log(game.move('black', '47', '45'));  // ход верный (ход пешкой)
console.log(game.move('white', '62', '63')); // ход верный (ход пешкой)
console.log(game.move('black', '28', '36')); // ход верный (ход конем)
console.log(game.move('black', '28', '36')); // ход верный (ход конем)