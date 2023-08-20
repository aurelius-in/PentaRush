import { SHAPES } from './shapes.js';

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const board = [];

let currentShape = null;
let posX = 0;
let posY = 0;
let score = 0;
let level = 1;
let gameOver = false;

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const shapeQueue = [];

function createShape() {
  currentShape = shapeQueue.shift(); // Get the next shape from the queue
  const shapeIndex = Math.floor(Math.random() * SHAPES.length);
  shapeQueue.push(SHAPES[shapeIndex]); // Add a new random shape to the queue
  posX = Math.floor(COLS / 2) - Math.ceil(currentShape.length / 2);
  posY = 0;
}

// Populate the initial shape queue
for (let i = 0; i < 3; i++) {
  const shapeIndex = Math.floor(Math.random() * SHAPES.length);
  shapeQueue.push(SHAPES[shapeIndex]);
}


function initBoard() {
  for (let row = 0; row < ROWS; row++) {
    board[row] = [];
    for (let col = 0; col < COLS; col++) {
      board[row][col] = 0;
    }
  }
}

function drawBoard() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col]) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function createShape() {
  const shapeIndex = Math.floor(Math.random() * SHAPES.length);
  currentShape = SHAPES[shapeIndex];
  posX = Math.floor(COLS / 2) - Math.ceil(currentShape.length / 2);
  posY = 0;
}

function drawShape() {
  for (let row = 0; row < currentShape.length; row++) {
    for (let col = 0; col < currentShape.length; col++) {
      if (currentShape[row][col]) {
        ctx.fillStyle = 'red';
        ctx.fillRect((posX + col) * BLOCK_SIZE, (posY + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

function rotateShape() {
  const newShape = [];
  for (let row = 0; row < currentShape.length; row++) {
    newShape[row] = [];
    for (let col = 0; col < currentShape.length; col++) {
      newShape[row][col] = currentShape[col][currentShape.length - 1 - row];
    }
  }
  currentShape = newShape;
}

function moveLeft() {
  if (canMove(-1, 0)) posX -= 1;
}

function moveRight() {
  if (canMove(1, 0)) posX += 1;
}

function moveDown() {
  if (canMove(0, 1)) {
    posY += 1;
  } else {
    mergeShape();
    checkGameOver();
    createShape();
  }
}

function canMove(offsetX, offsetY) {
  for (let row = 0; row < currentShape.length; row++) {
    for (let col = 0; col < currentShape.length; col++) {
      if (currentShape[row][col]) {
        const newX = posX + col + offsetX;
        const newY = posY + row + offsetY;

        if (newX < 0 || newX >= COLS || newY >= ROWS || board[newY][newX]) {
          return false;
        }
      }
    }
  }
  return true;
}

function mergeShape() {
  for (let row = 0; row < currentShape.length; row++) {
    for (let col = 0; col < currentShape.length; col++) {
      if (currentShape[row][col]) {
        board[posY + row][posX + col] = 1;
      }
    }
  }
  checkLines();
}

function checkLines() {
  let linesCleared = 0;

  for (let row = 0; row < ROWS; row++) {
    if (board[row].every(cell => cell === 1)) {
      board.splice(row, 1);
      board.unshift(new Array(COLS).fill(0));
      linesCleared += 1;
    }
  }

  score += linesCleared * 100;
  level = Math.floor(score / 1000) + 1;
}

function checkGameOver() {
  if (board[0].some(cell => cell === 1)) {
    gameOver = true;
    alert('Game Over!');
  }
}

function gameLoop() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  drawShape();

  document.getElementById('score').innerText = `Score: ${score}`;
  document.getElementById('level').innerText = `Level: ${level}`;

  moveDown();
  requestAnimationFrame(gameLoop);
}

function startGame() {
  createShape();
  gameLoop();
}

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  touchEndX = event.touches[0].clientX;
  touchEndY = event.touches[0].clientY;
}

function handleTouchEnd() {
  const xDiff = touchEndX - touchStartX;
  const yDiff = touchEndY - touchStartY;
  const threshold = 50;

  if (Math.abs(xDiff) > threshold && Math.abs(yDiff) < threshold) {
    if (xDiff < 0) moveLeft();
    else moveRight();
  } else if (yDiff > threshold * 2) {
    while (canMove(0, 1)) {
      posY += 1;
    }
    mergeShape();
    createShape();
  } else if (yDiff < -threshold) {
    changeToNextShape();
  } else if (Math.abs(xDiff) < threshold && Math.abs(yDiff) < threshold) {
    rotateShape();
  }
}

function changeToNextShape() {
  // Merge the current shape with the board before changing to the next shape
  mergeShape();
  // Create the next shape from the queue
  createShape();
}


canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchend', handleTouchEnd, false);
document.getElementById('start').addEventListener('click', startGame);

initBoard();
drawBoard();
