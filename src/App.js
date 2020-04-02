import React, { useState, useRef, useEffect } from 'react';
import useInterval from './useInterval';
import styled from 'styled-components';
import './App.css';
import { useDrag } from 'react-use-gesture';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const CANVAS_SIZE = [800, 600];
const SNAKE_START = [[10, 8], [10, 9]];
const APPLE_START = [5, 5];
const SCALE = 20;
const DOWN = [0, 1];
const UP = [0, -1];
const LEFT = [-1, 0];
const RIGHT = [1, 0];
const SPEED = 150;

const Board = styled.canvas`
  background: #282c35;
  margin: 20px auto;
`;

const Game = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
`;

const modalStyles = {
  overlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '100',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  content: {
    position: 'static',
    display: 'inline-block',
    padding: 'none',
    border: 'none',
    background: 'none',
    color: '#757575',
    overflow: 'hidden'
  }
};
const ModalContent = styled.div`
  box-sizing: border-box;
  position: relative;
  background: white;
  //width: 465px;
  //height: 450px;
  border-radius: 10px;
  box-shadow: 4px 4px 6px rgba(0, 0, 0, 0.16);
  font-family: Montserrat;
  text-align: center;
  padding: 45px;
  color: #757575;
`;
const GameTitle = styled.h1`
  font-size: 60px;
  font-family: 'Stiff Staff';
  color: #00af80;
  margin: 0;
  padding-left: 15px;
`;
const ClassicsText = styled.h2`
  margin: 0;
  text-transform: uppercase;
  color: #1fb6ff;
  font-size: 20px;
  font-weight: 600;
  font-family: Montserrat;
  padding-top: 15px;
`;
const Header = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-top: 40px;
  text-align: center;
`;
const SnakeImg = styled.img`
  width: 100px;
  height: 84px;
`;
const Rules = styled.p`
  font-size: 25px;
  font-weight: 300;
  padding: 0 60px;
`;
const Button = styled.button`
  width: 300px;
  height: 70px;
  border-radius: 35px;
  font-size: 30px;
  color: white;
  background: #1fb6ff;
  box-shadow: 4px 4px 6px rgba(0, 0, 0, 0.16);
  font-weight: 600;
`;
const ModalTitle = styled.h1`
  margin: 0;
  font-weight: 500px;
  padding-top: 25px;
  font-size: 50px;
`;
const Stat = styled.p`
  font-size: 25px;
  padding: 10px 0;
`;
const StatNumber = styled(Stat)`
  color: #1fb6ff;
  font-weight: 600;
  display: inline;
  margin-left: 20px;
`;

const App = () => {
  const gameRef = useRef(undefined);
  const canvasRef = useRef(undefined);
  const [snake, setSnake] = useState(SNAKE_START);
  const [apple, setApple] = useState(APPLE_START);
  const appleCount = useRef(0);
  const direction = useRef(UP);
  const [speed, setSpeed] = useState(null);
  const [modal, setModal] = React.useState('start');

  //use swipe gestures
  const bind = useDrag(({ swipe, tap }) => {
    if (modal) return;
    const [x, y] = swipe;
    if (tap) pauseGame();

    switch (x) {
      case -1: {
        direction.current = LEFT;
        break;
      }
      case 1: {
        direction.current = RIGHT;
        break;
      }
      default:
        break;
    }
    switch (y) {
      case -1: {
        direction.current = UP;
        break;
      }
      case 1: {
        direction.current = DOWN;
        break;
      }
      default:
        break;
    }
  });

  const startGame = () => {
    setSnake(SNAKE_START);
    setApple(APPLE_START);
    direction.current = UP;
    setModal(undefined);
    setSpeed(SPEED);
    setModal(undefined);
    appleCount.current = 0;
    document.getElementById('game').contentEditable = true;
    document.getElementById('game').focus();
  };

  const pauseGame = () => {
    setModal(modal === 'paused' ? undefined : 'paused');
    setSpeed(modal === 'paused' ? SPEED : null);
    // last state was paused
    // document.getElementById('game').contentEditable = true;
    // document.getElementById('game').focus();
  };

  const endGame = () => {
    setModal('gameover');
    setSpeed(null);
    direction.current = UP;
  };

  const moveSnake = ({ keyCode }) => {
    if (modal === 'gameover') return;
    if (keyCode === 80) return pauseGame();

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
    appleCount.current++;
    let newApple = [0, 0];
    do {
      const randomX = Math.floor((Math.random() * CANVAS_SIZE[0]) / SCALE);
      const randomY = Math.floor((Math.random() * CANVAS_SIZE[1]) / SCALE);
      newApple = [randomX, randomY];
    } while (checkCollision(newApple));
    setApple(newApple);
    setSpeed(Math.max(speed - 10, 80));
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
    gameRef.current.focus();
  }, []);

  useEffect(() => {
    const context = canvasRef.current.getContext('2d');
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.clearRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1]);
    //context.fillStyle = 'rgb(31, 182, 255)';
    snake.forEach(([x, y], i) => {
      if (i === 0) context.fillStyle = 'rgb(31, 182, 255)';
      else context.fillStyle = '#00AF80';
      context.fillRect(x, y, 1, 1);
    });
    context.fillStyle = 'red';
    context.fillRect(apple[0], apple[1], 1, 1);
  }, [snake, apple, modal]);

  useInterval(gameLoop, speed);

  const StartModal = () => (
    <ModalContent>
      <Header>
        <SnakeImg src='/snake.png' />
        <GameTitle>Snake</GameTitle>
      </Header>
      <ClassicsText>Portl Classics</ClassicsText>
      <Rules>
        <strong>move</strong> - swipe UP, DOWN, LEFT, RIGHT
      </Rules>
      <Rules>
        <strong>pause/play</strong> - tap on screen
      </Rules>
      <Button onClick={startGame}>Play Game</Button>
    </ModalContent>
  );

  const GameOverModal = () => (
    <ModalContent>
      <SnakeImg src='/snake.png' />
      <ModalTitle>Game Over.</ModalTitle>
      <Stat>
        Apples eaten: <StatNumber>{appleCount.current || '?'}</StatNumber>
      </Stat>
      <Button onClick={startGame}>Try again</Button>
    </ModalContent>
  );
  const PausedModal = () => (
    <ModalContent>
      <SnakeImg src='/snake.png' />
      <ModalTitle>Game paused.</ModalTitle>
      <Button onClick={pauseGame}>Resume</Button>
    </ModalContent>
  );

  const renderModal = () => {
    switch (modal) {
      case 'gameover': {
        return <GameOverModal />;
      }
      case 'paused': {
        return <PausedModal />;
      }
      default: {
        return <StartModal />;
      }
    }
  };

  return (
    <Game
      role='button'
      onKeyDown={e => moveSnake(e)}
      //tabindex='0'
      ref={gameRef}
      {...bind()}
      id='game'
    >
      <Board width={CANVAS_SIZE[0]} height={CANVAS_SIZE[1]} ref={canvasRef}>
        Hi
      </Board>
      <Modal isOpen={modal !== undefined} style={modalStyles}>
        {renderModal()}
      </Modal>
    </Game>
  );
};

export default App;
