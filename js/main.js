function Main() {
	var render = null,
        mapInfo,
        mapArray = [],
        fishes = [],
        hero,
        animReqHero,
        animReqFish;

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
        var lenW = width-1;
        var lenH = height-1;
        for (var j = 0; j < height; j++){
            mapArray[j][0] = 1;
            mapArray[j][lenW] = 1;
            for (var i = 0; i < width; i++){
                mapArray[0][i] = 1;
                mapArray[lenH][i] = 1;
            }
        }

        for (var l = 0; l < count; l++){
            i = Math.floor(Math.random() * (width-1));
            j = Math.floor(Math.random() * (height-1));

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
                "fishes": 5
            }]
        };

        render = new Render(mapInfo.map.width, mapInfo.map.height, window.innerWidth, window.innerHeight);
        render.initMapLayer();
        initBarriers(mapInfo);
    }
	function initFishes() {
		render.initFishLayer();
        var fishesCount = mapInfo.levels[0].fishes;
        for(var i =0; i < fishesCount; i++) {
            console.log(i)
            var fish = new Fish(Math.round(mapInfo.map.width / 2) - 1000*Math.random(), Math.round(mapInfo.map.height / 2)- 1000*Math.random(), 50, 100, 0);
            render.drawFish(fish);
            fishes.push(fish);
        }
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

    function checkCollision(heroVertexs) {
        var matrixCollision = false;
        for(var j = 0; j < heroVertexs.length; j++) {
            var x = Math.floor(heroVertexs[j][0]/ mapInfo.barrier.width);
            var y = Math.floor(heroVertexs[j][1]/ mapInfo.barrier.height);
            if (mapArray[y][x]){
                matrixCollision = true;
                //console.log('collision');
                return matrixCollision;
            }
        }

        var fishCollision = false;
        for(var i = 0; i < fishes.length; i++) {
            fishes[i].vertexes = collisionLib.vert.convertSquare( fishes[i] )
            var collisionSat = collisionLib.vert.sat(heroVertexs, fishes[i].vertexes);
            if (collisionSat) {
                //console.log('collisionSat');
                fishCollision = true;
                return fishCollision;
            }
        }

        return false;
    }

    function checkWallCollision(heroVertexs) {
        var matrixCollision = false;
        for(var j = 0; j < heroVertexs.length; j++) {
            var x = Math.floor(heroVertexs[j][0]/ mapInfo.barrier.width);
            var y = Math.floor(heroVertexs[j][1]/ mapInfo.barrier.height);
            if (mapArray[y][x]){
                matrixCollision = true;
                //console.log('collision');
                return matrixCollision;
            }
        }

        return false;
    }

    this.moveToFish = function(clientX, clientY, id) {

        var wayX, wayY, way,
            deltaX, deltaY,
            angle, deltaSign,
            steps, step = 0;

        stopRequestAnimFrame(animReqFish);
        wayX = clientX - window.innerWidth / 2;
        wayY = clientY - window.innerHeight / 2;

        way = Math.sqrt(wayX * wayX + wayY * wayY);
        steps = way / fishes[id].speed;

        deltaX = wayX / steps;
        deltaY = wayY / steps;

        angle = Math.atan2(wayX, -wayY) * 180 / Math.PI;
        if (angle - fishes[id].angle > 180) {
            angle -= 360
        } else if (angle - fishes[id].angle < -180){
            angle += 360;
        }
        deltaSign = (angle - fishes[id].angle > 0) ? 1 : -1;

        var collision, collisionPart;
        var changeFishAngle = function(){
            //console.log(angle)
            //console.log(fishes[id].angle)
            if (angle !== fishes[id].angle) {
                if (Math.abs(angle - fishes[id].angle) > fishes[id].speed){
                    fishes[id].angle += fishes[id].speed * deltaSign;
                } else {
                    fishes[id].angle = angle;
                }
                if (fishes[id].parts.length>0) {
                    for (var i = 0; i < fishes[id].parts.length; i++) {
                        fishes[id].parts[i].angle = fishes[id].angle;
                    }
                }
                render.drawFishAi(fishes[id]);
                animReqFish = requestAnimFrame(changeFishAngle);
            } else if (step < steps) {
                var cloneHero = clone(fishes[id]);
                cloneHero.x += deltaX;
                cloneHero.y += deltaY;
                step++;
                //console.log(cloneHero)
                 if (cloneHero.parts.length>0) {
                    for (var i = 0; i < cloneHero.parts.length; i++) {
                        cloneHero.parts[i].x += deltaX;
                        cloneHero.parts[i].y += deltaY;
                        cloneHero.parts[i].vertexes = collisionLib.vert.convertSquare( cloneHero.parts[i] );
                        collisionPart = checkWallCollision(cloneHero.parts[i].vertexes);
                        if (collisionPart) {
                            //console.log('collision ' + cloneHero.parts[i].type)
                        }
                    };
                }
                cloneHero.vertexes = collisionLib.vert.convertSquare( cloneHero );
                collision = checkWallCollision(cloneHero.vertexes);
                if (!collision) {
                    fishes[id].x = cloneHero.x;
                    fishes[id].y = cloneHero.y;
                    render.drawFishAi(fishes[id]);
                    animReqFish = requestAnimFrame(changeFishAngle);
                }
            }
        };
        animReqHero = requestAnimFrame(changeFishAngle);
    };

    function move(wayX, wayY) {
        var way,
            deltaX, deltaY,
            angle, deltaSign,
            steps, step = 0;

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
        var collision, collisionPart;
        var changeAngle = function(){
            if (angle !== hero.angle) {
                if (Math.abs(angle - hero.angle) > hero.speed){
                    hero.angle += hero.speed * deltaSign;
                } else {
                    hero.angle = angle;
                }
                if (hero.parts.length>0) {
                    for (var i = 0; i < hero.parts.length; i++) {
                        hero.parts[i].angle = hero.angle;
                    }
                }
                render.drawHero(hero);
                animReqHero = requestAnimFrame(changeAngle);
            } else if (step < steps) {
                var cloneHero = clone(hero);
                cloneHero.x += deltaX;
                cloneHero.y += deltaY;
                step++;
                //console.log(cloneHero)
                if (cloneHero.parts.length>0) {
                    for (var i = 0; i < cloneHero.parts.length; i++) {
                        cloneHero.parts[i].x += deltaX;
                        cloneHero.parts[i].y += deltaY;
                        cloneHero.parts[i].vertexes = collisionLib.vert.convertSquare( cloneHero.parts[i] );
                        collisionPart = checkCollision(cloneHero.parts[i].vertexes);
                        if (collisionPart) {
                            console.log('collision ' + cloneHero.parts[i].type)
                        }
                    }
                }
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
    }

    this.moveDirection = function(direction) {
        stopRequestAnimFrame(animReqHero);
        switch (direction) {
            case enums.direction.down:
                move(0, hero.speed * 10);
                break;
            case enums.direction.left:
                move(-hero.speed * 10, 0);
                break;
            case enums.direction.right:
                move(hero.speed * 10, 0);
                break;
            case enums.direction.top:
                move(0, -hero.speed * 10);
                break;
            case enums.direction.leftAndBottom:
                move(-hero.speed * 10, hero.speed * 10);
                break;
            case enums.direction.leftAndTop:
                move(-hero.speed * 10, -hero.speed * 10);
                break;
            case enums.direction.rightAndBottom:
                move(hero.speed * 10, hero.speed * 10);
                break;
            case enums.direction.rightAndTop:
                move(hero.speed * 10, -hero.speed * 10);
                break;
        }
    };
    this.moveTo = function(clientX, clientY) {
        var wayX, wayY,
            position;

        position = render.positionHeroOnScreen(hero);
        wayX = clientX - position.x;
        wayY = clientY - position.y;
        stopRequestAnimFrame(animReqHero);
        move(wayX, wayY);
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
        this.parts = [];
        var item = {};
        item.type = 'mouth';
        item.width = 20;
        item.height = 20;
        item.x = this.x;
        item.y = this.y-(this.height/2+item.height);
        item.angle = this.angle;
        item.speed = this.speed;
        this.parts.push(item);
        var item = {};
        item.type = 'tail';
        item.width = 20;
        item.height = 20;
        item.x = this.x;
        item.y = this.y+(this.height/2+item.height);
        item.angle = this.angle;
        item.speed = this.speed;
        this.parts.push(item);
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
        this.parts = [];
        var item = {};
        item.type = 'mouth';
        item.width = 20;
        item.height = 20;
        item.x = this.x;
        item.y = this.y-(this.height/2+item.height);
        item.angle = this.angle;
        item.speed = this.speed;
        this.parts.push(item);
        var item = {};
        item.type = 'tail';
        item.width = 20;
        item.height = 20;
        item.x = this.x;
        item.y = this.y+(this.height/2+item.height);
        item.angle = this.angle;
        item.speed = this.speed;
        this.parts.push(item);
        var item = {};
        item.type = 'fin';
        item.width = 100;
        item.height = 20;
        item.x = this.x;
        item.y = this.y-item.height;
        item.angle = this.angle;
        item.speed = this.speed;
        this.parts.push(item);
        var item = {};
        item.type = 'horn';
        item.width = 100;
        item.height = 30;
        item.x = this.x;
        item.y = this.y+item.height;
        item.angle = this.angle;
        item.speed = this.speed;
        this.parts.push(item);
        this.vertexes = collisionLib.vert.convertSquare(this);
    }

    init.apply(this, arguments);
}