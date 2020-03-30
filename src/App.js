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
	return <div className="CatBase" style={style}>{props.children}<HealthBar health={props.health} maxHealth={props.initialHealth}/></div>
}
function EnemyBase(props) {
	const style = {
		width:baseWidth,height:baseHeight, left:baseX, bottom: baseBottom,
		backgroundImage:"url('leftbase.png')"
	}
	return <div className="EnemyBase" style={style}>{props.children}<HealthBar health={props.health} maxHealth={props.initialHealth}/></div>
}
function HealthBar({health, maxHealth}) {
	const styleHealthBar = {
		position:"absolute", top: -25
	}
return <div style={styleHealthBar}>{health} / {maxHealth}</div>
}
function Cat(props) {
	const style = {
		width:props.cat.width,
		height:props.cat.height,
		right: props.cat.x, bottom: baseBottom,
		backgroundImage:`url('cat${props.cat.type}${props.cat.x%2 && 
			!props.cat.isAttacking ? '2':''}${props.cat.isAttacking?'Attack':''}.png')`,
		backgroundSize: "contain",
		backgroundRepeat: "no-repeat"
	}
	return <div className="cat" style={style}> <HealthBar health={props.cat.health} maxHealth={props.cat.initialHealth}/> </div>
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
	return <div className="enemy" style={style}>  <HealthBar health={props.enemy.health} maxHealth={props.enemy.initialHealth}/> </div>
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
	const initialHealth = 50;
	const initialBaseHealth = 500;
	const unit = {width:25, height:25, speed:3, initialHealth:initialHealth, knockBacks:6, attackRange:2, attackPower:1};
	const anEnemy ={...unit, type:"Doge"}
	const enemyTypes = [anEnemy, 
		{...anEnemy, type:"Snache", width:40, height:15, speed:5, attackPower:2}, 
		{...anEnemy, type:"Croco", width:35, height:15, speed:3, attackPower:4}];
	const aCat = {...unit, type:"A", attackPower:3}
	const catTypes = [aCat, {...aCat, type:"B", height:30, speed:1, attackPower:1, initialHealth:2*initialHealth}, {...aCat, type:"C", speed:5}];
	const initialPos = {
		cats: [],
		enemies: [],
		catBaseHealth: initialBaseHealth,
		enemyBaseHealth: initialBaseHealth
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
			document.timer = setInterval(()=>setTime(moveAll), 200);
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
		const damage = attackers.reduce(function (a, b) {
			return b.attackPower == null ? a : a + b.attackPower;
		}, 0)
		console.log("damage", damage)
		return {...cat, health: cat.health - damage }
	}

	function calculateHealth({cats, enemies})
	{
		// for each cat find all enemies within range and attack them (the first or all within the range)
		// for each enemy find all cats in range and attack them
		let newCats = cats.map((cat)=>damageCat(cat, {cats, enemies}))
		let newEnemies = enemies.map((enemy)=>damageEnemy(enemy, {cats, enemies}))
		var filteredCats = newCats.filter(function(unit){ return unit.health > 0;});
		var filteredEnemies = newEnemies.filter(function(unit){ return unit.health > 0;});
		return {cats:filteredCats, enemies:filteredEnemies};
	}
	function damageEnemy(enemy, {cats, enemies})
	{
		const attackers = cats.filter((unit)=>canAttack(unit, enemy));
		const damage = attackers.reduce(function (a, b) {
			return b.attackPower == null ? a : a + b.attackPower;
		}, 0)
		console.log("damage", damage)
		return {...enemy, health: enemy.health - damage }
	}
	function damageBase(units){
		const attackers = units.filter((unit)=>canAttackBase(unit));
		const damage = attackers.reduce(function (a, b) {
			return b.attackPower == null ? a : a + b.attackPower;
		}, 0)
		return damage;
	}
	function attack(x)
	{
		let newCatBaseHealth = x.catBaseHealth-damageBase(x.enemies);
		if(newCatBaseHealth < 0) newCatBaseHealth = 0;

		return {...x, ...calculateHealth(x), 
			catBaseHealth:newCatBaseHealth, 
			enemyBaseHealth:x.enemyBaseHealth-damageBase(x.cats)}; 
	} 
	function moveCat()
	{
		setPosition(getNextCatPos)
	}

	const attackButton = beforeBattle?
		<button onClick={startBattle}>Attack</button>
		: null;	
	
	function moveDog() {
		setPosition(getNextDogPos)
	}
	function nextCatid()
	{
		return position.cats.length ? Math.max(...position.cats.map(c=>c.id))+1 : 1;
	}
	function nextEnemyid()
	{
		return position.enemies.length ? Math.max(...position.enemies.map(e=>e.id))+1 : 10000;
	}
	function addCat(type){
		console.log("add cat", type);
		position.cats.push({...type, x:initialX, health:type.initialHealth, id:nextCatid() });
	}
	function addEnemy(type){
		console.log("add enemy", type);
		position.enemies.push({...type, x:initialX, health:type.initialHealth, id:nextEnemyid() });
	}

	const enemyButtons = enemyTypes.map((enemy, i)=><EnemyButton type={enemy} addEnemy={addEnemy} key={i}/>);
	const catButtons = catTypes.map((cat, i)=><CatButton type={cat} addCat={addCat} key={i}/>);
	const gameControls = <div>
						{catButtons}
						{enemyButtons}
					</div>

	const victory = <p>Victory!</p>;
	const loss = <p>You lose!</p>;

	const dashboard = position.catBaseHealth <= 0 ? loss : (position.enemyBaseHealth <= 0 ? victory : gameControls);	
	
	const cats = position.cats.map((cat)=><Cat cat={cat} key={cat.id}/>);
	const enemies = position.enemies.map((enemy)=><Enemy enemy={enemy} key={enemy.id}/>);

	const battle = inBattle?		
		<div className="row">
			<div>Time:{time}</div>
			<div className="battle">
				<CatBase health={position.catBaseHealth} initialHealth={initialBaseHealth}>
					{cats}
				</CatBase>
				<EnemyBase health={position.enemyBaseHealth} initialHealth={initialBaseHealth}>
					{enemies}
				</EnemyBase>
				</div>
			<div>
				{dashboard}
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
		{attackButton}{back}
		{battle}
	</div>
  );
}

export default App;
