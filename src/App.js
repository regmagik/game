import React, { useState } from 'react';
//import logo from './logo.svg';
import './App.css';

function Cat(props) {
	const style = {
		width:props.cat.width,
		height:props.cat.height,
		right: props.cat.catX,
		backgroundImage:`url('cat${props.cat.type}${props.cat.catX%2?'2':''}.png')`,
		backgroundSize: "contain",
		backgroundRepeat: "no-repeat"
	}
	return <div className="cat" style={style}/>
}
function Enemy(props) {
	const style = {
		width:props.enemy.width,
		height:props.enemy.height,
		left: props.enemy.x,
		backgroundImage:`url('enemy${props.enemy.type}${props.enemy.x%2?'2':''}.png')`,
		backgroundSize: "contain",
		backgroundRepeat: "no-repeat"
	}
	return <div className="doge" style={style}/>
}


function CatButton(props) {
	function onAdd(){
		props.addCat(props.type)
	}
	const buttonStyle = {
		width:30,
		height:20,
		backgroundImage:`url('cat${props.type.type}.png')`,
		backgroundSize: "contain",
		backgroundRepeat: "no-repeat",
		float:"right"
	}
	return <div style={buttonStyle} onClick={onAdd}/>
}
function EnemyButton(props) {
	function onAdd(){
		props.addEnemy(props.type)
	}
	const buttonStyle = {
		width:30,
		height:20,
		backgroundImage:`url('enemy${props.type.type}.png')`,
		backgroundSize: "contain",
		backgroundRepeat: "no-repeat",
		float:"left"
	}
	return <div style={buttonStyle} onClick={onAdd}/>
}
function App() {
	const screenWidth = 500;
	const range = 20;
	const initialX = 75;
	const anEnemy ={type:"doge", width:30, height:20, speed:3}
	const enemyTypes = [anEnemy, {...anEnemy, type:"snache", height:20, speed:5}, {...anEnemy, type:"Croco", speed:6}];
	const aCat = {type:"A", width:30, height:20, speed:3}
	const catTypes = [aCat, {...aCat, type:"B", height:40, speed:1}, {...aCat, type:"C", speed:5}];
	const initialPos = {
		cats: [{...aCat, catX:initialX+33}],
		enemies: [{...anEnemy, x:initialX+33}],
	}

	const [beforeBattle, setBefore] = useState(false);
	const [inBattle, setBattle] = useState(true);
	const [position, setPosition] = useState(initialPos);
	const [time, setTime] = useState(0);

	function startBattle()
	{
		setTime(0)
		setPosition(initialPos)
		setBefore(false);
		setBattle(true);
		document.timer = setInterval(()=>setTime(moveAll), 500);
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
	// determine if the units would be within range after move
	function withinRange(cat, enemy)
	{
		return screenWidth - (cat.catX + enemy.x + cat.width + enemy.width + cat.speed + enemy.speed) < range;
	}
	// determine if any unit in the array would be within cat range after move
	function anyUnitWithinRange(cat, enemyUnits)
	{
		return enemyUnits.some((unit)=>withinRange(cat, unit));
	}
	function getNextCatPos(x)
	{
		return {...x, 
			cats:x.cats.map((cat)=>(anyUnitWithinRange(cat, x.enemies) ? cat : {...cat, catX:cat.catX + cat.speed}))
		} ; 
	}
	function getNextDogPos(x)
	{
		return {...x, enemies:x.enemies.map( (unit)=>({...unit, x:unit.x + unit.speed}))}; 
	}
	function moveCat()
	{
		setPosition(getNextCatPos)
	}

	const attack = beforeBattle?
		<button onClick={startBattle}>Attack</button>
		: null;	
	
//	const victory = 	<p>Victory!</p>
	
	function moveDog() {
		setPosition(getNextDogPos)
	}

	function addCat(type){
		console.log("add cat", type);
		position.cats.push({...type, catX:initialX });
	}
	function addEnemy(type){
		console.log("add enemy", type);
		position.enemies.push({...type, x:initialX });
	}

	const enemyButtons = enemyTypes.map((enemy, i)=><EnemyButton type={enemy} addEnemy={addEnemy} key={i}/>);
	const catButtons = catTypes.map((cat, i)=><CatButton type={cat} addCat={addCat} key={i}/>);
	const cats = position.cats.map((cat, i)=><Cat cat={cat} key={i}/>);
	const enemies = position.enemies.map((enemy, i)=><Enemy enemy={enemy} key={i}/>);

	const battle = inBattle?		
		<div className="row">
			<div>Time:{time}</div>
			<div className="battle">
				<div className="CatBase">
					Cat 
					{cats}
				</div>
				<div className="EnemyBase">
					Enemy
					{enemies}
				
				</div>
			</div>
			<div>
				<div>
					{catButtons}
					{enemyButtons}
				</div>
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
