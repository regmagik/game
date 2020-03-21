import React, { useState } from 'react';
import './App.css';

const baseWidth = 40;
const baseHeight = 80;
const baseBottom = 1;
const baseX = 2;

function CatBase(props) {
	const style = {
		width:baseWidth,height:baseHeight, right:baseX, bottom: baseBottom,
		backgroundImage:"url('rightbase.png')"
	}
	return <div className="CatBase" style={style}>{props.children}</div>
}
function EnemyBase(props) {
	const style = {
		width:baseWidth,height:baseHeight, left:baseX, bottom: baseBottom,
		backgroundImage:"url('leftbase.png')"
	}
	return <div className="EnemyBase" style={style}>{props.children}</div>
}
function Cat(props) {
	const style = {
		width:props.cat.width,
		height:props.cat.height,
		right: props.cat.x, bottom: baseBottom,
		backgroundImage:`url('cat${props.cat.type}${props.cat.x%2 && !props.cat.isAttacking ? '2':''}${props.cat.isAttacking?'Attack':''}.png')`,
		backgroundSize: "contain",
		backgroundRepeat: "no-repeat"
	}
	if(props.cat.isAttacking) console.log(props.cat.type, "Attack");
	return <div className="cat" style={style}> <div>{props.cat.health}</div> </div>
	// return <div className="cat" style={style}></div>
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
	const initialX = 25;
	const initialHealth = 100;
	const unit = {width:25, height:25, speed:3, initialHealth:initialHealth, pushBacks:6, attackRange:2, attackPower:1};
	const anEnemy ={...unit, type:"Doge"}
	const enemyTypes = [anEnemy, 
		{...anEnemy, type:"Snache", width:40, height:15, speed:5}, 
		{...anEnemy, type:"Croco", width:35, height:15, speed:3}];
	const aCat = {...unit, type:"A"}
	const catTypes = [aCat, {...aCat, type:"B", height:30, speed:1}, {...aCat, type:"C", speed:5}];
	const initialPos = {
		cats: [],
		enemies: [],
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
		startTimer();
	}

	function pauseBattle()
	{
		stopTimer();
	}

	function resumeBattle()
	{
		startTimer();
	}

	function leaveBattle()
	{
		stopTimer();
		setBefore(true);
		setBattle(false);
	}

	function startTimer()
	{
		if(document.timer === undefined)
			document.timer = setInterval(()=>setTime(moveAll), 800);
	}
	function stopTimer()
	{
		if(document.timer === undefined) return;
		clearInterval(document.timer);
		document.timer = undefined;
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
		setPosition(attack);
		return x+1;
	}
	// determine if the units would be within range after move
	function withinRange(unit, target)
	{
		return screenWidth - baseX - (unit.x + target.x + unit.width + target.width + unit.speed + target.speed) < unit.attackRange;
	}
	//check if the unit is close to opposite base
	function canAttackBase(unit)
	{
		return screenWidth - baseX - baseWidth  - (unit.x + unit.width + unit.speed ) < unit.attackRange;
	}
	// determine if any unit in the array would be within cat range after move
	function anyUnitWithinRange(unit, enemyUnits)
	{
		return enemyUnits.some((enemyUnit)=>withinRange(unit, enemyUnit));
	}
	function getNextCatPos(x)
	{
		return {...x, 
			cats:x.cats.map((cat)=>(anyUnitWithinRange(cat, x.enemies) || canAttackBase(cat) ? {...cat, isAttacking:true} : {...cat, x:cat.x + cat.speed}))
		} ; 
	}
	function getNextDogPos(x)
	{
		return {...x, 
			enemies:x.enemies.map( (unit)=>
		(anyUnitWithinRange(unit, x.cats) || canAttackBase(unit) ? {...unit, isAttacking:true} : {...unit, x:unit.x + unit.speed}))};
	}

	function canAttack(unit, target)
	{
		return withinRange(unit, target);
	}

	function damageCat(cat, {cats, enemies})
	{
		const attackers = enemies.filter((unit)=>canAttack(unit, cat));
		return {...cat, health: cat.health - 2 * attackers.length }
	}

	function calculateHealth({cats, enemies})
	{
		// for each cat find all enemies within range and attack them (the first or all within the range)
		// for each enemy find all cats in range and attack them
		let newCats = cats.map((cat)=>damageCat(cat, {cats, enemies}))
		var filtered = newCats.filter(function(unit){ return unit.health > 0;});

		return {cats:filtered, enemies};
	}
	function attack(x)
	{
		return {...x, ...calculateHealth(x)}; 
	} 
	function moveCat()
	{
		setPosition(getNextCatPos)
	}

	const attackButton = beforeBattle?
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
				<EnemyBase>
					{enemies}
				</EnemyBase>
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
		<>
		<button onClick={pauseBattle}>Pause</button>	
		<button onClick={resumeBattle}>Resume</button>	
		<button onClick={leaveBattle}>Back</button>	
		</> : null;	
		
  return (
    <div className="App">
      	<header className="App-header">
		  	Battle Cats Labs
	  	</header>
		{attackButton}
		{back}
		{battle}
	</div>
  );
}

export default App;
