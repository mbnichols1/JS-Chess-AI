document.addEventListener("DOMContentLoaded", () => {
    const boardElement = document.getElementById('chessboard');
    const statusEl = document.getElementById('status');
    const restartBtn = document.getElementById('restart');

    const initialBoard = [
        ["r", "n", "b", "q", "k", "b", "n", "r"],
        ["p", "p", "p", "p", "p", "p", "p", "p"],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", ""],
        ["P", "P", "P", "P", "P", "P", "P", "P"],
        ["R", "N", "B", "Q", "K", "B", "N", "R"],
    ];

    let board = [];
    let selected = null;
    let currentPlayer = "white";

    function getSquareColor(row, col) {
        return (row + col) % 2 === 0 ? "light" : "dark";
    }

    function drawBoard() {
        boardElement.innerHTML = "";

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement("div");
                square.className = `square ${getSquareColor(row, col)}`;
                square.dataset.row = row;
                square.dataset.col = col;

                const piece = board[row][col];

                if (piece) {
                    const img = document.createElement("img");
                    img.classList.add("piece");
                    const color = piece === piece.toUpperCase() ? "white" : "black";
                    const typeMap = {
                        P: "pawn",
                        R: "rook",
                        N: "knight",
                        B: "bishop",
                        Q: "queen",
                        K: "king"
                    };
                    const type = typeMap[piece.toUpperCase()];
                    img.src = `images/${color}-${type}.png`;
                    img.alt = piece;
                    square.appendChild(img);
                }


                if (selected && selected.row === row && selected.col === col) {
                    square.classList.add("selected");
                }

                square.addEventListener("click", () => onSquareClick(row, col));

                boardElement.appendChild(square);
            }
        }
    }

    function onSquareClick(row, col) {
        if (currentPlayer !== "white") {
            return;
        }

        const piece = board[row][col];

        if (selected) {
            if (tryMove(selected.row, selected.col, row, col)) {
                selected = null;
                drawBoard();
                statusEl.textContent = "Black (AI) is thinking...";

                currentPlayer = "black";
                setTimeout(() => {
                    makeAIMove();
                }, 500);
            } else {
                if (piece && isWhitePiece(piece)) {
                    selected = { row, col };
                } else {
                    selected = null;
                }
                drawBoard();
            }
        } else {
            if (piece && isWhitePiece(piece)) {
                selected = { row, col };
                drawBoard();
            }
        }
    }

    function tryMove(fromRow, fromCol, toRow, toCol) {
        const movingPiece = board[fromRow][fromCol];
        if (!movingPiece) return false;

        const isBlackPiece = movingPiece === movingPiece.toLowerCase();
        const legalMoves = generateMoves(board, isBlackPiece);

        const moveIsLegal = legalMoves.some(move =>
            move.from[0] === fromRow && move.from[1] === fromCol &&
            move.to[0] === toRow && move.to[1] === toCol
        );

        if (!moveIsLegal) {
            return false;
        }

        board[toRow][toCol] = movingPiece;
        board[fromRow][fromCol] = "";
        currentPlayer = isBlackPiece ? "white" : "black"; 
        return true;
    }


    function isWhitePiece(piece) {
        return piece.toUpperCase() === piece;
    }

    function makeAIMove() {
        const aiMove = getBestMove(board, true); 
        if (aiMove) {
            const [fr, fc] = aiMove.from;
            const [tr, tc] = aiMove.to;
            board[tr][tc] = board[fr][fc];
            board[fr][fc] = "";
        }
        currentPlayer = "white";
        statusEl.textContent = "White to move";
        selected = null;
        drawBoard();
    }

    function resetGame() {
        board = JSON.parse(JSON.stringify(initialBoard));
        currentPlayer = "white";
        selected = null;
        statusEl.textContent = "White to move";
        drawBoard();
    }

    restartBtn.addEventListener("click", resetGame);

    resetGame();
});
