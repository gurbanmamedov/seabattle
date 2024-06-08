document.addEventListener("DOMContentLoaded", () => {
  const playerBoard = createEmptyBoard();
  const computerBoard = createEmptyBoard();
  const ships = [5, 4, 3, 3, 2]; 
  let gameState = "stopped"; 
  let theme = "light"; 
  let currentPlayer = "player"; 

  const playerBoardElement = document.getElementById("player-board");
  const computerBoardElement = document.getElementById("computer-board");
  const themeSwitchButton = document.getElementById("theme-switch");
  const startButton = document.getElementById("start-button");
  const pauseButton = document.getElementById("pause-button");
  const stopButton = document.getElementById("stop-button");
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const placementRadios = document.querySelectorAll(
    'input[name="ship-placement"]'
  );

  startButton.addEventListener("click", startGame);
  pauseButton.addEventListener("click", pauseGame);
  stopButton.addEventListener("click", stopGame);
  themeSwitchButton.addEventListener("click", switchTheme);

  computerBoardElement.addEventListener("click", handlePlayerShot);

  function createEmptyBoard() {
    return Array(10)
      .fill(null)
      .map(() => Array(10).fill(null));
  }

  function renderBoard(board, element) {
    element.innerHTML = "";
    for (let row of board) {
      for (let cell of row) {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        if (cell === "ship") cellElement.classList.add("ship");
        if (cell === "hit") cellElement.classList.add("hit");
        if (cell === "miss") cellElement.classList.add("miss");
        element.appendChild(cellElement);
      }
    }
  }

  function placeShipsRandomly(board) {
    ships.forEach((shipLength) => {
      let placed = false;
      while (!placed) {
        const direction = Math.random() < 0.5 ? "horizontal" : "vertical";
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        if (canPlaceShip(board, row, col, shipLength, direction)) {
          placeShip(board, row, col, shipLength, direction);
          placed = true;
        }
      }
    });
  }

  function canPlaceShip(board, row, col, length, direction) {
    if (direction === "horizontal") {
      if (col + length > 10) return false;
      for (let i = 0; i < length; i++) {
        if (board[row][col + i]) return false;
      }
    } else {
      if (row + length > 10) return false;
      for (let i = 0; i < length; i++) {
        if (board[row + i][col]) return false;
      }
    }
    return true;
  }

  function placeShip(board, row, col, length, direction) {
    if (direction === "horizontal") {
      for (let i = 0; i < length; i++) {
        board[row][col + i] = "ship";
      }
    } else {
      for (let i = 0; i < length; i++) {
        board[row + i][col] = "ship";
      }
    }
  }

  function startGame() {
    gameState = "playing";
    resetBoard(playerBoard);
    resetBoard(computerBoard);

    const placementMode = document.querySelector(
      'input[name="ship-placement"]:checked'
    ).value;
    if (placementMode === "automatic") {
      placeShipsRandomly(playerBoard);
    } else {
      placeShipsRandomly(playerBoard); 
    }

    placeShipsRandomly(computerBoard);
    renderBoard(playerBoard, playerBoardElement);
    renderBoard(computerBoard, computerBoardElement);

    const gameMode = document.querySelector('input[name="mode"]:checked').value;
    if (gameMode === "computer-computer") {
      startComputerVsComputerGame();
    }
  }

  function startComputerVsComputerGame() {
    let intervalId = setInterval(() => {
      if (gameState !== "playing") {
        clearInterval(intervalId);
        return;
      }

      if (currentPlayer === "player") {
        makeComputerMove(computerBoard, computerBoardElement);
        currentPlayer = "computer";
      } else {
        makeComputerMove(playerBoard, playerBoardElement);
        currentPlayer = "player";
      }
    }, 500);
  }

  function makeComputerMove(board, boardElement) {
    let row, col;
    do {
      row = Math.floor(Math.random() * 10);
      col = Math.floor(Math.random() * 10);
    } while (board[row][col] === "hit" || board[row][col] === "miss");

    const cell = boardElement.children[row * 10 + col];
    if (board[row][col] === "ship") {
      board[row][col] = "hit";
      cell.classList.add("hit");
    } else {
      board[row][col] = "miss";
      cell.classList.add("miss");
    }
  }

  function pauseGame() {
    if (gameState === "playing") {
      gameState = "paused";
    }
  }

  function stopGame() {
    gameState = "stopped";
    resetBoard(playerBoard);
    resetBoard(computerBoard);
    renderBoard(playerBoard, playerBoardElement);
    renderBoard(computerBoard, computerBoardElement);
  }

  function resetBoard(board) {
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        board[row][col] = null;
      }
    }
  }

  function switchTheme() {
    theme = theme === "light" ? "dark" : "light";
    document.body.className = theme;
  }

  function handlePlayerShot(event) {
    if (gameState !== "playing" || currentPlayer !== "player") return;

    const cell = event.target;
    const index = Array.from(computerBoardElement.children).indexOf(cell);
    const row = Math.floor(index / 10);
    const col = index % 10;

    if (computerBoard[row][col] === "ship") {
      computerBoard[row][col] = "hit";
      cell.classList.add("hit");
    } else {
      computerBoard[row][col] = "miss";
      cell.classList.add("miss");
    }

    currentPlayer = "computer";
    if (
      document.querySelector('input[name="mode"]:checked').value ===
      "player-computer"
    ) {
      setTimeout(computerTurn, 500); 
    }
  }

  function computerTurn() {
    if (gameState !== "playing") return;

    makeComputerMove(playerBoard, playerBoardElement);
    currentPlayer = "player";
  }

  renderBoard(playerBoard, playerBoardElement);
  renderBoard(computerBoard, computerBoardElement);
  document.body.className = theme;
});
