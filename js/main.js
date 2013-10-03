function Main() {
	var render = null,
        mapInfo,
        mapArray = [],
        fishes = [],
        hero,
        animReqHero;

    function initBarriers(mapInfo){
        var height = Math.floor(mapInfo.map.height / mapInfo.barrier.height),
            width = Math.floor(mapInfo.map.width / mapInfo.barrier.width),
            percentage = mapInfo.levels[0].barriers,
            count = Math.ceil(height * width * percentage / 100);

        for (var j = 0; j < height; j++){
            var tempArray = [];
            for (var i = 0; i < width; i++){
                tempArray.push(0);
            }
            mapArray.push(tempArray);
        }

        for (var l = 0; l < count; l++){
            i = Math.floor(Math.random() * width);
            j = Math.floor(Math.random() * height);

            mapArray[j][i] = 1;
        }
        render.drawBarriers(mapInfo.barrier.width, mapInfo.barrier.height, mapArray);
    }
	function initMap(){
		/*var request = new XMLHttpRequest();
		
		request.open("GET", "data/map.json", false);
        request.setRequestHeader("Pragma", "no-cache");
        request.send();
		
		if (request.status === 200) {
			mapInfo = JSON.parse(request.responseText);
		} else {
			alert("Error while try to get data");
		}*/
        mapInfo = {
            "map" : {
                "height": 2000,
                "width": 3000
            },
            "barrier": {
                "height": 100,
                "width": 100
            },
            "levels": [{
                "barriers": 5,
                "fishes": 1
            }]
        };

        render = new Render(mapInfo.map.width, mapInfo.map.height, window.innerWidth, window.innerHeight);
        render.initMapLayer();
        initBarriers(mapInfo);
    }
	function initFishes() {
		render.initFishLayer();

		var fish = new Fish(Math.round(mapInfo.map.width / 2) - 200, Math.round(mapInfo.map.height / 2), 100, 50, 0);
        var fish2 = new Fish(Math.round(mapInfo.map.width / 2) - 400, Math.round(mapInfo.map.height / 2)-50, 100, 50, 40);
        var fish3 = new Fish(Math.round(mapInfo.map.width / 2) - 200, Math.round(mapInfo.map.height / 2)-200, 100, 50, 90);
		render.drawFish(fish);
        fishes.push(fish);
        render.drawFish(fish2);
        fishes.push(fish2);
        render.drawFish(fish3);
        fishes.push(fish3);
	}
    function initHero() {
        var width = 50,
            height = 100;

        render.initHeroLayer(width, height);

        hero = new Hero(Math.round(mapInfo.map.width / 2), Math.round(mapInfo.map.height / 2), width, height, 0);
        render.drawHero(hero);
    }
	function init() {
        initMap();
		initFishes();
        initHero();
        console.log(mapArray)
	}
     /*
    function getMapSector(v) {
        var midObj = getMidPoint(v)
        var x = Math.floor((midObj.x - mapInfo.barrier.width/2) / mapInfo.barrier.width);
        var y = Math.floor((midObj.y - mapInfo.barrier.height/2) / mapInfo.barrier.height);
        return {
            x: x,
            y: y
        };
    }

    function getMidPoint( obj )
    {
        var maxX = Math.max(obj[0][0],obj[1][0],obj[2][0],obj[3][0]);
        var minX = Math.min(obj[0][0],obj[1][0],obj[2][0],obj[3][0]);
        var maxY = Math.max(obj[0][1],obj[1][1],obj[2][1],obj[3][1]);
        var minY = Math.min(obj[0][1],obj[1][1],obj[2][1],obj[3][1]);
        var x = Math.abs(minX + (maxX - minX)/2 );
        var y = Math.abs(minY + (maxY - minY)/2 );
        return {
            x: x,
            y: y
        };
    }
     */
    function checkCollision(heroVertexs) {
        var matrixCollision = false;
        for(var j = 0; j < heroVertexs.length; j++) {
            var x = Math.floor(heroVertexs[j][0]/ mapInfo.barrier.width);
            var y = Math.floor(heroVertexs[j][1]/ mapInfo.barrier.height);
            if (mapArray[y][x]){
                matrixCollision = true;
                console.log('collision');
                return matrixCollision;
            }
        }

        var fishCollision = false;
        for(var i = 0; i < fishes.length; i++) {
            fishes[i].vertexes = collisionLib.vert.convertSquare( fishes[i] )
            var collisionSat = collisionLib.vert.sat(heroVertexs, fishes[i].vertexes);
            if (collisionSat) {
                console.log('collisionSat');
                fishCollision = true;
                return fishCollision;
            }
        }

        return false;
    }
	
	this.moveTo = function(clientX, clientY) {
        var wayX, wayY, way,
            deltaX, deltaY,
            angle, deltaSign,
            steps, step = 0;

        stopRequestAnimFrame(animReqHero);
        wayX = clientX - window.innerWidth / 2;
        wayY = clientY - window.innerHeight / 2;
        way = Math.sqrt(wayX * wayX + wayY * wayY);
        steps = way / hero.speed;

        deltaX = wayX / steps;
        deltaY = wayY / steps;

        angle = Math.atan2(wayX, -wayY) * 180 / Math.PI;
        if (angle - hero.angle > 180) {
            angle -= 360
        } else if (angle - hero.angle < -180){
            angle += 360;
        }
        deltaSign = (angle - hero.angle > 0) ? 1 : -1;
        var collision;
        var changeAngle = function(){
            if (angle !== hero.angle) {
                if (Math.abs(angle - hero.angle) > hero.speed){
                    hero.angle += hero.speed * deltaSign;
                } else {
                    hero.angle = angle;
                }

                render.drawHero(hero);
                animReqHero = requestAnimFrame(changeAngle);
            } else if (step < steps) {
                var cloneHero = clone(hero);
                cloneHero.x += deltaX;
                cloneHero.y += deltaY;
                step++;

                cloneHero.vertexes = collisionLib.vert.convertSquare( cloneHero );
                collision = checkCollision(cloneHero.vertexes);
                if (!collision) {
                    hero.x = cloneHero.x;
                    hero.y = cloneHero.y;
                    render.drawHero(hero);
                    animReqHero = requestAnimFrame(changeAngle);
                }
            }
        };
        animReqHero = requestAnimFrame(changeAngle);
    };
	this.resize = function() {
        render.resize(window.innerWidth, window.innerHeight);
    };

	init();
}

function Fish (){
	function init() {
		this.x = arguments[0] || 15;
		this.y = arguments[1] || 50;
		this.width = arguments[2] || 30;
		this.height = arguments[3] || 30;
		this.angle = arguments[4] || 0;
        this.speed = arguments[5] || 5;

		this.vertexes = collisionLib.vert.convertSquare(this);
	}

    init.apply(this, arguments);
}

function Hero (){
    function init() {
        this.x = arguments[0] || 15;
        this.y = arguments[1] || 50;
        this.width = arguments[2] || 30;
        this.height = arguments[3] || 30;
        this.angle = arguments[4] || 0;
        this.speed = arguments[5] || 5;

        this.vertexes = collisionLib.vert.convertSquare(this);
    }

    init.apply(this, arguments);
}