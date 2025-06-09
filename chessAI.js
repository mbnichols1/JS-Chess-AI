const pieceValues = {
    p: 1, n: 3, b: 3, r: 5, q: 9, k: 1000,
    P: -1, N: -3, B: -3, R: -5, Q: -9, K: -1000,
};

function evaluateBoard(board) {
    return board.flat().reduce((score, piece) => score + (pieceValues[piece] || 0), 0);
}

function generateMoves(board, isBlackTurn) {
    const moves = [];

    function isInBounds(r, c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8;
    }

    function isOpponent(piece, isBlack) {
        return piece && (isBlack ? piece === piece.toUpperCase() : piece === piece.toLowerCase());
    }

    function addMove(from, to) {
        moves.push({ from, to });
    }

    function addSlidingMoves(r, c, dirs) {
        for (const [dr, dc] of dirs) {
            let nr = r + dr, nc = c + dc;
            while (isInBounds(nr, nc)) {
                const target = board[nr][nc];
                if (!target) addMove([r, c], [nr, nc]);
                else {
                    if (isOpponent(target, isBlackTurn)) addMove([r, c], [nr, nc]);
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

            const isBlack = piece === piece.toLowerCase();
            if (isBlack !== isBlackTurn) continue;

            const type = piece.toLowerCase();

            if (type === "p") {
                const dir = isBlack ? 1 : -1;
                const startRow = isBlack ? 1 : 6;
                const nr = r + dir;

                if (isInBounds(nr, c) && !board[nr][c]) {
                    addMove([r, c], [nr, c]);
                    if (r === startRow && !board[r + 2 * dir][c]) {
                        addMove([r, c], [r + 2 * dir, c]);
                    }
                }
                for (const dc of [-1, 1]) {
                    const nc = c + dc;
                    if (isInBounds(nr, nc) && isOpponent(board[nr][nc], isBlackTurn)) {
                        addMove([r, c], [nr, nc]);
                    }
                }
            }

            if (type === "n") {
                for (const [dr, dc] of [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]) {
                    const nr = r + dr, nc = c + dc;
                    if (isInBounds(nr, nc) && (!board[nr][nc] || isOpponent(board[nr][nc], isBlackTurn))) {
                        addMove([r, c], [nr, nc]);
                    }
                }
            }

            if (type === "b") addSlidingMoves(r, c, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
            if (type === "r") addSlidingMoves(r, c, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
            if (type === "q") addSlidingMoves(r, c, [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);

            if (type === "k") {
                for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
                    const nr = r + dr, nc = c + dc;
                    if (isInBounds(nr, nc) && (!board[nr][nc] || isOpponent(board[nr][nc], isBlackTurn))) {
                        addMove([r, c], [nr, nc]);
                    }
                }
            }
        }
    }

    return moves;
}

function makeMove(board, move) {
    const newBoard = board.map(row => [...row]);
    const [fr, fc] = move.from;
    const [tr, tc] = move.to;
    newBoard[tr][tc] = newBoard[fr][fc];
    newBoard[fr][fc] = "";
    return newBoard;
}

function isKingInCheck(board, color) {
    const king = color === "white" ? "K" : "k";
    let kr = -1, kc = -1;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] === king) {
                kr = r;
                kc = c;
                break;
            }
        }
    }
    const oppMoves = generateMoves(board, color !== "white");
    return oppMoves.some(move => move.to[0] === kr && move.to[1] === kc);
}

function minimax(board, depth, isMax) {
    if (depth === 0) return evaluateBoard(board);
    const moves = generateMoves(board, isMax).filter(move => {
        const sim = makeMove(board, move);
        return !isKingInCheck(sim, isMax ? "black" : "white");
    });

    if (isMax) {
        return moves.reduce((best, move) => Math.max(best, minimax(makeMove(board, move), depth - 1, false)), -Infinity);
    } else {
        return moves.reduce((best, move) => Math.min(best, minimax(makeMove(board, move), depth - 1, true)), Infinity);
    }
}

function getBestMove(board, isBlackTurn) {
    const moves = generateMoves(board, isBlackTurn).filter(move => {
        const newBoard = makeMove(board, move);
        return !isKingInCheck(newBoard, isBlackTurn ? "black" : "white");
    });

    let bestMove = null;
    let bestEval = isBlackTurn ? -Infinity : Infinity;

    for (const move of moves) {
        const newBoard = makeMove(board, move);
        const evalScore = minimax(newBoard, 2, !isBlackTurn);
        if ((isBlackTurn && evalScore > bestEval) || (!isBlackTurn && evalScore < bestEval)) {
            bestEval = evalScore;
            bestMove = move;
        }
    }

    return bestMove;
}
