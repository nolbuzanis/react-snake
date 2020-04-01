import React, { useState, useRef, useEffect } from 'react';
import useInterval from './useInterval';
import styled from 'styled-components';
import './App.css';

const CANVAS_SIZE = [800, 600];
const SNAKE_START = [[10, 8], [10, 9]];
const APPLE_START = [5, 5];
const SCALE = 20;
const DOWN = [0, 1];
const UP = [0, -1];
const LEFT = [-1, 0];
const RIGHT = [1, 0];
const SPEED = 100;

const Board = styled.canvas`
  background: #282c35;
`;

const Game = styled.div`
  width: 100%;
  height: 100%;
`;

const App = () => {
  const gameRef = useRef(undefined);
  const canvasRef = useRef(undefined);
  const [snake, setSnake] = useState(SNAKE_START);
  const [apple, setApple] = useState(APPLE_START);
  const direction = useRef(UP);
  const [gameover, setGameover] = useState(false);
  const [speed, setSpeed] = useState(null);

  const startGame = () => {
    setSnake(SNAKE_START);
    setApple(APPLE_START);
    direction.current = UP;
    setGameover(false);
    setSpeed(SPEED);
  };

  const endGame = () => {
    setGameover(true);
    setSpeed(null);
  };

  const moveSnake = ({ keyCode }) => {
    if (keyCode === 13 && gameover) return startGame();

    switch (keyCode) {
      case 38 || 87: {
        return (direction.current = UP);
      }
      case 39 || 68: {
        return (direction.current = RIGHT);
      }
      case 40 || 83: {
        return (direction.current = DOWN);
      }
      case 37 || 65: {
        return (direction.current = LEFT);
      }
      default: {
        return;
      }
    }
  };

  const handleAppleCollision = () => {
    // create new apple
    let newApple = [0, 0];
    do {
      const randomX = Math.floor((Math.random() * CANVAS_SIZE[0]) / SCALE);
      const randomY = Math.floor((Math.random() * CANVAS_SIZE[1]) / SCALE);
      newApple = [randomX, randomY];
    } while (checkCollision(newApple));
    setApple(newApple);
  };

  const checkCollision = (piece, snk = snake) => {
    // Check collision with wall
    if (
      piece[0] * SCALE < 0 ||
      piece[1] * SCALE < 0 ||
      piece[0] * SCALE >= CANVAS_SIZE[0] ||
      piece[1] * SCALE >= CANVAS_SIZE[1]
    ) {
      return true;
    }
    // check collision with snake itself
    for (const segment of snk) {
      if (piece[0] === segment[0] && piece[1] === segment[1]) return true;
    }
    return false;
  };

  const checkAppleCollision = snk => {
    if (snk[0][0] === apple[0] && snk[0][1] === apple[1]) return true;
    return false;
  };

  const gameLoop = () => {
    const snakeCopy = [...snake];
    const newSnakeHead = [
      snakeCopy[0][0] + direction.current[0],
      snakeCopy[0][1] + direction.current[1]
    ];

    snakeCopy.unshift(newSnakeHead);
    if (checkCollision(newSnakeHead)) return endGame();
    checkAppleCollision(snakeCopy) ? handleAppleCollision() : snakeCopy.pop();
    setSnake(snakeCopy);
  };
  //run once
  useEffect(() => {
    console.log('focussing on ', gameRef.current);
    gameRef.current.focus();
  }, []);

  useEffect(() => {
    const context = canvasRef.current.getContext('2d');
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.clearRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1]);
    context.fillStyle = 'rgb(31, 182, 255)';
    snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
    context.fillStyle = 'red';
    context.fillRect(apple[0], apple[1], 1, 1);
  }, [snake, apple, gameover]);

  useInterval(gameLoop, speed);

  return (
    <Game
      role='button'
      onKeyDown={e => moveSnake(e)}
      tabindex='0'
      ref={gameRef}
    >
      <Board width={CANVAS_SIZE[0]} height={CANVAS_SIZE[1]} ref={canvasRef}>
        Hi
      </Board>
      {gameover && <div>GameOver!!!</div>}
      <button onClick={startGame}>Startover</button>
    </Game>
  );
};

export default App;
