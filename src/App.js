import React, { useState } from 'react';
import './App.css';

const baseWidth = 40;
const baseHeight = 80;
const baseBottom = 1;
const baseX = 2;
const attackTypes = {
	singleAttack: 'Single',
	areaAttack: 'Area'
}
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
	const width = 30;
	const height = 5;
	const styleHealthBar = {
		position:"absolute", top: -25,
		borderColor: 'blue',
		borderWidth: 1,
		borderStyle:'solid',
		width: width,
		height: height
		}
		const percentHealth = (100 * health) / maxHealth;
		const color = percentHealth > 25 ? 'green' : 'red';
		const styleHealthIndicator = {
			width: (width * health) / maxHealth,
			height: height,
			backgroundColor: color
			}
	  
return <div style={styleHealthBar}>
			<div style={styleHealthIndicator}></div>
	</div>
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
		backgroundImage:`url('enemy${props.enemy.type}${props.enemy.x%2 &&
			!props.enemy.isAttacking ? '2':''}${props.enemy.isAttacking?'Attack':''}.png')`,
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
	const unit = {width:25, height:25, speed:3, initialHealth:initialHealth, knockBacks:5, 
		attackRange:2, attackPower:1, attackType:attackTypes.areaAttack};
	const enemyTypes =  [
		{...unit, type:"Doge", attackType:attackTypes.singleAttack}, 
		{...unit, type:"Snache", width:40, height:15, speed:5, attackPower:2,}, 
		{...unit, type:"Croco", width:35, height:15, speed:3, attackPower:4}];

	const aCat = {...unit, type:"A", attackPower:3}
	const catTypes = [aCat, 
		{...aCat, type:"B", height:40, speed:1, attackPower:1, initialHealth:2*initialHealth, knockBacks:1}, 
		{...aCat, type:"C", speed:5}];
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

	// React.useEffect( () => {	console.log("useEffect")
	// 	const i_id = setInterval(() => {setPosition(moveAll);},1000);
	// 	return () => { clearInterval(i_id);	}
	// },[]);

	function moveAll(x)
	{
		moveCat();
		moveDog();
		setPosition(attack);
		if(x%30===1) setPosition(sendEnemy);
		return x+1;
	}
	// determine if the target would be within the unit's attack range after both move
	function withinRange(unit, target)
	{
		return screenWidth - baseX - (unit.x + target.x + unit.width + target.width + unit.speed + target.speed) < unit.attackRange;
	}
	//check if the unit is close to opposite base
	function canAttackBase(unit)
	{
		return screenWidth - baseX - baseWidth  - (unit.x + unit.width + unit.speed ) < unit.attackRange;
	}
	// determine if any target would be within unit's attack range after move
	function anyUnitWithinRange(unit, targets)
	{
		return targets.some((target)=>withinRange(unit, target));
	}
	function getNextCatPos(x)
	{
		return {...x, 
			cats:x.cats.map((cat)=>(anyUnitWithinRange(cat, x.enemies) || canAttackBase(cat) ? {...cat, isAttacking:true} : {...cat, isAttacking:false, x:cat.x + cat.speed}))
		};
	}
	function getNextDogPos(x)
	{
		return {...x, 
			enemies:x.enemies.map( (unit)=>
		(anyUnitWithinRange(unit, x.cats) || canAttackBase(unit) ? {...unit, isAttacking:true} : {...unit,isAttacking:false, x:unit.x + unit.speed}))};
	}
	function getSingleTarget(unit, targets){ 
		return targets.find(target => withinRange(unit, target));
	}
	function canAttack(unit, target, oppositeTeam)
	{
		return (unit.attackType === attackTypes.areaAttack) ? withinRange(unit, target)
			: (getSingleTarget(unit, oppositeTeam) === target);
	}

	function damageCat(cat, {cats, enemies})
	{
		const attackers = enemies.filter((unit)=>canAttack(unit, cat, cats));
		const damage = attackers.reduce(function (a, b) {
			return b.attackPower == null ? a : a + b.attackPower;
		}, 0)
//		console.log("damage", damage)
		const newCat = {...cat, health: cat.health - damage, 
			x:isKnockback(cat, damage) ? (cat.x - 30) : cat.x}
		
		return newCat;
	}
	function isKnockback(unit, damage)
	{
		if(damage <= 0 || unit.knockBacks < 2)	return false;

		const startHealth = unit.health 
		const endHealth = unit.health - damage
		const threshold = unit.initialHealth / unit.knockBacks;

		let knockback = 0;
		while(knockback < unit.health)
		{
			console.log(knockback)
			knockback += threshold
			if((startHealth > knockback) && (endHealth <= knockback))
			{
				console.log("knockback for", unit.type);
				return true;
			}
		}
		return false;
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
		const attackers = cats.filter((unit)=>canAttack(unit, enemy, enemies));
		const damage = attackers.reduce(function (a, b) {
			return b.attackPower == null ? a : a + b.attackPower;
		}, 0)
		//console.log("damage", damage)
		return {...enemy, health: enemy.health - damage }
	}
	function damageBase(units){
		const attackers = units.filter((unit)=>canAttackBase(unit));
		const damage = attackers.reduce(function (a, b) {
			return b.attackPower == null ? a : a + b.attackPower;
		}, 0)
		return damage;
	}
	function sendEnemy(x)
	{
		return {...x, enemies:[...x.enemies, getEnemy(enemyTypes[0], nextUnitId(x.enemies))]}; 
	}
	function attack(x)
	{
		let newCatBaseHealth = x.catBaseHealth-damageBase(x.enemies);
		if(newCatBaseHealth < 0) 
		{
			stopTimer()
			newCatBaseHealth = 0;
		}
		let newEnemyBaseHealth = x.enemyBaseHealth-damageBase(x.cats);
		if(newEnemyBaseHealth < 0) 
		{
			stopTimer()
			newEnemyBaseHealth = 0;
		}
		return {...x, ...calculateHealth(x), 
			catBaseHealth:newCatBaseHealth, 
			enemyBaseHealth:newEnemyBaseHealth}; 
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
	function nextUnitId(units)
	{
		const nextId = (units.length > 0) ? (Math.max(...units.map(e=>e.id))+1) : 2;
		console.log("next id", nextId)
		return nextId;
	}
	function getCat(type){
		return {...type, x:initialX, health:type.initialHealth, id:nextCatid() }
	}
	function addCat(type){
//		console.log("add cat", type);
		position.cats.push(getCat(type));
	}
	function getEnemy(type, id){
		return {...type, x:initialX, health:type.initialHealth, id:id };
	}

	function addEnemy(type){
//		console.log("add enemy", type);
		position.enemies.push(getEnemy(type, nextUnitId(position.enemies)));
	}

	const enemyButtons = enemyTypes.map((enemy, i)=><EnemyButton type={enemy} addEnemy={addEnemy} key={i}/>);
	const catButtons = catTypes.map((cat, i)=><CatButton type={cat} addCat={addCat} key={i}/>);
	const gameControls = <>
		<div>
			{catButtons}
		</div>
		<div>
			{enemyButtons}
		</div>
	</>
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
