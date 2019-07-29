const Agent = require('ai-agents').Agent;
const Graph = require('node-dijkstra');
const maxScore = 100;

class HexAgent extends Agent {
    constructor(value) {
        super(value);
    }
    /**
     * return a new move. The move is an array of two integers, representing the
     * row and column number of the hex to play. If the given movement is not valid,
     * the Hex controller will perform a random valid movement for the player
     * Example: [1, 1]
     */
    send() {
        let board = this.perception;
        let size = board.length;
        let available = getEmptyHex(board);
        let agent = this.getID();
        //let maxDepth = 3;
        let bestOption;
        let nTurn = size * size - available.length;

        if (nTurn == 0) { // First move
            return [Math.floor(size / 2) - 1, Math.floor(size / 2) + 1];
        }
        if (nTurn == 1) {
            return [Math.floor(size / 2) + 1, Math.floor(size / 2) - 1];
        }
        bestOption = alphaBetaPrunedMiniMax(board, agent, agent, 0, -maxScore, maxScore, {}, available);

        return bestOption.move;
    }

}

module.exports = HexAgent;

/**
 * Return an array containing the id of the empty hex in the board
 * id = row * size + col;
 * @param {Matrix} board 
 */
function getEmptyHex(board) {
    let result = [];
    let size = board.length;
    for (let k = 0; k < size; k++) {
        for (let j = 0; j < size; j++) {
            if (board[k][j] === 0) {
                result.push(k * size + j);
            }
        }
    }
    return result;
}

function getNeighbors(node, player, board) {

    let size = board.length;
    let row = Math.floor(node / size);
    let col = node % size;
    let result = [];
    let currentValue = board[row][col];
    board[row][col] = '-';

    if (player === "1") {
        if (col === size - 1) {
            // NODO DERECHO
            result.push(-1);
        } else if (col === 0) {
            // NODO IZQUIERDO
            result.push(-2);
        }
    } else {
        if (row === size - 1) {
            // NODO INFERIOR
            result.push(-3);
        } else if (row === 0) {
            // NODO SUPERIOR
            result.push(-4);
        }
    }

    // ARRIBA
    if ((row - 1) >= 0 && (row - 1) < size && col >= 0 && col < size) {
        if (board[(row - 1)][col] === player) {
            result.push(...getNeighbors(col + (row - 1) * size, player, board))
        } else {
            if (board[(row - 1)][col] === 0) {
                result.push(col + (row - 1) * size);
            }
        }
    }
    // ARRIBA - DERECHA
    if ((row - 1) >= 0 && (row - 1) < size && (col + 1) >= 0 && (col + 1) < size) {
        if (board[(row - 1)][(col + 1)] === player) {
            result.push(...getNeighbors((col + 1) + (row - 1) * size, player, board))
        } else {
            if (board[(row - 1)][(col + 1)] === 0) {
                result.push((col + 1) + (row - 1) * size);
            }
        }
    }
    // DERECHA
    if (row >= 0 && row < size && (col + 1) >= 0 && (col + 1) < size) {
        if (board[row][(col + 1)] === player) {
            result.push(...getNeighbors((col + 1) + row * size, player, board))
        } else {
            if (board[row][(col + 1)] === 0) {
                result.push((col + 1) + row * size);
            }
        }
    }
    // IZQUIERDA
    if (row >= 0 && row < size && (col - 1) >= 0 && (col - 1) < size) {
        if (board[row][(col - 1)] === player) {
            result.push(...getNeighbors((col - 1) + row * size, player, board))
        } else {
            if (board[row][(col - 1)] === 0) {
                result.push((col - 1) + row * size);
            }
        }
    }
    // ABAJO - IZQUIERDA
    if ((row + 1) >= 0 && (row + 1) < size && (col - 1) >= 0 && (col - 1) < size) {
        if (board[(row + 1)][(col - 1)] === player) {
            result.push(...getNeighbors((col - 1) + (row + 1) * size, player, board))
        } else {
            if (board[(row + 1)][(col - 1)] === 0) {
                result.push((col - 1) + (row + 1) * size);
            }
        }
    }
    // ABAJO
    if ((row + 1) >= 0 && (row + 1) < size && col >= 0 && col < size) {
        if (board[(row + 1)][col] === player) {
            result.push(...getNeighbors(col + (row + 1) * size, player, board))
        } else {
            if (board[(row + 1)][col] === 0) {
                result.push(col + (row + 1) * size);
            }
        }
    }
    board[row][col] = currentValue;

    return result;
}

function getPath(board, player) {
    let size = board.length;

    const route = new Graph();

    let neighborsRight = {};
    let neighborsLeft = {};
    let neighborsDown = {};
    let neighborsUp = {};

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let nodeID = i * size + j;
            if (board[i][j] === 0) {
                let neighborhood = getNeighbors(nodeID, player, board);
                let neighbors = {};
                if (player === "1") {
                    let sideRight = false;
                    let sideLeft = false;
                    neighborhood.forEach(neighbor => {
                        switch (neighbor) {
                            case -1:
                                neighbors[player + 'R'] = 1;
                                neighborsRight[nodeID + ''] = 1;
                                if (sideRight || (board[i][j] === player)) {
                                    sideRight = true;
                                }
                                break;
                            case -2:
                                neighbors[player + 'L'] = 1;
                                neighborsLeft[nodeID + ''] = 1;
                                if (sideLeft || (board[i][j] === player)) {
                                    sideLeft = true;
                                }
                                break;
                            default:
                                neighbors[neighbor + ''] = 1;
                        }
                    });

                    if (sideRight && sideLeft) {
                        neighborsRight[player + 'R'] = 1;
                        neighborsLeft[player + 'L'] = 1;
                    }
                } else {
                    let sideDown = false;
                    let sideUp = false;
                    neighborhood.forEach(neighbor => {
                        switch (neighbor) {
                            case -3:
                                neighbors[player + 'D'] = 1;
                                neighborsDown[nodeID + ''] = 1;
                                if (sideDown || (board[i][j] === player)) {
                                    sideDown = true;
                                }
                                break;
                            case -4:
                                neighbors[player + 'U'] = 1;
                                neighborsUp[nodeID + ''] = 1;
                                if (sideUp || (board[i][j] === player)) {
                                    sideUp = true;
                                }
                                break;
                            default:
                                neighbors[neighbor + ''] = 1;
                        }
                    });

                    if (sideDown && sideUp) {
                        neighborsRight[player + 'D'] = 1;
                        neighborsLeft[player + 'U'] = 1;
                    }

                }
                route.addNode(nodeID + '', neighbors);
            }
        }
    }
    if (player === "1") {
        route.addNode(player + 'R', neighborsRight);
        route.addNode(player + 'L', neighborsLeft);

        return route.path(player + 'L', player + 'R');
    } else {
        route.addNode(player + 'D', neighborsDown);
        route.addNode(player + 'U', neighborsUp);

        return route.path(player + 'U', player + 'D');
    }

}

function getHeuristic(board, player) {
    let player1Path = getPath(board, "1");
    let player2Path = getPath(board, "2");
    let heuristic = 0;
    if (!player1Path) {
        heuristic = -maxScore;
    } else {
        if (!player2Path) {
            heuristic = maxScore
        } else {
            heuristic = player2Path.length - player1Path.length;
        }
    }
    if (player !== "1") {
        heuristic = -heuristic;
    }
    return heuristic;

}

function alphaBetaPrunedMiniMax(board, player0, player, depth, alpha, beta, calculated, available) {
    let maxDepth = 3;
    let bestScore = -maxScore;
    if (depth % 2 == 1) {
        bestScore = maxScore;
    }
    let bestMove = [];
    let maxActions = available.length;
    for (let i = 0; i < maxActions; i++) {
        if (available[i] >= 0) {
            let move = available[i];
            let action = [Math.floor(move / board.length), move % board.length];
            available[i] = -1;
            board[action[0]][action[1]] = player;
            let score;

            let key = getHash(board);
            if (calculated[key]) {
                score = calculated[key];
            } else {
                score = getHeuristic(board, player0);
                let gameEnd = false;
                if (score === -maxScore || score === maxScore) {
                    gameEnd = true
                }
                if (!(depth === maxDepth || gameEnd)) {
                    let nextPlayer;
                    if (player === "1") {
                        nextPlayer = "2";
                    } else {
                        nextPlayer = "1";
                    }
                    score = alphaBetaPrunedMiniMax(board, player, nextPlayer, depth + 1, alpha, beta, calculated, available).score;
                }
                calculated[key] = score;
            }

            board[action[0]][action[1]] = 0;

            if (depth % 2 == 1) {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = action;
                    if (score < beta)
                        beta = score;
                }
            } else {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = action;
                    if (score > alpha)
                        alpha = score;
                }
            }

            available[i] = move;
            if (alpha >= beta) {
                break;
            }
        }
    }
    return { score: bestScore, move: bestMove };
}

function getHash(board) {
    let hash = '';
    board.forEach(row => {
        row.forEach(cell => {
            hash += cell;
        });
    });
    return hash;
}