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
    let gameOver = false;
    let whiteCapturedPieces = [];
    let blackCapturedPieces = [];


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
                    const type = piece.toLowerCase();
                    img.src = `images/${color}-${{
                        p: "pawn", r: "rook", n: "knight", b: "bishop", q: "queen", k: "king"
                    }[type]}.png`;
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
        if (gameOver || currentPlayer !== "white") return;

        const piece = board[row][col];

        if (selected) {
            if (tryMove(selected.row, selected.col, row, col)) {
                selected = null;
                drawBoard();
                checkGameEnd("black");

                if (!gameOver) {
                    statusEl.textContent = "Black's move";
                    currentPlayer = "black";
                    setTimeout(makeAIMove, 300);
                }
            } else {
                if (piece && isWhitePiece(piece)) selected = { row, col };
                else selected = null;
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
        const piece = board[fromRow][fromCol];
        if (!piece || (currentPlayer === "white" && piece !== piece.toUpperCase())) return false;

        const legalMoves = generateMoves(board, false).filter(move => {
            const simBoard = makeMove(board, move);
            return !isKingInCheck(simBoard, "white");
        });

        const moveIsLegal = legalMoves.some(move =>
            move.from[0] === fromRow && move.from[1] === fromCol &&
            move.to[0] === toRow && move.to[1] === toCol
        );

        if (!moveIsLegal) return false;

        const targetPiece = board[toRow][toCol];
        // Capture detected if there is a piece on destination square
        if (targetPiece) {
            if (targetPiece === targetPiece.toUpperCase()) {
                // Captured white piece, so black captures it
                blackCapturedPieces.push(targetPiece);
            } else {
                // Captured black piece, so white captures it
                whiteCapturedPieces.push(targetPiece);
            }
            updateCapturedPiecesDisplay(); //refresh captured pieces UI immediately
        }

        board[toRow][toCol] = piece;
        board[fromRow][fromCol] = "";
        currentPlayer = "black";

        updateCapturedPiecesDisplay();

        return true;
    }

    function makeAIMove() {
        const move = getBestMove(board, true);
        if (!move) {
            endGame("White");
            return;
        }
        const [fr, fc] = move.from;
        const [tr, tc] = move.to;

        const targetPiece = board[tr][tc];
        if (targetPiece) {
            if (targetPiece === targetPiece.toUpperCase()) {
                blackCapturedPieces.push(targetPiece);
            } else {
                whiteCapturedPieces.push(targetPiece);
            }
            updateCapturedPiecesDisplay();
        }

        board[tr][tc] = board[fr][fc];
        board[fr][fc] = "";
        currentPlayer = "white";
        statusEl.textContent = "White's move";
        drawBoard();
        checkGameEnd("white");
    }

 

    function checkGameEnd(currentColor) {
        const legalMoves = generateMoves(board, currentColor === "black").filter(move => {
            const simBoard = makeMove(board, move);
            return !isKingInCheck(simBoard, currentColor);
        });

        if (legalMoves.length === 0) {
            if (isKingInCheck(board, currentIsBlack ? "black" : "white")) {
                const winner = currentIsBlack ? "White" : "Black";
                endGame(`${winner} Wins!`);
            } else {
                endGame("Stalemate!");
            }
        }
    }

    function isWhitePiece(piece) {
        return piece && piece === piece.toUpperCase();
    }

    function endGame(message) {
        statusEl.textContent = message;
        gameOver = true;
        boardElement.style.pointerEvents = "none";
    }

    function updateCapturedPiecesDisplay() {
        const blackCapturedDiv = document.querySelector("#black-captured .captured-pieces");
        const whiteCapturedDiv = document.querySelector("#white-captured .captured-pieces");

        blackCapturedDiv.innerHTML = "";
        whiteCapturedDiv.innerHTML = "";

        blackCapturedPieces.forEach(piece => {
            const img = document.createElement("img");
            const pieceType = piece.toLowerCase();
            img.src = `images/white-${{
                p: "pawn", r: "rook", n: "knight", b: "bishop", q: "queen", k: "king"
            }[pieceType]}.png`;
            img.alt = piece;
            blackCapturedDiv.appendChild(img);
        });

        whiteCapturedPieces.forEach(piece => {
            const img = document.createElement("img");
            const pieceType = piece.toLowerCase();
            img.src = `images/black-${{
                p: "pawn", r: "rook", n: "knight", b: "bishop", q: "queen", k: "king"
            }[pieceType]}.png`;
            img.alt = piece;
            whiteCapturedDiv.appendChild(img);
        });
    }

function resetGame() {
    board = JSON.parse(JSON.stringify(initialBoard));
    currentPlayer = "white";
    selected = null;
    gameOver = false;
    whiteCapturedPieces = [];
    blackCapturedPieces = [];
    statusEl.textContent = "White's move";
    updateCapturedPiecesDisplay();
    drawBoard();
}


    restartBtn.addEventListener("click", resetGame);

    resetGame();
});
