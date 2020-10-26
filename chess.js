class Game {
    constructor(board, settings) {
        this.storage = [];
        this.board = board;
        this.settings = settings;
        this.player = 'white';
        this.counterMove = 0;
        this.killedFigures = [];
        this.errors = null;
    }

    startGame() {
       const board = this.board.resetMap();
       this.storage.push(board);

       this.initErrors();
    }

    initErrors() {
        this.errors = {
                valid: 'Неверные координаты',
                player: 'Сейчас ходит соперник',
                opponentFigures: 'Это фигура соперника',
                notDefined: 'Фигура не определена',
                validMove: 'Это фигура так не ходит',
                figureOnWay: 'Вы не можете сделать ход, так как на пути стоят ваши фигуры'
        }
    }

    static searchFigure(storage, pos) {
        return storage[pos];
    }

    static checkPlayer(type, player) {
        return type === player;
    }

    static checkColorFigureAndPlayer(typePlayer, figure) {
        return typePlayer === figure.color
    }

    static switcherPlayer(player) {
        return (player === 'white') ? 'black' : 'white'
    }

    static searchFiguresOnWay(startPos, endPos, storage) {
        const searchFigures = [];

        for (let figurePos in storage) {
            const x = +figurePos[0];
            const y = +figurePos[1];

            if ((startPos.x < x && x <= endPos.x) && (startPos.y < y && y <= endPos.y)) {
                searchFigures.push(storage[figurePos]);
            }
        }

        if (searchFigures.length !== 0) {
            return searchFigures;
        } else {
            return false;
        }
    }

    static killFigure(color, figures) {
        const killFigure = figures.find( figure => figure.color === color );

        if (!killFigure) return false;

        return killFigure;
    }


    move(typePlayer, startPos, endPos) {

       // проверяем валидные ли данные
       if (startPos && endPos && typeof startPos === 'string' && typeof endPos === "string") {
           const isRightTypePlayer = Game.checkPlayer(typePlayer, this.player);

           // проверяем тип игрока, игрок должен быть либо черным либо белым и меняться поочередно
           if (isRightTypePlayer) {
               const lastChangeGame = this.storage[this.storage.length - 1];

               const myFigure = Game.searchFigure(lastChangeGame, startPos);

               // в случае если фигура не определена, метод move прекращает работу
               if (!myFigure) return this.errors.notDefined;
               const isSameColorFigureAndPlayer = Game.checkColorFigureAndPlayer(typePlayer, myFigure);

               // проверяем, чтобы игрок ходил только по своим фигурами, а не по фигурам соперника
               if (isSameColorFigureAndPlayer) {

                   const posObjSt = this.settings.convertToObj(startPos);
                   const posObjEnd = this.settings.convertToObj(endPos);

                   let isValidMove;

                   if (myFigure instanceof Pawn) {
                       isValidMove = myFigure.checkMove(this.counterMove, posObjSt, posObjEnd);
                   } else {
                       isValidMove = myFigure.checkMove(posObjSt, posObjEnd);
                   }


                   // проверяем, чтобы ход фигуры был валидным. Если ход не правильный, выйти из функции
                   if (isValidMove) {
                       const searchedFigures = Game.searchFiguresOnWay(posObjSt, posObjEnd, lastChangeGame);


                       // находим фигуры, лежащие на пути. Если их нет, то делаем ход
                       if (!searchedFigures) {

                           const nextBoardMap = this.board.changeMap(startPos, endPos, myFigure, lastChangeGame);
                           this.storage.push(nextBoardMap);


                           this.player = Game.switcherPlayer(this.player, typePlayer);
                           this.counterMove++;

                           // если есть фигура на пути, то проверяем вражеские ли фигуры, если да, то убиваем ее и становимся на ее место
                       } else {
                           const killedFigure = Game.killFigure(this.player, searchedFigures);

                           // если фигуры свои, то выводим сообщение, что так ходить нельзя
                           if (!killedFigure) {
                                return this.errors.figureOnWay;
                           }

                           console.log(this.storage);
                           this.killedFigures.push(killedFigure);

                           const nextBoardMap = this.board.changeMap(startPos, killedFigure.pos, myFigure, lastChangeGame);
                           this.storage.push(nextBoardMap);

                           this.player = Game.switcherPlayer(this.player, typePlayer);
                           this.counterMove++;
                       }

                   } else {
                       return this.errors.validMove
                   }

               } else {
                   return this.errors.opponentFigures;
               }

          } else  {
               return this.errors.player;
           }
       } else {
           return this.errors.valid;
       }
    }

    getStorage() {
        return this.storage;
    }

    getCounterMove() {
        return `C начала игры прошло ${this.counterMove} ходов`;
    }

}

class Board {
    #mapFigures;

    constructor() {
       this.#mapFigures = {};
    }

    static #sizeBoard = 8;

    // генерируем шахматное поле и располагаем на нем фигуры
    resetMap() {

        for (let i = 1; i <= Board.#sizeBoard; i++) {
            for (let j = 1; j <= Board.#sizeBoard; j++) {
                let pos = `${j}${i}`;

                if (i === 2) {
                    this.#mapFigures[pos] =  new Pawn('white', pos);
                } else if (i === 7) {
                    this.#mapFigures[pos] =  new Pawn('black', pos);
                } else if (i === 1 && (j === 1 || j === 8)) {
                    this.#mapFigures[pos] =  new Rock('white', pos);
                } else if (i === 8 && (j === 1 || j === 8)) {
                    this.#mapFigures[pos] =  new Rock('black', pos);
                } else if  (i === 1 && (j === 2 || j === 7)) {
                    this.#mapFigures[pos] =  new Knight('white', pos);
                } else if (i === 8 && (j === 2 || j === 7)) {
                    this.#mapFigures[pos] =  new Knight('black', pos);
                } else if (i === 1 && (j === 3 || j === 6)) {
                    this.#mapFigures[pos] =  new Bishop('white', pos)
                } else if (i === 8 && (j === 3 || j === 6)) {
                    this.#mapFigures[pos] =  new Bishop('black', pos);
                } else if (i === 1 && j === 4) {
                    this.#mapFigures[pos] =  new Queen('white', pos);
                } else if (i === 8 && j === 4) {
                    this.#mapFigures[pos] =  new Queen('black', pos);
                } else if (i === 1 && j === 5) {
                    this.#mapFigures[pos] =  new King('white', pos);
                } else if (i === 8 && j === 5) {
                    this.#mapFigures[pos] =  new King('black', pos);
                }
            }
        }

        return this.#mapFigures;
    }

    // изменяем шахматное поле. Меняем растановку фигур
    changeMap(pos, nextPos, myFigure, storage) {
        const copyMap = Object.assign({}, storage);

        delete copyMap[pos];
        copyMap[nextPos] = myFigure;

        return copyMap
    }
}

class Figure {

    constructor(color, pos) {
        this.color = color;
        this.pos = pos;
    }
}

class Pawn extends Figure {
    #isAnotherFigure;

    constructor(color, pos) {
        super(color, pos);

        this.#isAnotherFigure = false;
        this.name = 'пешка';
    }

    checkMove(counter, startPos, endPos) {
        let isRightMove = false;

        if (endPos.x >= 0 && endPos.x < 8 && endPos.y >= 0 && endPos.y < 8) {
            const dy = endPos.y - startPos.y;

            if (counter <= 2) {
                if (Math.abs(dy) === 1 || Math.abs(dy) === 2)  {
                    isRightMove = true;
                }
            } else {
                if (Math.abs(dy) === 1) {
                    isRightMove = true;
                }
            }

            return isRightMove;
        }
    }
}

class Rock extends Figure {
    constructor(color, pos) {
        super(color, pos);

        this.name = 'ладья';
    }

    checkMove(startPos, endPos) {
        let isRightMove = false;

        if (endPos.x >= 1 || endPos.x <= 8 && endPos.y >= 1 || endPos.y <= 8) {

            if (endPos.x === startPos.x || endPos.y === startPos.y) {
                isRightMove = true;
            }

            return isRightMove;
        }
    }
}

class Knight extends Figure {
    constructor(color, pos) {
        super(color, pos);

        this.name = 'конь';
    }

    checkMove(startPos, endPos) {
        let isRightMove = false;

        if (endPos.x >= 0 && endPos.x < 8 && endPos.y >= 0 && endPos.y < 8) {
            const dx = endPos.x - startPos.x;
            const dy = endPos.y - startPos.y;

            if ((Math.abs(dx) === 1 && Math.abs(dy) === 2) || (Math.abs(dx) === 2 && Math.abs(dy) === 1)) {
                isRightMove = true;
            }

            return isRightMove;
        }
    }
}

class Bishop extends Figure {
    constructor(color, pos) {
        super(color, pos);

        this.name = 'слон';
    }

    checkMove(startPos, endPos) {
        let isRightMove = false;

        if (endPos.x >= 0 && endPos.x < 8 && endPos.y >= 0 && endPos.y < 8) {
            const dx = endPos.x - startPos.x;
            const dy = endPos.y - startPos.y;

            if (Math.abs(dx) ===  Math.abs(dy)) {
                isRightMove = true;
            }

            return isRightMove;
        }
    }
}

class Queen extends Figure {
    constructor(color, pos) {
        super(color, pos);

        this.name = 'ферзь';
    }

    checkMove(startPos, endPos) {
        let isRightMove = false;

        if (endPos.x >= 0 && endPos.x < 8 && endPos.y >= 0 && endPos.y < 8) {
            const dx = endPos.x - startPos.x;
            const dy = endPos.y - startPos.y;

            if ((Math.abs(dx) === Math.abs(dy)) || ((startPos.x === endPos.y) || (startPos.y === endPos.y))) {
                isRightMove = true;
            }

            return isRightMove;
        }
    }
}

class King extends Figure {
    constructor(color, pos) {
        super(color, pos);

        this.name = 'король';
    }

    checkMove(startPos, endPos) {
        let isRightMove = false;

        if (endPos.x >= 0 && endPos.x < 8 && endPos.y >= 0 && endPos.y < 8) {
            const dx = endPos.x - startPos.x;
            const dy = endPos.y - startPos.y;

            if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
                isRightMove = true;
            }

            return isRightMove;
        }
    }
}

class Settings {
    constructor() {}

    convertToObj(str) {
        const x = +str[0];
        const y = +str[1];

        return { x, y };
    }
}

const game = new Game(new Board(), new Settings());

game.startGame();

console.log(game.move('white', '12', '14'));
//game.move('black', '57', '55');
//console.log(game.move('white', '11', '14'));







