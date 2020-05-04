var canvas;
		var ctx;
		const tileWidth = 64;
		const tileHeight = 32;
		
		const nTilesX = 20;
		const nTilesY = 20;

		var socket;
		var username;
		var state = "initial";
		var scale = 1;
		
		var players = [];
		
		var leftOffset = 0;
		const topOffset = 3*tileHeight;
		
		var tiles = new Map(); //Maps tile name (as unique string) to tile object
		
		function Tile(imageSrc, walkable){
			this.image = new Image;
			this.image.src = imageSrc;
			this.walkable = walkable;
		}
		
		function addTile(name, imageSrc, walkable){
			var tile = new Tile(imageSrc, walkable);
			tiles.set(name, tile);
		}
		
		tiles.set("null", null);
		
		//Declare tiles
		addTile("tileGrass", "tiles/grass2.png", true);
		
		addTile("tileMud", "tiles/mud2.png", true);
		
		addTile("tileSea", "tiles/sea2.png", false);
		
		addTile("tileStone", "tiles/stone2.png", true);
		
		addTile("wallMudLeft", "tiles/mudWallLeft.png", false);
		
		addTile("wallMudRight", "tiles/mudWallRight.png", false);
		
		addTile("wallWoodLeft", "tiles/woodWallLeft.png", false);
		
		addTile("wallWoodRight", "tiles/woodWallRight.png", false);
		addTile("wallWoodCornerIn", "tiles/woodWallCornerIn.png", false);
		
		addTile("wallWoodCornerOut", "tiles/woodWallCornerOut.png", false);
		addTile("wallWoodTest", "tiles/testWall.png", false);
		
		addTile("crateClosed", "tiles/objects/crateClosed.png", false);
		
		addTile("rockPile", "tiles/objects/rocks1.png", true);
		
		addTile("rockScatter", "tiles/objects/rocks2.png", true);
		
		addTile("crossOverlay", "tiles/crossOverlay.png", false);
		
		addTile("border", "tiles/border.png", false);
		
		var player;
		
		var ground = [
					["tileGrass", "tileGrass", "tileGrass", "tileGrass", "tileGrass", "tileGrass", "tileGrass", "tileGrass", "tileGrass", "wallMudRight"],
					["tileMud", "tileMud", "tileMud", "tileMud", "tileMud", "tileMud", "tileMud", "tileMud", "tileMud", "wallMudRight", "tileSea", "tileSea"],
					["tileGrass", "tileGrass", "tileGrass", "tileGrass", "tileGrass", "tileGrass", "tileGrass", "tileGrass", "tileGrass", "wallMudRight", "tileSea", "tileSea"],
					["tileMud", "tileMud", "tileStone", "tileStone", "tileStone", "tileStone", "tileMud", "tileMud", "tileMud", "wallMudRight", "tileSea", "tileSea"],
					["tileGrass", "tileGrass", "tileStone", "tileSea", "tileSea", "tileStone", "tileGrass", "tileGrass", "tileGrass", "wallMudRight", "tileSea", "tileSea"],
					["tileMud", "tileMud", "tileStone", "tileSea", "tileSea", "tileStone", "tileMud", "tileMud", "tileMud", "wallMudRight", "tileSea", "tileSea"],
					["tileGrass", "tileGrass", "tileStone", "tileStone", "tileStone", "tileStone", "tileGrass", "tileGrass", "tileGrass", "wallMudRight", "tileSea", "tileSea"],
					["tileMud", "tileMud", "tileMud", "tileMud", "tileMud", "tileMud", "tileMud", "tileMud", "tileSea", "wallMudRight", "tileSea", "tileSea"],
					["tileGrass", "tileGrass", "tileGrass", "tileGrass", "tileGrass", "tileGrass", "tileGrass", "tileSea", "tileGrass", "wallMudRight", "tileSea", "tileSea"],
					["wallMudLeft", "wallMudLeft", "wallMudLeft", "wallMudLeft", "wallMudLeft", "wallMudLeft", "wallMudLeft", "wallMudLeft", "wallMudLeft", "null", "tileSea", "tileSea"],
					["null", "tileSea", "tileSea", "tileSea", "tileSea", "tileSea", "tileSea", "tileSea", "tileSea", "tileSea", "tileSea", "tileSea"],
					["null", "tileSea", "tileSea", "tileSea", "tileSea", "tileSea", "tileSea", "tileSea", "tileSea", "tileSea", "tileSea", "tileSea"]
					];
					
		var maze = [["tileStone", "tileStone", "tileSea", "tileSea", "tileSea", "tileStone"],
					["tileSea", "tileStone", "tileSea", "tileSea", "tileStone", "tileStone"],
					["tileStone", "tileStone", "tileSea", "tileSea", "tileStone", "tileSea"],
					["tileStone", "tileSea", "tileSea", "tileSea", "tileStone", "tileSea"],
					["tileStone", "tileStone", "tileStone", "tileStone", "tileStone", "tileStone"]
					];
		
		var leftWalls = [["wallWoodRight", "wallWoodRight", "wallWoodRight", "wallWoodRight", "wallWoodRight", "wallWoodRight", "wallWoodRight", "wallWoodRight", "wallWoodRight"],
						 ["wallWoodRight", "wallWoodRight", "wallWoodRight", "wallWoodRight", "wallWoodRight", "wallWoodRight", "wallWoodRight", "wallWoodRight", "wallWoodRight"]];
		
		var rightWalls = [["wallWoodLeft", "wallWoodLeft", "wallWoodLeft", "wallWoodLeft", "wallWoodLeft", "wallWoodLeft", "wallWoodLeft", "wallWoodLeft", "wallWoodLeft"],
						   ["wallWoodLeft", "wallWoodLeft", "wallWoodLeft", "wallWoodLeft", "wallWoodLeft", "wallWoodLeft", "wallWoodLeft", "wallWoodLeft", "wallWoodLeft"]];
		
		var objects = [["null", "null", "null", "null", "null", "null", "null", "null", "null", "null"],
						["null", "null", "null", "null", "null", "null", "null", "null", "null", "null"],
						[],["null", "null", "crateClosed", "null", "null", "null", "null", "null", "null", "null"],[],[],["null", "null", "null", "null", "rockPile", "rockScatter", "null", "null", "null", "null"],[],
						[],[]];
		
		var overlays = [];
		for(var y = 0; y < nTilesY; y++){
			overlays.push([]);
			for(var x = 0; x < nTilesX; x++){
				overlays[y].push(null);
			}
		}
		
		var level = [ground, objects, overlays];
		
		
		var queuedMoves = [];
		
		function start(){
			player = new Player(username, 0, 0, 1);
			players.push(player);
			canvas = document.getElementById("myCanvas");
			ctx = canvas.getContext("2d");
			leftOffset = canvas.width/2;
			requestPlayerList();
			setInterval(drawScene, 50);
			setInterval(requestPlayerList, 10000);
			canvas.addEventListener("click", function(event){clickListener(event);}, false);
			window.addEventListener("keypress", function(event){keyListener(event);}, false);
		}
		
		function connect(){

			username = document.getElementById("username").value;
			//socket = new WebSocket("ws://localhost:8080/IsoGame");
			socket = new WebSocket("ws://vps.creaseans.com:8080/IsoGame/IsoGame");
			document.getElementById("connect").disabled = true;
			
			socket.onopen = function(e){
				console.log("Connected to server");
				socket.send("{\"type\": \"connect\", \"username\": \"" + username + "\"}");
				state = "negotiatingUsername";
			}
			
			socket.onmessage = function(e){
				console.log(e.data);
				var msgObj = JSON.parse(e.data);
								
				if(state == "awaitingLevel"){
					state = "inGame";
					level = msgObj;
					start();
					return;
				}
				
				switch(msgObj.type){
					case "connect":
						if(state == "negotiatingUsername"){
							if(msgObj.result == "success"){
								document.getElementById("register").style.display = "none";
								//username = this.username;
								state = "awaitingLevel";
								socket.send("{\"type\": \"requestLevel\"}");
							}
							else{
								document.getElementById("connect").disabled = false;
								document.getElementById("loginInfo").innerHTML = "Username already in use";	
							}
						}
						break;
					case "playerList":
						updatePlayers(msgObj.players);
						break;
					case "playerMoved":
						playerMove(msgObj.player);
						break;
				}

			}
		
		}		
		
		function requestPlayerList(){
			socket.send("{\"type\": \"requestPlayers\"}");
		}
		
		
		function updatePlayers(playerList){
			players = [];
			
			//setTimeout(requestPlayerList, 1);
				
			for(var i = 0; i<playerList.length; i++){
				var playerJSON = playerList[i];
				console.log(playerJSON);
				if(playerJSON.username == username){
					player.x = playerJSON.x;
					player.y = playerJSON.y;
					players.push(player);
				}
				else{
					var currentPlayer = new Player(playerJSON.username, playerJSON.x, playerJSON.y, playerJSON.facing);
					players.push(currentPlayer);
				}
				
			}
			
		}
		
		function playerMove(player){
			for(var i = 0; i<players.length; i++){
				if(players[i].username == player.username){
					players[i].x = player.x;
					players[i].y = player.y;
					players[i].facing = player.facing; 
					console.log(player.username + " moved");
				}
			}
		}
		
		function drawPlayers(){
			for(var i = 0; i<players.length; i++){
				players[i].draw();
			}
		}
		
		function clickListener(event){
			var clickX = event.pageX - canvas.offsetLeft;
			var clickY = event.pageY - canvas.offsetTop;
	//		console.log("Click! x: " + clickX + " y: " + clickY);
	//		var cart = translateToCart(clickX, clickY);
	//		console.log("I think it's tile x: " + cart.x + " y: " + cart.y);
			
			for(var i = 0; i<queuedMoves.length; i++){
				clearTimeout(queuedMoves[i]);
			}
			queuedMoves = [];
			
			var tile = translateToCart(clickX, clickY);
			
			var path = pathTo(tile.x, tile.y);
			console.log("Pathing...");
			if(path != false){
				console.log("Path:");
				console.log(path);
				for(var i = 0; i<path.length; i++){
					var next = path[i];
					queuedMoves.push(window.setTimeout(moveTo, (i)*200, next.x, next.y));
				}
			}
			else{
				console.log("No path");
				if(tile.y < nTilesY && tile.x < nTilesX){
					level[3][tile.y][tile.x] = "crossOverlay";
					setTimeout(function(){ level[3][tile.y][tile.x] = "null";}, 300);
				}
			}
		}
		
		function keyListener(event){
			console.log(event.code);
			switch(event.code){
				case "KeyW": //W
					if(player.y > 0){
						moveTo(player.x, player.y - 1);
					}
					break;
				case "KeyA": //A
					if(player.x > 0){
						moveTo(player.x - 1, player.y);
					}
					break;
				case "KeyS": //S
					if(player.y < nTilesY){
						moveTo(player.x, player.y + 1);
					}
					break;
				case "KeyD": //D
					if(player.x < nTilesX){
						moveTo(player.x + 1, player.y);
					}
					break;
						
			}
		}
		
	function drawScene(){
			canvas.setAttribute('width', getComputedStyle(document.querySelector('#myCanvas')).width);
			canvas.setAttribute('height', getComputedStyle(document.querySelector('#myCanvas')).height);
			
			ctx.save();
			var mostTiles = nTilesX * tileWidth;
			if(nTilesY * tileHeight > mostTiles){
				mostTiles = nTilesY * tileHeight;
			}
			scale = canvas.width/(mostTiles + 2 * topOffset);
			ctx.scale(scale, scale);
			
			ctx.imageSmoothingEnabled = false;
			
			leftOffset = Math.floor(((canvas.width/2)/scale)/tileWidth) * tileWidth;
			ctx.fillStyle = "#000000";//"#FF00FF";
			ctx.fillRect(0, 0, canvas.width/scale, canvas.height/scale);
			
		/*	for(var y = 0; y<leftWalls.length; y++){
			
				var xPixel = leftOffset + 0.5*tileWidth;
				var yPixel = topOffset - 1.5*tileHeight - tileHeight * y;
				
				for(var x = leftWalls[y].length-1; x>=0; x--){
					xPixel -= tileWidth/2;
					yPixel += tileHeight/2;
					if(leftWalls[y] != null && leftWalls[y][x] != null && leftWalls[y][x] != "null"){
						ctx.drawImage(tiles.get(leftWalls[y][x]).image, xPixel, yPixel);
					}
				}
			}
			
			for(var y = 0; y<rightWalls.length; y++){
			
				var xPixel = leftOffset - 0.5*tileWidth;
				var yPixel = topOffset - 1.5*tileHeight - tileHeight * y;
				
				for(var x = 0; x <= rightWalls[y].length; x++){
					xPixel += tileWidth/2;
					yPixel += tileHeight/2;
					if(rightWalls[y] != null && rightWalls[y][x] != null && rightWalls[y][x] != "null"){
						ctx.drawImage(tiles.get(rightWalls[y][x]).image, xPixel, yPixel);
					}
				}
			}*/
			
			
			
			for(var l = 0; l < level.length; l++){
				
				var layer = level[l];

				
				for(var y=0; y<layer.length; y++){
					for(var x=0; x<layer[y].length; x++){
						var pixel = translateToPixel(x,y);
						if(layer[y] != null && layer[y][x] != null && layer[y][x] != "null"){
								ctx.drawImage(tiles.get(layer[y][x]).image, pixel.x, pixel.y);
						}
					}
				}
			}
			
			drawPlayers();
			
			ctx.restore();
		}
		
		function Player(username, x, y, facing){
			this.username = username;
			this.x = x;
			this.y = y;
			this.facing = facing;
			this.draw = function() {
					var xOffset = -(tileWidth/2);
					var yOffset = -tileHeight*2.5;
					/*var image = new Image;
					image.src = this.images[this.facing];*/
					var image = playerImages[this.facing];
					
					var pixels = translateToPixel(this.x, this.y);
					//console.log("Tile: " + this.x + ", " + this.y + " Pixel: " + pixels.x + "," + pixels.y);
					ctx.drawImage(image, pixels.x + xOffset, pixels.y + yOffset);

					
					ctx.font = "14px Courier New"	;
					ctx.fillStyle = "white";	
					ctx.textAlign = "center";
					ctx.fillText(this.username, pixels.x + 32, pixels.y-60);
			}
			this.images = playerImages;
					/*["tiles/player2/player2north.png",
					 "tiles/player2/player2east.png",
					 "tiles/player2/player2south.png",
					 "tiles/player2/player2west.png"];*/
		}
		
		/*
		var player = {
			x: 0,
			y: 0,
			facing: 1,
			images: ["tiles/player2/player2north.png",
					 "tiles/player2/player2east.png",
					 "tiles/player2/player2south.png",
					 "tiles/player2/player2west.png"],
			username: "sboy365",
			draw: function(){
				var xOffset = -(tileWidth/2);
				var yOffset = -tileHeight*2.5;
				var image = new Image;
				image.src = player.images[player.facing];
				
				var pixels = translateToPixel(player.x, player.y);
				console.log("Tile: " + this.x + ", " + this.y + " Pixel: " + pixels.x + "," + pixels.y);
				ctx.drawImage(image, pixels.x + xOffset, pixels.y + yOffset);

				
				ctx.font = "14px Courier New"	;
				ctx.fillStyle = "white";	
				ctx.textAlign = "center";
				ctx.fillText(this.username, pixels.x + 32, pixels.y-60);				
			}
		}*/
		
		function translateToPixel(x,y){
		
			var xPixel = (x - y) * (tileWidth/2) + leftOffset;
			var yPixel = ((x + y)/2) * tileHeight + topOffset;
		
			var pixels = {x: xPixel, y: yPixel};
			return pixels;
		}
		
		function translateToCart(xPixel, yPixel){
			xPixel = ((xPixel/scale) - leftOffset)/(tileWidth/2); //(x - y)
			yPixel = 2*(((yPixel/scale) - topOffset)/(tileHeight)); //(x + y)
			
			console.log("Pixl - X: " + xPixel + " Y: " + yPixel);
			
			var cartX = (yPixel + xPixel)/2; //-3 - 0.2;
			var cartY = (yPixel - xPixel)/2; //+3;
			
			console.log("Cart - X: " + cartX + " Y: " + cartY);
			
			var cart = {x: Math.round(cartX)-1, y: Math.round(cartY)}; //TODO: Work out why I need this +1
			return cart;
		}
		
		function canStandAt(x, y){
				var walkable = false;
			if(x >= 0 && x <= nTilesX && y >= 0 && y <= nTilesY){
				for(var i = (level.length-1); i>=0; i--){
					var layer = level[i];
					if(layer[y] != null && layer[y][x] != null && layer[y][x] != "null"){
						walkable = tiles.get(layer[y][x]).walkable;
						console.log(x + ", " + y + ": Set walkability to " + walkable + " on layer " + i);
						break;
					}					
				}
			}
			
			return walkable;
		}
		
		function getPositionFromSet(position, set){
			var result = null;
			set.forEach(function(element){
				if(result == null && position.x == element.x && position.y == element.y){
					console.log("Found " + element.x + ", " + element.y);
					result = element;
				}
			});
			if(result != null){
				return result;
			}
			else{
				console.log("Added " + position.x + ", " + position.y);
				set.add(position);
				return position;
			}
		}
		
		function setHasPosition(position, set){
			var result = false;
			set.forEach(function(element){
				if(result == false && position.x == element.x && position.y == element.y){
					console.log("Found " + element.x + ", " + element.y);
					result = true;
				}
			});	
			return result;
		}
		
		function pathTo(goalX, goalY){
			console.log(player.username + " from " + player.x + ", "+ player.y + " to " + goalX + ", " + goalY);
			if(!canStandAt(goalX,goalY)){
				return false;
			}
			
			var positions = new Set();			
			var visited = new Set();
			var nodes = new Map();
			var prev = new Map();
			
			var current = {x: player.x, y: player.y};
			
			nodes.set(current, 0);
			prev.set(current, null);
			
			var halt = 400;
			
			while(current != null && halt > 0){
				//console.log("LOOP");
				current = getPositionFromSet(current, positions);
				halt--;
				moveableAdjacents(current.x, current.y).forEach(function(element){
						
						element = getPositionFromSet(element, positions);
							
						if(nodes.get(element) == undefined || nodes.get(element) > (nodes.get(current)+1)){
							nodes.set(element, nodes.get(current)+1);
							prev.set(element, current);
						}
				});
				//console.log("Visited " + current);
				getPositionFromSet(current, visited);
				
				if(setHasPosition({x: goalX, y: goalY},visited)){
					//console.log("BUILDING PATH");
					var reversePath = [];
					var curr = {x:goalX, y:goalY};
					reversePath.push(getPositionFromSet(curr, positions));
					while(curr != null){
						reversePath.push(getPositionFromSet(curr, positions));
						curr = prev.get(getPositionFromSet(curr, positions));
					}
					return reversePath.reverse();
				}
				else{
					var min = Infinity;
					current = null;
					nodes.forEach(function(value, key){
							if(!visited.has(key) && value < min){
								min = value;
								current = key;
								console.log(key);
							}
					});
					
					if(current == null){
						//console.log("No more tiles to search");
						//console.log(nodes);
						//console.log(positions);
						//console.log(visited);
						return false;
					}
				}
				
				//console.log("Halted to save browser");
				//console.log(nodes);
				//console.log(positions);
				//console.log(visited);
				
			}
		}
		
		function moveableAdjacents(x, y){
			var adjs = [];
			if(canStandAt(x+1, y)){
				adjs.push({x:x+1, y:y});
			}
			if(canStandAt(x-1, y)){
				adjs.push({x:x-1, y:y});
			}
			if(canStandAt(x, y+1)){
				adjs.push({x:x, y:y+1});
			}
			if(canStandAt(x, y-1)){
				adjs.push({x:x, y:y-1});
			}
			return adjs;
		}
		
		function moveTo(x, y){
			
			if(x > player.x){
				player.facing = 1;
			}
			else if(x < player.x){
				player.facing = 3;
			}
			else if(y < player.y){
				player.facing = 0;
			}
			else if(y > player.y){
				player.facing = 2;
			}
			if(canStandAt(x,y)){
		
				player.x = x;
				player.y = y;
				socket.send("{\"type\": \"moveTo\", \"x\": " + player.x + ", \"y\": " + player.y + ", \"facing\": " + player.facing + "}");
			}
			else{
				console.log("Not walkable");
			}
	
			//drawScene();
		}