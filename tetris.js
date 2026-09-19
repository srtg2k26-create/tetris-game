/* =========================================================
   TETRIS GAME
========================================================= */


const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


const nextCanvas =
    document.getElementById("nextCanvas");

const nextCtx =
    nextCanvas.getContext("2d");


/* =========================================================
   BOARD
========================================================= */

const COLS = 10;
const ROWS = 20;

const BLOCK = 30;


/* =========================================================
   COLORS
========================================================= */

const COLORS = [

    null,

    "#00ffff", // I
    "#ffff00", // O
    "#aa00ff", // T
    "#0000ff", // J
    "#ff7b00", // L
    "#00ff44", // S
    "#ff1744"  // Z
];


/* =========================================================
   PIECES
========================================================= */

const PIECES = [

    null,

    // I
    [
        [1, 1, 1, 1]
    ],

    // O
    [
        [2, 2],
        [2, 2]
    ],

    // T
    [
        [0, 3, 0],
        [3, 3, 3]
    ],

    // J
    [
        [4, 0, 0],
        [4, 4, 4]
    ],

    // L
    [
        [0, 0, 5],
        [5, 5, 5]
    ],

    // S
    [
        [0, 6, 6],
        [6, 6, 0]
    ],

    // Z
    [
        [7, 7, 0],
        [0, 7, 7]
    ]
];


/* =========================================================
   GAME VARIABLES
========================================================= */

let board;

let currentPiece;

let nextPiece;

let score = 0;

let lines = 0;

let level = 1;

let dropCounter = 0;

let lastTime = 0;

let dropInterval = 800;

let gameRunning = true;


/* =========================================================
   CREATE BOARD
========================================================= */

function createBoard() {

    return Array.from(
        { length: ROWS },
        () => Array(COLS).fill(0)
    );

}


/* =========================================================
   RANDOM PIECE
========================================================= */

function randomPiece() {

    const index =
        Math.floor(
            Math.random() * 7
        ) + 1;

    return {

        matrix:
            PIECES[index]
                .map(row => [...row]),

        x:
            Math.floor(
                COLS / 2
            ) - 1,

        y: 0
    };

}


/* =========================================================
   DRAW BLOCK
========================================================= */

function drawBlock(
    context,
    x,
    y,
    color,
    size
) {

    context.fillStyle = color;

    context.fillRect(
        x * size,
        y * size,
        size,
        size
    );


    context.strokeStyle =
        "rgba(0,0,0,0.45)";

    context.lineWidth = 2;

    context.strokeRect(
        x * size,
        y * size,
        size,
        size
    );


    // Highlight

    context.fillStyle =
        "rgba(255,255,255,0.18)";

    context.fillRect(
        x * size + 3,
        y * size + 3,
        size - 6,
        4
    );

}


/* =========================================================
   DRAW MATRIX
========================================================= */

function drawMatrix(
    matrix,
    offset,
    context = ctx,
    size = BLOCK
) {

    matrix.forEach(
        (row, y) => {

            row.forEach(
                (value, x) => {

                    if (value !== 0) {

                        drawBlock(
                            context,
                            x + offset.x,
                            y + offset.y,
                            COLORS[value],
                            size
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   DRAW BOARD
========================================================= */

function drawBoard() {

    ctx.fillStyle = "#050505";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawMatrix(
        board,
        { x: 0, y: 0 }
    );


    if (currentPiece) {

        drawMatrix(
            currentPiece.matrix,
            {
                x: currentPiece.x,
                y: currentPiece.y
            }
        );

    }

}


/* =========================================================
   COLLISION
========================================================= */

function collide(
    board,
    player
) {

    const matrix =
        player.matrix;

    const offset =
        player;


    for (
        let y = 0;
        y < matrix.length;
        ++y
    ) {

        for (
            let x = 0;
            x < matrix[y].length;
            ++x
        ) {

            if (
                matrix[y][x] !== 0 &&

                (
                    board[y + offset.y] === undefined ||

                    board[y + offset.y]
                        [x + offset.x] !== 0
                )
            ) {

                return true;

            }

        }

    }

    return false;

}


/* =========================================================
   MERGE
========================================================= */

function merge(
    board,
    player
) {

    player.matrix.forEach(
        (row, y) => {

            row.forEach(
                (value, x) => {

                    if (value !== 0) {

                        board[
                            y + player.y
                        ][
                            x + player.x
                        ] = value;

                    }

                }
            );

        }
    );

}


/* =========================================================
   ROTATE
========================================================= */

function rotateMatrix(matrix) {

    for (
        let y = 0;
        y < matrix.length;
        ++y
    ) {

        for (
            let x = 0;
            x < y;
            ++x
        ) {

            [
                matrix[x][y],
                matrix[y][x]
            ] =
            [
                matrix[y][x],
                matrix[x][y]
            ];

        }

    }


    matrix.forEach(
        row => row.reverse()
    );

}


/* =========================================================
   ROTATE PIECE
========================================================= */

function rotatePiece() {

    if (!gameRunning)
        return;


    const oldMatrix =
        currentPiece.matrix
            .map(row => [...row]);


    const oldX =
        currentPiece.x;


    rotateMatrix(
        currentPiece.matrix
    );


    let offset = 1;


    while (
        collide(
            board,
            currentPiece
        )
    ) {

        currentPiece.x += offset;

        offset =
            -(offset + (
                offset > 0
                    ? 1
                    : -1
            ));


        if (
            offset >
            currentPiece.matrix[0].length
        ) {

            currentPiece.matrix =
                oldMatrix;

            currentPiece.x =
                oldX;

            return;

        }

    }

}


/* =========================================================
   MOVE LEFT
========================================================= */

function moveLeft() {

    if (!gameRunning)
        return;

    currentPiece.x--;

    if (
        collide(
            board,
            currentPiece
        )
    ) {

        currentPiece.x++;

    }

}


/* =========================================================
   MOVE RIGHT
========================================================= */

function moveRight() {

    if (!gameRunning)
        return;

    currentPiece.x++;

    if (
        collide(
            board,
            currentPiece
        )
    ) {

        currentPiece.x--;

    }

}


/* =========================================================
   SOFT DROP
========================================================= */

function softDrop() {

    if (!gameRunning)
        return;


    currentPiece.y++;


    if (
        collide(
            board,
            currentPiece
        )
    ) {

        currentPiece.y--;

        lockPiece();

    }


    dropCounter = 0;

}


/* =========================================================
   HARD DROP
========================================================= */

function hardDrop() {

    if (!gameRunning)
        return;


    while (!collide(
        board,
        currentPiece
    )) {

        currentPiece.y++;

    }


    currentPiece.y--;

    lockPiece();

}


/* =========================================================
   LOCK PIECE
========================================================= */

function lockPiece() {

    merge(
        board,
        currentPiece
    );


    clearLines();


    spawnPiece();

}


/* =========================================================
   CLEAR LINES
========================================================= */

function clearLines() {

    let cleared = 0;


    outer:
    for (
        let y = ROWS - 1;
        y >= 0;
        --y
    ) {

        for (
            let x = 0;
            x < COLS;
            ++x
        ) {

            if (
                board[y][x] === 0
            ) {

                continue outer;

            }

        }


        const row =
            board.splice(y, 1)[0];


        board.unshift(
            row.fill(0)
        );


        y++;

        cleared++;

    }


    if (cleared > 0) {

        lines += cleared;


        /* Score */

        const points = {

            1: 100,
            2: 300,
            3: 500,
            4: 800

        };


        score +=
            (points[cleared] || 0)
            * level;


        level =
            Math.floor(
                lines / 10
            ) + 1;


        dropInterval =
            Math.max(
                100,
                800 -
                (level - 1) * 60
            );


        updateUI();

    }

}


/* =========================================================
   SPAWN PIECE
========================================================= */

function spawnPiece() {

    currentPiece =
        nextPiece ||
        randomPiece();


    nextPiece =
        randomPiece();


    drawNext();


    if (
        collide(
            board,
            currentPiece
        )
    ) {

        gameOver();

    }

}


/* =========================================================
   NEXT PIECE
========================================================= */

function drawNext() {

    nextCtx.fillStyle =
        "#050505";

    nextCtx.fillRect(
        0,
        0,
        nextCanvas.width,
        nextCanvas.height
    );


    if (!nextPiece)
        return;


    const matrix =
        nextPiece.matrix;


    const size = 25;


    const width =
        matrix[0].length * size;


    const height =
        matrix.length * size;


    const offsetX =
        (nextCanvas.width - width)
        / 2 / size;


    const offsetY =
        (nextCanvas.height - height)
        / 2 / size;


    drawMatrix(
        matrix,
        {
            x: offsetX,
            y: offsetY
        },
        nextCtx,
        size
    );

}


/* =========================================================
   UPDATE UI
========================================================= */

function updateUI() {

    document.getElementById(
        "score"
    ).textContent = score;


    document.getElementById(
        "lines"
    ).textContent = lines;


    document.getElementById(
        "level"
    ).textContent = level;


    document.getElementById(
        "scoreMobile"
    ).textContent = score;


    document.getElementById(
        "levelMobile"
    ).textContent = level;

}


/* =========================================================
   GAME OVER
========================================================= */

function gameOver() {

    gameRunning = false;


    document.getElementById(
        "finalScore"
    ).textContent = score;


    document.getElementById(
        "gameOver"
    ).classList.remove(
        "hidden"
    );

}


/* =========================================================
   RESTART
========================================================= */

function restartGame() {

    board =
        createBoard();


    score = 0;

    lines = 0;

    level = 1;

    dropCounter = 0;

    dropInterval = 800;

    gameRunning = true;


    document.getElementById(
        "gameOver"
    ).classList.add(
        "hidden"
    );


    currentPiece = null;

    nextPiece = null;


    spawnPiece();


    updateUI();


    drawBoard();

}


/* =========================================================
   HOME
========================================================= */

function goHome() {

    window.location.href =
        "index.html";

}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (!gameRunning)
            return;


        if (
            event.key === "ArrowLeft"
        ) {

            event.preventDefault();

            moveLeft();

        }


        else if (
            event.key === "ArrowRight"
        ) {

            event.preventDefault();

            moveRight();

        }


        else if (
            event.key === "ArrowDown"
        ) {

            event.preventDefault();

            softDrop();

        }


        else if (
            event.key === "ArrowUp"
        ) {

            event.preventDefault();

            rotatePiece();

        }


        else if (
            event.code === "Space"
        ) {

            event.preventDefault();

            hardDrop();

        }

    }
);


/* =========================================================
   GAME LOOP
========================================================= */

function update(time = 0) {

    const deltaTime =
        time - lastTime;


    lastTime = time;


    dropCounter += deltaTime;


    if (
        dropCounter >
        dropInterval
    ) {

        softDrop();

    }


    drawBoard();


    requestAnimationFrame(
        update
    );

}


/* =========================================================
   START GAME
========================================================= */

restartGame();

update();
