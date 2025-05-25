const pieceValues = {
    "p": 1,
    "n": 3,
    "b": 3,
    "r": 5,
    "q": 9,
    "k": 1000,
    "P": -1,
    "N": -3,
    "B": -3,
    "R": -5,
    "Q": -9,
    "K": -1000,
};
function evaluateBoard(board) {
    let score = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                score += pieceValues[piece] || 0;
            }
        }
    }
    return score;
}
function generateMoves(board, isBlackTurn) {
    const moves = [];

    function isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    function isOpponent(target, isBlackTurn) {
        if (!target) return false;
        return isBlackTurn ? target === target.toUpperCase() : target === target.toLowerCase();
    }

    function addSlidingMoves(r, c, directions) {
        const piece = board[r][c];
        for (const [dr, dc] of directions) {
            let nr = r + dr;
            let nc = c + dc;
            while (isInBounds(nr, nc)) {
                const target = board[nr][nc];
                if (!target) {
                    moves.push({ from: [r, c], to: [nr, nc] });
                } else {
                    if (isOpponent(target, isBlackTurn)) {
                        moves.push({ from: [r, c], to: [nr, nc] });
                    }
                    break;
                }
                nr += dr;
                nc += dc;
            }
        }
    }

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (!piece) continue;

            const isBlackPiece = piece === piece.toLowerCase();
            if (isBlackPiece !== isBlackTurn) continue;

            const type = piece.toLowerCase();

            if (type === 'p') {
                const direction = isBlackTurn ? 1 : -1;
                const startRow = isBlackTurn ? 1 : 6;
                const nr = r + direction;

                if (isInBounds(nr, c) && !board[nr][c]) {
                    moves.push({ from: [r, c], to: [nr, c] });

                    if (r === startRow && !board[r + 2 * direction][c]) {
                        moves.push({ from: [r, c], to: [r + 2 * direction, c] });
                    }
                }
                for (const dc of [-1, 1]) {
                    const nc = c + dc;
                    if (isInBounds(nr, nc)) {
                        const target = board[nr][nc];
                        if (isOpponent(target, isBlackTurn)) {
                            moves.push({ from: [r, c], to: [nr, nc] });
                        }
                    }
                }
            }

            if (type === 'n') {
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                for (const [dr, dc] of knightMoves) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (isInBounds(nr, nc)) {
                        const target = board[nr][nc];
                        if (!target || isOpponent(target, isBlackTurn)) {
                            moves.push({ from: [r, c], to: [nr, nc] });
                        }
                    }
                }
            }

            if (type === 'b') {
                addSlidingMoves(r, c, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
            }

            if (type === 'r') {
                addSlidingMoves(r, c, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
            }

            if (type === 'q') {
                addSlidingMoves(r, c, [
                    [-1, -1], [-1, 1], [1, -1], [1, 1],
                    [-1, 0], [1, 0], [0, -1], [0, 1]
                ]);
            }

            if (type === 'k') {
                const kingMoves = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1], [0, 1],
                    [1, -1], [1, 0], [1, 1]
                ];
                for (const [dr, dc] of kingMoves) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (isInBounds(nr, nc)) {
                        const target = board[nr][nc];
                        if (!target || isOpponent(target, isBlackTurn)) {
                            moves.push({ from: [r, c], to: [nr, nc] });
                        }
                    }
                }
            }
        }
    }

    return moves;
}

function makeMove(board, move) {
    const newBoard = board.map(row => row.slice());
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    newBoard[tr][tc] = newBoard[fr][fc];
    newBoard[fr][fc] = "";
    return newBoard;
}
function minimax(board, depth, isMaximizingPlayer) {
    if (depth === 0) {
        return evaluateBoard(board);
    }

    const moves = generateMoves(board, isMaximizingPlayer);
    if (moves.length === 0) {
        return isMaximizingPlayer ? -10000 : 10000;
    }

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (const move of moves) {
            const newBoard = makeMove(board, move);
            const evalScore = minimax(newBoard, depth - 1, false);
            if (evalScore > maxEval) maxEval = evalScore;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            const newBoard = makeMove(board, move);
            const evalScore = minimax(newBoard, depth - 1, true);
            if (evalScore < minEval) minEval = evalScore;
        }
        return minEval;
    }
}
function getBestMove(board, isBlackTurn) {
    const moves = generateMoves(board, isBlackTurn);
    if (moves.length === 0) return null;

    let bestMove = null;
    let bestEval = isBlackTurn ? -Infinity : Infinity;

    for (const move of moves) {
        const newBoard = makeMove(board, move);
        const evalScore = minimax(newBoard, 2, !isBlackTurn);
        if (isBlackTurn) {
            if (evalScore > bestEval) {
                bestEval = evalScore;
                bestMove = move;
            }
        } else {
            if (evalScore < bestEval) {
                bestEval = evalScore;
                bestMove = move;
            }
        }
    }

    return bestMove;
}
