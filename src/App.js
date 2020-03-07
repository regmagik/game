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
		float:"left"
	}
	return <div style={buttonStyle} onClick={onAdd}/>
}

function App() {
	const screenWidth = 500;
	const speed = 5;
	const dogSpeed = 3;
	const range = 20;
	const initialX = 75;
	const catWidth = 30;
	const dogWidth = 50;

	const aCat = {type:"A", width:30, height:20, speed:3}
	const catTypes = [aCat, {...aCat, type:"B", height:40, speed:1}, {...aCat, type:"C", speed:5}];
	const initialPos = {
		cats: [{...aCat, catX:initialX+33}],
		catX: initialX,
		dogX: initialX
	}

	const [beforeBattle, setBefore] = useState(false);
	const [inBattle, setBattle] = useState(true);
	const [position, setPosition] = useState(initialPos);
	const [time, setTime] = useState(0);
//	const [items, setItems] = useState([{x:11}]);

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
	// determine if the can and dog would be within range after move
	function withinRange(x)
	{
		return screenWidth - (x.catX + x.dogX + catWidth + dogWidth + speed + dogSpeed) < range;
	}
	function getNextCatPos(x)
	{
		return {...x, 
			cats:x.cats.map((cat)=>({...cat, catX:cat.catX + cat.speed}))
		} ; 
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
	
//	const victory = 	<p>Victory!</p>

	var catStyle = {
		right: position.catX,
		width: catWidth,
//		backgroundImage:time%2 ? 'url("cat2.png")':'url("cat1.png")',
		backgroundImage:time%2 ? 'url("cat3.png")':'url("cat4.png")',
	};
	const cat = <div className="cat" style={catStyle}></div>
	
	function moveDog() {
		setPosition(getNextDogPos)
	}
	var dogStyle = {
//		background: "content-box radial-gradient(skyblue, crimson)",
	backgroundImage:time%2 ? 'url("dog1.png")':'url("dog2.png")',
	left: position.dogX,
		width: dogWidth
	};
	const doge = <div className="doge" style = {dogStyle}></div>

	function addCat(type){
		console.log("add cat", type);
		position.cats.push({...type, catX:initialX });
	}

	const enemyButton = <button onClick={moveDog}>Doge</button>
	const catButton = <button onClick={addCat}>Cat</button>
	const catButtons = catTypes.map((cat, i)=><CatButton type={cat} addCat={addCat} key={i}/>);
	const cats = position.cats.map((cat, i)=><Cat cat={cat} key={i}/>);

	const battle = inBattle?		
		<div className="row">
			<div>Time:{time}</div>
			<div className="battle">
				<div className="CatBase">
					Cat 
					{catButton}
					{cats}
				</div>
				<div className="EnemyBase">
					{enemyButton}
					Enemy
					{doge}
				</div>
			</div>
			<div>
				<div>
					{catButtons}
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
