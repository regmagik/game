import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
	const screenWidth = 500;
	const speed = 25;
	const dogSpeed = 10;
	const range = 20;
	const initialX = 75;
	const catWidth = 30;
	const dogWidth = 50;
	const initialPos = {
		catX: initialX,
		dogX: initialX
	}
	const [beforeBattle, setBefore] = useState(true);
	const [inBattle, setBattle] = useState(false);
	const [position, setPosition] = useState(initialPos);
	const [time, setTime] = useState(0);
//	const [items, setItems] = useState([{x:11}]);

	function startBattle()
	{
		setTime(0)
		setPosition(initialPos)
//		setCatX(initialCatX)
//		setDogX(1)
		setBefore(false);
		setBattle(true);
		document.timer = setInterval(()=>setTime(moveAll), 1000);
	}

	// React.useEffect( () => {
	// 	console.log("useEffect")
	// 	const i_id = setInterval(() => {
	// 		setTime(x=>x+1)
	// 		moveAll();
	// 	},1000);
	// 	return () => {
	// 	  clearInterval(i_id);
	// 	}
	//   },[]);

	function moveAll(x)
	{
		moveCat();
		moveDog();
		return x+1;
	}
	// determine if the can and dog would be within range after move
	function withinRange(x)
	{
		return screenWidth - (x.catX + x.dogX + catWidth + dogWidth + speed + dogSpeed) < range;
	}
	function getNextCatPos(x)
	{
		return  withinRange(x) ? x : {...x, catX:x.catX + speed} ; 
	}
	function getNextDogPos(x)
	{
		return  withinRange(x) ? x : {...x, dogX:x.dogX + dogSpeed} ; 
	}
	function moveCat()
	{
		setPosition(getNextCatPos)
	}

	const attack = beforeBattle?
		<button onClick={startBattle}>Attack</button>
		: null;	
	
	const victory = 	<p>Victory!</p>

	var catStyle = {
		right: position.catX,
		width: catWidth,
		backgroundImage:'url("http://www.regmagik.com/download.gif")',
	};
	const cat = <div className="cat" style={catStyle}>&nbsp;</div>
	
	function moveDog() {
		setPosition(getNextDogPos)
	}
	var dogStyle = {
		background: "content-box radial-gradient(crimson, skyblue)",
		left: position.dogX,
		width: dogWidth
	};
	const doge = <div className="doge" style = {dogStyle}>doge</div>

	const enemyButton = <button onClick={moveDog}>Doge</button>
	const catButton = <button onClick={moveCat}>Cat</button>

	const battle = inBattle?		
		<div className="row">
			<div>Time:{time}</div>
			<div className="battle">
				<div className="CatBase">
					Cat Base {position.catX}
					{catButton}
					{cat}
				</div>
				<div className="EnemyBase">
					{enemyButton}
					Enemy Base {position.dogX}
					{doge}
				</div>
			</div>
			<div>
			</div>
		</div> 
		: null;
		const back = inBattle?
			<button onClick={leaveBattle}>Back</button>	: null;	
		function leaveBattle()
		{
			if(document.timer !== undefined) clearInterval(document.timer);
			setBefore(true);
			setBattle(false);
		}
		
  return (
    <div className="App">
      	<header className="App-header">
		  	Battle Cats Labs
	  	</header>
		{attack}
		{back}
		{battle}
	</div>
  );
}

export default App;
