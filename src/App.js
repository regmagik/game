import React, { useState } from 'react';
import './App.css';
console.log("v1");
const timerInterval = 200; 
const speedFactor = .5;	
const screenWidth = 320;
const initialX = 25;
const initialHealth = 100; // basic cat initial health (physical fitness) can grow to 4200, offensive power 335 with level, treasures, etc.
const initialBaseHealth = 5000;

const baseFactor = 1.8;
const baseWidth = baseFactor * 40;
const baseHeight = baseFactor * 80;
const baseBottom = 1;
const baseX = 2;

const buttonWidth = 32;
const buttonH = buttonWidth;

let nextUnitIdGlobal = 1;
function nextUnitId() {
	return ++nextUnitIdGlobal;
}
const attackTypes = {
	singleAttack: 'Single',
	areaAttack: 'Area'
}
function CatBase(props) {
	const style = {
		width:baseWidth, height:baseHeight, right:baseX, bottom: baseBottom,
		backgroundImage:"url('catBase.png')"
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
function HealthBar({health, maxHealth, label}) {
	const width = 24, borderWidth = 0;
	const height = 4;
	const fractionHealth = health / maxHealth;
	const borderLeftWidth = fractionHealth*width;
	const borderRightWidth = width - borderLeftWidth;
	const colorLeft = 'grey';
	const colorRight = fractionHealth > .25 ? 'orange' : 'red';
	const styleHealthBar = {
			position:"absolute", top: -height, right:0,
			backgroundColor: colorLeft,
			borderLeftColor: colorLeft,
			borderRightColor: colorRight,
			opacity:'80%',
			borderWidth: borderWidth, borderRadius:2,
			borderLeftWidth: borderLeftWidth, borderRightWidth:borderRightWidth,
			borderStyle:'solid',
			width: 0, // consider using box model
			height: height,
			padding:0,//marginLeft:"auto",//flexGrow:0,flexShrink:0,
		}
	  
		return <div style={styleHealthBar} />
}

function Cat(props) {
	const f = props.cat.imageToLogicalPxFactor;
	const style = {
		width:f*(props.cat.isAttacking ? props.cat.attackWidth:props.cat.width),
		height:f*props.cat.height,
		right: props.cat.x, bottom: baseBottom,
		backgroundImage:`url('${props.cat.type}.png')`,
		backgroundSize: getBackgroundSize(props.cat),
		backgroundPositionX: getBackgroundPositionX(props.cat, props.time),
		backgroundRepeat: "no-repeat"
	}
	return <div className="cat" style={style}> 
		<HealthBar health={props.cat.health} maxHealth={props.cat.initialHealth}/> 
	</div>
}
function getBackgroundSize(unit){
	const f = unit.imageToLogicalPxFactor;
	return `${f*getTotalWidth(unit)}px ${f*unit.height}px`
}
function getTotalWidth(unit){
	return unit.walkingImageCount*unit.width + unit.attackImageCount*unit.attackWidth + unit.hurtWidth;
}

function getBackgroundPositionX(unit, time){
	// use the first image for idle unit
	if(unit.isIdle) return 0;
	const numberOfImages = unit.isAttacking ? unit.attackImageCount : unit.walkingImageCount;
	const index = unit.isAttacking ? (time - unit.lastAttackStart) % numberOfImages
			: (unit.initialIndex + time) % numberOfImages;

	const offset = unit.isAttacking ? 
		(unit.walkingImageCount*unit.width + unit.attackWidth*index) 
		: unit.width*index;
	return -offset*unit.imageToLogicalPxFactor;
}
// function CatV(props) {
// 	const style = {
// 		width:props.cat.width,
// 		height:props.cat.height,
// 		position:"absolute", right: props.cat.x, bottom: baseBottom,
// 	}
// 	return <div style={style}>
// 		<video width={props.cat.width} height={props.cat.height} autoplay>
// 			<source src={"cat"+props.cat.type+".mp4"} type="video/mp4"/>
// 		</video> 
// 	</div>
// }
function Enemy(props) {
	const f = props.enemy.imageToLogicalPxFactor;
	const style = {
		width:f*(props.enemy.isAttacking ? props.enemy.attackWidth:props.enemy.width),
		height:f*props.enemy.height,
		left: props.enemy.x, bottom: baseBottom,
		backgroundImage:`url('${props.enemy.type}.png')`,
		backgroundSize: getBackgroundSize(props.enemy),
		backgroundPositionX: getBackgroundPositionX(props.enemy, props.time),
		backgroundRepeat: "no-repeat"
	}
	return <div className="enemy" style={style}> 
		<HealthBar health={props.enemy.health} maxHealth={props.enemy.initialHealth}/>
	</div>
}

function CatButton(props) {
	function onAdd(){
		props.addCat(props.type)
	}
	const buttonStyle = {
		width:buttonWidth,
		height:buttonH,
		float:"right",
//		border: 1, borderColor:"white", borderWidth: 1, borderStyle: 'solid',
		marginLeft: 1,
		paddingBottom: 1,
	}
	
	var scale = props.type.imageToLogicalPxFactor*buttonWidth/props.type.width;
	const imgStyle = {
		width:props.type.imageToLogicalPxFactor*buttonWidth,
		height:buttonH,
		backgroundImage:`url('${props.type.type}.png')`,
		backgroundSize: `${scale*getTotalWidth(props.type)}px ${scale*props.type.height}px`,
		backgroundRepeat: "no-repeat",
		backgroundPosition: "left bottom",
		margin:"auto"
	}
	return <div style={buttonStyle} onClick={onAdd}><div style={imgStyle}></div></div>
}
function EnemyButton(props) {
	function onAdd(){
		props.addEnemy(props.type)
	}
	const buttonStyle = {
		width:buttonWidth,
		height:buttonH,
		backgroundImage:`url('${props.type.type}.png')`,
		backgroundSize: `${buttonWidth*getTotalWidth(props.type)/props.type.width}px ${buttonWidth*props.type.height/props.type.width}px`,
		backgroundPosition: "left center",
		backgroundRepeat: "no-repeat",
		float:"left"
	}
	return <div style={buttonStyle} onClick={onAdd}/>
}
function App() {
	const unit = {width:25, height:25,
		// sprite layout: walking - attack - hurt 
		walkingImageCount: 3, attackImageCount: 4, attackWidth: 25, hurtWidth: 0,
		imageToLogicalPxFactor: 1,
		cost:75, 
		timeToMake:2, // time to wait before adding another unit of this type, seconds. 
		speed:speedFactor*10,// moving speed 
		timeBetweenAttacks:1.23, // time to wait before unit can attack again
		initialHealth:initialHealth, knockBacks:3, 
		attackPower:1, attackRange:2, attackType:attackTypes.singleAttack};
	const enemyTypes =  [
		{...unit, type:"doge", width:55, height:60, attackWidth:55, imageToLogicalPxFactor: .5, 
			initialHealth:90, attackPower:8, attackRange:1.1, 
			speed:speedFactor*5, timeBetweenAttacks:1.8,},//sprite sheet 372 x 60 px 
		{...unit, type:"snache", 
			width:75, attackWidth: 80, hurtWidth: 140, walkingImageCount: 4, height:63, imageToLogicalPxFactor: .5, 
			initialHealth:100, attackPower:15, attackRange:1.1,
			speed:speedFactor*8, 
		}, 
		{...unit, type: "baa", width:100, attackWidth: 140, hurtWidth:100, height:87, attackImageCount:7, 
			imageToLogicalPxFactor: .5, 
			knockBacks:2, initialHealth:500, attackPower:50, attackRange:1.1, //110
			speed:speedFactor*7, timeBetweenAttacks:2.8,
	},
	//	{...unit, type:"croco", width:35, height:15, speed:speedFactor*3, attackPower:4},
	];

	const aCat = {...unit, type:"A", speed:speedFactor*10}
	const catTypes = [
		{...aCat, width:50, height:58, attackWidth:48, attackImageCount: 3, imageToLogicalPxFactor: 0.5,
			attackPower:8, 
		}, 
//		{...aCat, type:"gold", width:50, height:58, attackWidth:60, hurtWidth:60, attackImageCount: 4, 
//			imageToLogicalPxFactor: 0.5}, 
		{...aCat, type:"B", width:53, height:101, attackWidth: 80, imageToLogicalPxFactor: 0.5,
			attackType:attackTypes.areaAttack,  attackRange:8,  
			attackPower:2, initialHealth:4*initialHealth, knockBacks:1,
			speed:speedFactor*8, timeBetweenAttacks:2.23
		},
		{...aCat, type:"wall", width:71, height:143, attackWidth: 160, walkingImageCount: 3, attackImageCount: 7, hurtWidth:80, 
			imageToLogicalPxFactor: 0.4,
			attackType:attackTypes.areaAttack,  attackRange:8, 
			attackPower:2, initialHealth:4*initialHealth, knockBacks:1,
			speed:speedFactor*8, timeBetweenAttacks:2.23
		},
		{...aCat, type:"axe", width:53, height:63, attackWidth: 56, hurtWidth: 36, imageToLogicalPxFactor: 0.7, 
			attackPower:25,  attackRange:3, initialHealth:2*initialHealth, speed:speedFactor*12, timeBetweenAttacks:1,
		},// 106, 115, 75 x 126 
		{...aCat, type:"sword", speed:speedFactor*12, width:48, height:63, attackWidth: 69, hurtWidth: 42, imageToLogicalPxFactor: 0.7},
		{...aCat, type:"legs", width:90, height: 306, 
			imageToLogicalPxFactor:0.4, walkingImageCount:5, attackWidth:250, 
			initialHealth:4*initialHealth, attackPower:initialHealth, attackRange:3.5, 
			speed:speedFactor*10, timeBetweenAttacks:4.6,  
		},
		{...aCat, type:"cow", width:109, height: 120, 
			imageToLogicalPxFactor:0.4, walkingImageCount:4, attackWidth:150, hurtWidth:156,
			initialHealth:4*initialHealth, attackPower:initialHealth, attackRange:1.5, 
			speed:speedFactor*30, timeBetweenAttacks:.3,  
		},
		{...aCat, type:"giraffe", width:100, height: 160, 
			imageToLogicalPxFactor:0.4, walkingImageCount:4, attackImageCount:5, attackWidth:168, hurtWidth:262, 
			initialHealth:4*initialHealth, attackPower:initialHealth, attackRange:3.5, 
			speed:speedFactor*30, timeBetweenAttacks:.3,  
		},
		{...aCat, type:"dragon", width:114, height: 183, 
			imageToLogicalPxFactor:0.4, walkingImageCount:4, attackImageCount:4, attackWidth:210, hurtWidth:120, 
			initialHealth:4*initialHealth, attackPower:initialHealth, attackRange:22, 
			speed:speedFactor*10, timeBetweenAttacks:2.3,  
		},
	];
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
		setTime(1)
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

	function restartBattle()
	{
		stopTimer();
		startBattle();
	}

	function leaveBattle()
	{
		stopTimer();
		setBefore(true);
		setBattle(false);
	}
	function debugBattle()
	{
		stopTimer();
		step();
	}
	function step()
	{
		setTime(moveAll);
	}
	function startTimer()
	{
		if(document.timer === undefined)
		{
			console.log("setInterval", timerInterval)
			document.timer = setInterval(step, timerInterval);
		}
	}
	function stopTimer()
	{
		if(document.timer === undefined) return;
		clearInterval(document.timer);
		console.log("clearInterval", document.timer)
		document.timer = undefined;
	}

	function moveAll(x)
	{
		const t = x+1;
//		console.log(t)
		moveCat(t);
		moveDog(t);
		// pass time in addition to position state (alternatively we might include time into the rest of state)
		setPosition(pos=>attack(pos, t));
	// automatically add enemies
		if(t%45===5) setPosition(sendEnemy);
		return t;
	}

	// React.useEffect( () => {	console.log("useEffect");
	// 	startTimer();
	// 	return stopTimer;
	// 	}, []);

	// determine if the target would be within the unit's attack range after both move
	function withinRange(unit, target)
	{
		return screenWidth - baseX - (unit.x + target.x + unit.imageToLogicalPxFactor*unit.attackWidth + target.imageToLogicalPxFactor*target.attackWidth) < unit.attackRange;
//		return screenWidth - baseX - (unit.x + target.x + unit.imageToLogicalPxFactor*unit.width + target.imageToLogicalPxFactor*target.width + unit.speed + target.speed) < unit.attackRange;
//		return screenWidth - baseX - (unit.x + target.x + unit.imageToLogicalPxFactor*Math.max(unit.width, unit.attackWidth) + target.imageToLogicalPxFactor*Math.max(target.width, target.attackWidth) + unit.speed + target.speed) < unit.attackRange;
	}
	//check if the unit is close to opposite base
	function canAttackBase(unit)
	{
		return screenWidth - baseX - baseWidth  - (unit.x + unit.imageToLogicalPxFactor*unit.attackWidth + unit.speed ) < unit.attackRange;
	}
	//check if the unit can damage opposite base
	function canDamageBase(unit, time)
	{
		return isDamageTime(unit, time) && canAttackBase(unit);
	}
	// determine if any target would be within unit's attack range after move
	function anyUnitWithinRange(unit, targets)
	{
		return targets.some((target)=>withinRange(unit, target));
	}
	function getNextCatPos(x, t)
	{
		return {...x, cats:x.cats.map(cat => getNextUnitPos(cat, x.enemies, t))
		};
	}
	function isAttackDelayElapsed(unit, tick)
	{
		// compare time ticks to seconds by converting both to milliseconds
		return (tick - unit.lastAttackEnd) * timerInterval >= unit.timeBetweenAttacks * 1000;
	}
	function getNextUnitPos(unit, others, t)
	{
		const attackDelayElapsed = isAttackDelayElapsed(unit, t);
		const anyTargetsInRange = anyUnitWithinRange(unit, others) || canAttackBase(unit);
		const attackComplete = t - unit.lastAttackStart === unit.attackImageCount;
		// if a unit is in the middle of animation - it must finish animation 
		return unit.isAttacking ? {...unit, isAttacking:anyTargetsInRange && !attackComplete, 
				lastAttackEnd:(attackComplete ? t : 0), isIdle:attackComplete, 
			}
			: (anyTargetsInRange ? 
				{...unit, isAttacking:attackDelayElapsed, isIdle:!attackDelayElapsed, 
					lastAttackStart:(unit.isAttacking ? unit.lastAttackStart 
						: (attackDelayElapsed ? t : 0)), 					 
				} 
				: {...unit, isAttacking:false, isIdle:false, x:unit.x + unit.speed, lastAttackStart:0, 
					lastAttackEnd:(unit.isAttacking ? t : unit.lastAttackEnd) 
				});
	}
	function getNextDogPos(x, t)
	{
		return {...x, enemies:x.enemies.map( unit => getNextUnitPos(unit, x.cats, t))};
	}
	function getSingleTarget(unit, targets){ 
		//make a copy of the array before sorting
		return [...targets].sort((a,b) => b.x - a.x).find(target => withinRange(unit, target));
	}
	function isDamageTime(unit, time)
	{
		return time - unit.lastAttackStart === unit.attackImageCount - 1;
	}
	function canAttack(unit, target, oppositeTeam, time)
	{
		if(!isDamageTime(unit, time)) return false;
//		console.log(unit.type, "can damage", target.type);

		return (unit.attackType === attackTypes.areaAttack) ? withinRange(unit, target)
			: (getSingleTarget(unit, oppositeTeam) === target);
	}
	function damageUnit(targret, team, others, t)
	{
		const attackers = others.filter((foe)=>canAttack(foe, targret, team, t));
		const damage = attackers.reduce((a, b) => b.attackPower == null ? a : (a + b.attackPower), 0);
		if(damage > targret.health)
			console.log(targret.type, targret.id, "is dead.")
		else if(damage > 0)
			console.log(targret.type, targret.id, "damage", damage)
		const newUnit = {...targret, health: targret.health - damage, 
			x:isKnockback(targret, damage) ? (targret.x - 30) : targret.x}
		
		return newUnit;
	}
	function isKnockback(unit, damage)
	{
		if(damage <= 0 || unit.knockBacks < 2)	return false;

		const startHealth = unit.health 
		const endHealth = unit.health - damage
		const threshold = unit.initialHealth / unit.knockBacks;

		let knockback = threshold;
		while(knockback < unit.health)
		{
//			console.log(knockback)
			knockback += threshold
			if((startHealth > knockback) && (endHealth <= knockback))
			{
//				console.log("knockback for", unit.type);
				return true;
			}
		}
		return false;
	}
	function calculateHealth({cats, enemies}, t)
	{
		// for each unit find all enemies who can attack it and apply damage
		let newCats = cats.map((cat)=>damageUnit(cat, cats, enemies, t))
		let newEnemies = enemies.map((enemy)=>damageUnit(enemy, enemies, cats, t))
		var filteredCats = newCats.filter(function(unit){ return unit.health > 0;});
		var filteredEnemies = newEnemies.filter(function(unit){ return unit.health > 0;});
		return {cats:filteredCats, enemies:filteredEnemies};
	}
	function damageBase(units, t){
		const attackers = units.filter((unit)=>canDamageBase(unit, t));
		const damage = attackers.reduce(function (a, b) {
			return b.attackPower == null ? a : a + b.attackPower;
		}, 0)
		return damage;
	}
	function sendEnemy(x)
	{
		//need actual level rules
		const index = Math.floor(Math.random() * enemyTypes.length)
//		console.log("send", enemyTypes[index].type);
		return {...x, enemies:[...x.enemies, getUnit(enemyTypes[index])]}; 
	}
	function attack(x, t)
	{
		let newCatBaseHealth = x.catBaseHealth-damageBase(x.enemies, t);
		if(newCatBaseHealth < 0) 
		{
			stopTimer()
			newCatBaseHealth = 0;
		}
		let newEnemyBaseHealth = x.enemyBaseHealth-damageBase(x.cats, t);
		if(newEnemyBaseHealth < 0) 
		{
			stopTimer()
			newEnemyBaseHealth = 0;
		}
		return {...x, ...calculateHealth(x, t), 
			catBaseHealth:newCatBaseHealth, 
			enemyBaseHealth:newEnemyBaseHealth}; 
	} 
	function moveCat(time)
	{
		setPosition(x=>getNextCatPos(x, time))
	}

	const attackButton = beforeBattle?
		<button onClick={startBattle}>Attack</button>
		: null;	
	
	function moveDog(t) {
		setPosition(x => getNextDogPos(x, t))
	}

	function getUnit(type){
		const id = nextUnitId();
		console.log(id, type.type);
		return {...type, x:initialX, health:type.initialHealth, id:id,
			initialIndex: getRandomImageOffset(type), 
			isAttacking: false, isIdle:false,
			lastAttackStart: 0, 
			lastAttackEnd: 0, // for waiting between attacks
		}
	}
	function startBattleOnce(){
		setTime(x=>{//console.log("startBattleOnce...");
			if(!x){ console.log("starting battle..."); startBattle(); return 1; } 
			return x+1});
	}
	function addCat(type){
		console.log("add cat", type.type);
//		const f = 1;
//		console.log(type.type, "width", f*type.width, "attack width", f*type.attackWidth, "total width", f*getTotalWidth(type));
//		const walk = f*type.width*type.walkingImageCount, attack = f*type.attackWidth*type.attackImageCount;
//		console.log("total walking width", walk, "total attack width", attack, "total walk+attack width", walk+attack);
		startBattleOnce();
		setPosition(x => ({...x, 
			cats:[...x.cats, getUnit(type)]
		}));
	}
	function getRandomImageOffset(type){
		return Math.floor(Math.random() * type.walkingImageCount);
	}

	function addEnemy(type){
//		const f = 1;
//		console.log("add enemy", type.type, "width", f*type.width, "attack width", f*type.attackWidth, "total width", f*getTotalWidth(type));
		startBattleOnce();
		setPosition(x => ({...x, 
			enemies:[...x.enemies, getUnit(type)]
		}));
	}

	const enemyButtons = enemyTypes.map((enemy, i)=><EnemyButton type={enemy} addEnemy={addEnemy} key={i}/>);
	const catButtons = catTypes.map((cat, i)=><CatButton type={cat} addCat={addCat} key={i}/>);
	const gameControls = <>
		<div>Click to send cats into the battle:</div>
		<div className="dashboard">
			{catButtons}
		</div>
		<div>Enemies in this level:</div>
		<div className="dashboard">
			{enemyButtons}
		</div>
	</>
	const victory = <p>Victory!</p>;
	const loss = <p>You lose!</p>;

	const dashboard = position.catBaseHealth <= 0 ? loss : 
		(position.enemyBaseHealth <= 0 ? victory : gameControls);	
	
	const cats = position.cats.map((cat)=><Cat cat={cat} key={cat.id} time={time}/>);
	const enemies = position.enemies.map((enemy)=><Enemy enemy={enemy} key={enemy.id} time={time}/>);

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
			{dashboard}
		</div> 
		: null;
		const back = inBattle?
		<>
		<button onClick={pauseBattle}>Pause</button>	
		<button onClick={resumeBattle}>Resume</button>	
		<button onClick={restartBattle}>Restart</button>	
		<button onClick={leaveBattle}>Back</button>	
		<button onClick={debugBattle}>Debug</button>	
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
