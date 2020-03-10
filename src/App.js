import React, { useState } from 'react';
import './App.css';

const baseWidth = 40;
const baseHeight = 80;
const baseBottom = 1;

function CatBase(props) {
	const style = {
		width:baseWidth,height:baseHeight, right:0, bottom: baseBottom,
		backgroundImage:"url('rightbase.png')"
	}
	return <div className="CatBase" style={style}>{props.children}</div>
}
function Cat(props) {
	const style = {
		width:props.cat.width,
		height:props.cat.height,
		right: props.cat.x, bottom: baseBottom,
		backgroundImage:`url('cat${props.cat.type}${props.cat.x%2?'2':''}.png')`,
		backgroundSize: "contain",
		backgroundRepeat: "no-repeat"
	}
	return <div className="cat" style={style}/>
}
function Enemy(props) {
	const style = {
		width:props.enemy.width,
		height:props.enemy.height,
		left: props.enemy.x, bottom: baseBottom,
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
	const screenWidth = 300;
	const range = 10;
	const initialX = 25;
	const initialHealth = 100;
	const anEnemy ={type:"doge", width:30, height:20, speed:3, initialHealth:initialHealth, pushBacks:10}
	const enemyTypes = [anEnemy, {...anEnemy, type:"snache", height:20, speed:5}, {...anEnemy, type:"Croco", speed:6}];
	const aCat = {type:"A", width:30, height:20, speed:3, initialHealth:initialHealth}
	const catTypes = [aCat, {...aCat, type:"B", height:40, speed:1}, {...aCat, type:"C", speed:5}];
	const initialPos = {
		cats: [{...aCat, x:initialX}],
		enemies: [{...anEnemy, x:initialX}],
	}

	const [beforeBattle, setBefore] = useState(true);
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
	function withinRange(unit, enemy)
	{
		return screenWidth - (unit.x + enemy.x + unit.width + enemy.width + unit.speed + enemy.speed) < range;
	}
	// determine if any unit in the array would be within cat range after move
	function anyUnitWithinRange(unit, enemyUnits)
	{
		return enemyUnits.some((enemyUnit)=>withinRange(unit, enemyUnit));
	}
	function getNextCatPos(x)
	{
		return {...x, 
			cats:x.cats.map((cat)=>(anyUnitWithinRange(cat, x.enemies) ? cat : {...cat, x:cat.x + cat.speed}))
		} ; 
	}
	function getNextDogPos(x)
	{
		return {...x, 
			enemies:x.enemies.map( (unit)=>(anyUnitWithinRange(unit, x.cats) ? unit : {...unit, x:unit.x + unit.speed}))}; 
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
		position.cats.push({...type, x:initialX, health:type.initialHealth });
	}
	function addEnemy(type){
		console.log("add enemy", type);
		position.enemies.push({...type, x:initialX, health:type.initialHealth });
	}

	const enemyButtons = enemyTypes.map((enemy, i)=><EnemyButton type={enemy} addEnemy={addEnemy} key={i}/>);
	const catButtons = catTypes.map((cat, i)=><CatButton type={cat} addCat={addCat} key={i}/>);
	const cats = position.cats.map((cat, i)=><Cat cat={cat} key={i}/>);
	const enemies = position.enemies.map((enemy, i)=><Enemy enemy={enemy} key={i}/>);

	const battle = inBattle?		
		<div className="row">
			<div>Time:{time}</div>
			<div className="battle">
				<CatBase>
					{cats}
				</CatBase>
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
