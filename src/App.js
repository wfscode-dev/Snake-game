import React, {useState, useEffect} from 'react'
import './App.css'
import Cell from "./component/Cell";
import InputName from "./component/InputName";
import StartButton from "./component/StartButton";


const BOARD_SIZE = 10; //размер доски
const BOARD_MATRIX = Array(BOARD_SIZE).fill(Array(BOARD_SIZE).fill(0));//Переменная которая будет хранить масив масивов с ячейками (система координат)
const CONTROL = ['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'];//Масив с кнопками управления
let leaderboard = [{gamer: 'God', points: 200}, {gamer: 'Bot', points: 30}];//Таблица лидеров (симуляция БД)

const checkBoard = position => { //проверка на уход с доски
  switch (true){
    case position >= BOARD_SIZE:
      return 0
    case position < 0:
      return BOARD_SIZE -1
    default:
      return position
  }

}

const App = () => {
  const [snake, setSnake] = useState([[1,1]]);//храним координаты змейки
  const [food, setFood] = useState([0,0]);//храним координаты еды
  const [typefood, setTypeFood] = useState('food');//храним текущий тип еды
  const [direction, setDirection] = useState(CONTROL[0]);//храним направление
  const [name, setName] = useState('Anonymous');//храним имя пользователя
  const [point, setPoint] = useState(0);//храним колличество очков
  const [gameOn, setGameOn] = useState(false);//храним состояние игры
  const [speed, setSpeed] = useState(500);//храним скорость(таймаут при вызовах)
  const [paused, setPaused] = useState(false);//состояние паузы

  function endOfGame() { // в случае проиграша или остановки игры скидываем все
    setGameOn(false);
    setPaused(false);
    let defaultSnake = [[1,1]];
    setSnake(defaultSnake);
    setDirection(CONTROL[0]);
    setPoint(0);
    setFood([0,0]);
    setSpeed(500);
  }

  const startGame = () => {// при старте сбрасываем все
    if (gameOn === false){
       endOfGame();
       setGameOn(true);
       setPaused(true);
     }else {
      endOfGame();
     }
  }

  function randomFood (){ //определяем тип еды
    if(Math.floor(Math.random()*3) === 0){
      return 'food'
    } if (Math.floor(Math.random()*3) === 1){
      return 'food1'
    } else {
      return 'food2'
    }
  }

  function pointerCount (typefood){ //считаем очки в зависиммости от типа еды
    if(typefood === 'food'){
      return 1
    }if(typefood === 'food1'){
      return 5
    }else{
      return 10
    }
  }

  const pausPress = (e) => { //нажатие паузы
    e.preventDefault()
    if(paused){
      setPaused(false);
    }else {
      setPaused(true);
    }
  }

  const handleKeyDown = (event) => {//функция для изминения направления
    const index = CONTROL.indexOf(event.key)
    if(index > -1) {
      setDirection(CONTROL[index]);
    }
  }

  useEffect(() =>{
    document.addEventListener('keydown', handleKeyDown)//прослушка кнопок
  })

  useEffect(() =>{//игровой процесс
    if(gameOn){
      const interval = gameLoop(paused)
      return () => clearInterval(interval)
    }
  },[snake,paused])

  useEffect(() => {//изменяем скорость в зависиммости от колличества очков
    if (point>=50){
      setSpeed(450);
    } if (point>=100){
      setSpeed(350);
    } if (point>=150){
      setSpeed(200);
    }
  },[point])

  const generateFood = () => {//создаем еду
    let newFood
    setTypeFood(randomFood);
    do{
      newFood = [
          Math.floor(Math.random()*BOARD_SIZE),
          Math.floor(Math.random()*BOARD_SIZE)
      ]
    } while (snake.some(elem => elem[0] === newFood[0] && elem[1] === newFood[1]))
    setFood(newFood)
  }



  const gameLoop =(paused)=> {
    const timerId = setTimeout(() => {
      const newSnake = snake;
      let move = [];

      switch (direction) {
        case CONTROL[0]:
          move = [1,0]
          break;
        case CONTROL[1]:
          move = [0,1]
          break;
        case CONTROL[2]:
          move = [-1,0]
          break;
        case CONTROL[3]:
          move = [0,-1]
          break;
      }



      const head = [
        checkBoard(newSnake[newSnake.length-1][0] + move[0]),
        checkBoard(newSnake[newSnake.length-1][1] + move[1])
      ]

      if(paused){
        newSnake.push(head)
        let spliceIndex = 1
        if (head[0] === food[0] && head[1] === food[1]){
          spliceIndex = 0
          setPoint(point+pointerCount(typefood))
          generateFood()
        }

        for (let i = 0; i <= snake.length-2; i++) {//проверка на укус
          if (head[0] === snake[i][0] && head[1] === snake[i][1]){
            leaderboard.push({gamer: name, points: point})
            setGameOn(false)
            setName('Anonymous')
          }
        }
        setSnake(newSnake.slice(spliceIndex))
      }
    },speed)
    return timerId
  }

  return (
    <div className={'wrapper'}>
      <div className="_container start_game">
        <h1 className='game_name'>Snake</h1>
        <p className='secondary_text'><strong>Instructions</strong></p>
        <p className='secondary_text'>Use arrows to control, the game will end when the snake bites itself. Collect food and growth (blue - 1 point, green - 5 points, red - 10 points). Every 50 points, the speed increases. Good luck</p>
        <p className='secondary_text'>Enter name and press start</p>
        <div className='nameInput'>
          <InputName
              onChange = {e => setName(e.target.value)}
              value={name}
              type="text"
              placeholder="Enter name"/>
          <StartButton
              onClick={startGame}>{gameOn?'Stop': 'Start'}</StartButton>
        </div>
      </div>

      {gameOn
          ?
      <div className='_container start_game down'>
        <div className='pauses'>
          <StartButton
              onClick={pausPress}>{paused?"Pause":"Continue"}</StartButton>
        </div>
        <h1 className='secondary_text'>Score: {point}</h1>
        <h1 className='secondary_text'>Speed: {510 - speed}</h1>
        {BOARD_MATRIX.map((row, indexR) =>(
            //row - один масив из матрицы
            //indexR - индекс масива из матрицы
            <div key={indexR} className='row'>
              {row.map((call, indexC)=> {
                //call - одна ячейка
                //indexC - индекс ячейки

                let type = snake.some(elem => elem[0] === indexR && elem[1] === indexC) && 'snake'//проверка на соответствие ячейки признаку змейка
                if(type !== "snake"){
                  type = (food[0] === indexR && food[1] === indexC) && typefood//'food'//проверка на соответствие ячейки признаку еда
                }

                return(
                      <Cell type={type} key={indexC}/>
                )
              })}
            </div>
        ))}
        </div>
          :
          <div className="_container down">
              <h1 className='game_name'>Leaderboard</h1>
              {leaderboard.map((elem, index) => {
                return <h2 className='game_name' key={index}>{elem.gamer} - {elem.points}</h2>
              })}
          </div>
          }
    </div>

  );

}

export default App;
