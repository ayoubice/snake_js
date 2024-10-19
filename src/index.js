const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;

const boardSize = 20
const cellSize = canvas.width / boardSize; 

const cellStates = {
    EMPTY: 0,
    SNAKE: 1,
    FOOD: 2,
}

const headDirections = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
}

const playerTypes = {
    HUMAN: 0,
    AI: 1,
}

gameState = {
    board: Array(boardSize).fill().map(() => Array(boardSize).fill(cellStates.EMPTY)),

    snakes: [
        {
            player : playerTypes.AI,
            direction : headDirections.DOWN,
            body : [
                { x: Math.floor(boardSize / 2), y: Math.floor(boardSize / 2) },
                { x: Math.floor(boardSize / 2)-1, y: Math.floor(boardSize / 2) },
                { x: Math.floor(boardSize / 2)-3, y: Math.floor(boardSize / 2) },
            ],
        },
        {
            player : playerTypes.HUMAN,
            direction : headDirections.RIGHT,
            body : [
                { x: Math.floor(boardSize / 2), y: Math.floor(boardSize / 2) },
                { x: Math.floor(boardSize / 2)-1, y: Math.floor(boardSize / 2) },
                { x: Math.floor(boardSize / 2)-3, y: Math.floor(boardSize / 2) },
            ],
        }
    ],

    foodPosition : {
        x: Math.floor(Math.random() * boardSize),
        y: Math.floor(Math.random() * boardSize)
    },

    gameOver: false,
}

gameloop = () => {
    setInterval(() => {
        update();
        draw();
    }, 1000 / 5); // 60 FPS
}

update = () => {
    if (gameState.gameOver){
        return;
    }
    
    const board = gameState.board;

    gameState.snakes.forEach(snake => {
        headPosition = {...snake.body[0]};
        tailPosition = {...snake.body[snake.body.length - 1]};

        if (snake.player === playerTypes.AI) {
            AI(snake);
        }

        newPosition = moveHead(headPosition, snake.direction);

        board[tailPosition.x][tailPosition.y] = cellStates.EMPTY;

        // check if the snake is out of bounds
        if (newPosition.x < 0 || newPosition.x >= boardSize || newPosition.y < 0 || newPosition.y >= boardSize){
            gameState.gameOver = true;

            return;
        }

        // check if the snake eats itself
        if (board[newPosition.x][newPosition.y] == cellStates.SNAKE){
            gameState.gameOver = true;

            return;
        }

        // check if the snake eats the food
        if (newPosition.x == gameState.foodPosition.x && newPosition.y == gameState.foodPosition.y){
            snake.body = [newPosition, ...snake.body];

            snake.score++

            board[gameState.foodPosition.x][gameState.foodPosition.y] = cellStates.EMPTY;
            do {
                gameState.foodPosition = {x: Math.floor(Math.random() * boardSize), y: Math.floor(Math.random() * boardSize)};
            } while (board[gameState.foodPosition.x][gameState.foodPosition.y] != cellStates.EMPTY);


        }else{
            snake.body = [newPosition, ...snake.body.slice(0, snake.body.length - 1)];
        }


        snake.body.forEach(el => {
            board[el.x][el.y] = cellStates.SNAKE;
        });
    })

    board[gameState.foodPosition.x][gameState.foodPosition.y] = cellStates.FOOD;
}

moveHead = (position, direction) => {
    newPosition = {x: position.x, y: position.y};

    switch (direction){
        case headDirections.UP:
            newPosition.y--;
            break;
        case headDirections.RIGHT:
            newPosition.x++;
            break;
        case headDirections.DOWN:
            newPosition.y++;
            break;
        case headDirections.LEFT:
            newPosition.x--;
            break;
    }

    return newPosition;
}

AI = (snake) => {
    const snakeHead = snake.body[0];
    const food = gameState.foodPosition;

    const snakeBody = snake.body.slice(1);

    const isSafe = (position) => {
        if (position.x < 0 || position.x >= boardSize || position.y < 0 || position.y >= boardSize) {
            return false;
        }
        return !snakeBody.some(segment => segment.x === position.x && segment.y === position.y);
    };

    const getDistance = (pos1, pos2) => {
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    };

    const rankMove = (move) => {
        const directions = [headDirections.UP, headDirections.RIGHT, headDirections.DOWN, headDirections.LEFT];
        let emptyCells = 0;

        directions.forEach(direction => {
            const adjacentPosition = moveHead(move.position, direction);
            if (isSafe(adjacentPosition) && gameState.board[adjacentPosition.x][adjacentPosition.y] === cellStates.EMPTY) {
                emptyCells++;
            }
        });

        return emptyCells;
    };

    
    const possibleMoves = [
        { direction: headDirections.UP, position: moveHead(snakeHead, headDirections.UP) },
        { direction: headDirections.RIGHT, position: moveHead(snakeHead, headDirections.RIGHT) },
        { direction: headDirections.DOWN, position: moveHead(snakeHead, headDirections.DOWN) },
        { direction: headDirections.LEFT, position: moveHead(snakeHead, headDirections.LEFT) },
    ];

    possibleMoves.forEach(move => {
        move.rank = rankMove(move);
    });


    const safeMoves = possibleMoves.filter(move => isSafe(move.position));
    if (safeMoves.length === 0) {
        gameState.gameOver = true;
        return;
    }

    safeMoves.sort((a, b) => {
        const distanceComparison = getDistance(a.position, food) - getDistance(b.position, food);
        if (distanceComparison !== 0) {
            return distanceComparison;
        }
        return b.rank - a.rank;
    });

    snake.direction = safeMoves[0].direction;
}


draw = () => {
    clear()

    if (gameState.gameOver){
        context.fillStyle = '#FFFFFF';
        context.font = '30px Arial';
        context.fillText('Game Over', canvas.width / 2 - 90, canvas.height / 2);

        return
    }

    drawBoard()
}

clear = () => {
    context.fillStyle = '#000000';
    context.fillRect(0, 0, canvas.width, canvas.height);
}

drawBoard = () => {
    for (let x = 0; x < boardSize; x++){
        for (let y = 0; y < boardSize; y++){
            drawCell({x, y}, gameState.board[x][y]);
        }
    }
}

drawCell = (position, state) => {
    if (position.x < 0 || position.x >= boardSize || position.y < 0 || position.y >= boardSize){
        return;
    }

    coordinate = {
        x: position.x * cellSize,
        y: position.y * cellSize
    }

    color = '#000000';

    switch (state){
        case cellStates.EMPTY:
            color = '#000000';
            break;
        case cellStates.SNAKE:
            color = '#FFFFFF';
            break;
        case cellStates.FOOD:
            color = '#FF0000';
            break;
    }

    context.fillStyle = color;
    context.fillRect(coordinate.x, coordinate.y, cellSize, cellSize);
}

controler = () => {
    window.addEventListener('keydown', (event) => {
        const player = gameState.snakes.find((snake) => {
            return snake.player === playerTypes.HUMAN;
        })

        if (!player){
            return;
        }

        switch (event.key){
            case 'ArrowUp':
                if (player.direction == headDirections.DOWN){
                    return;
                }

                player.direction = headDirections.UP;
                break;
            case 'ArrowRight':
                if (player.direction == headDirections.LEFT){
                    return;
                }

                player.direction = headDirections.RIGHT;
                break;
            case 'ArrowDown':
                if (player.direction == headDirections.UP){
                    return;
                }

                player.direction = headDirections.DOWN;
                break;
            case 'ArrowLeft':
                if (player.direction == headDirections.RIGHT){
                    return;
                }

                player.direction = headDirections.LEFT;
                break;
        }
    })
}

controler()

gameloop()
