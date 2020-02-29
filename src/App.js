import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';


function App() {
	const [beforeBattle, setBefore] = useState(true);
	const [inBattle, setBattle] = useState(false);

	function startBattle()
	{
		setBefore(false);
		setBattle(true);
	}

	const attack = beforeBattle?
		<button onClick={startBattle}>Attack</button>
		: null;	
	
	const victory = 	<p>Victory!</p>

	const cat = <div className="cat">cat</div>
	const doge = <div className="doge">doge</div>

	const battle = inBattle?		
		<div className="row">
		<div className="battle">

			<div className="CatBase">
				Cat Base
				{cat}
			</div>
			<div className="EnemyBase">
				Enemy Base
				{doge}
			</div>
		</div>
		</div> 
		: null;
		function leaveBattle()
		{
			setBefore(true);
			setBattle(false);
		}
		const back = inBattle?
		<button onClick={leaveBattle}>Back</button>
		: null;	
  return (
    <div className="App">
      	<header>
		  	Battle Cats Labs
	  	</header>
		{attack}
		{back}
		{battle}
	</div>
  );
}

export default App;
