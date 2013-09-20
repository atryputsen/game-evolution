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
                "barriers": 15,
                "fishes": 1
            }]
        };

        render = new Render(mapInfo.map.width, mapInfo.map.height, window.innerWidth, window.innerHeight);
        render.initMapLayer();
        initBarriers(mapInfo);
    }
	function initFishes() {
		render.initFishLayer();

		var fish = new Fish(Math.round(mapInfo.map.width / 2) - 200, Math.round(mapInfo.map.height / 2), 100, 30, 0);
		render.drawFish(fish);
        fishes.push(fish);
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
                 render.drawHero(hero);
                 hero.x += deltaX;
                 hero.y += deltaY;
                 step++;
                 animReqHero = requestAnimFrame(changeAngle);
            } else {

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

		vertexes = collisionLib.vert.convertSquare(this);
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

        vertexes = collisionLib.vert.convertSquare(this);
    }

    init.apply(this, arguments);
}