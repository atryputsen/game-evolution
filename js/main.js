function Main() {
	var render = null,
        mapInfo,
        mapArray = [],
        fishes = [],
        hero,
        animReqHero,
        animReqFish = {};

    function initBarriers(mapInfo){
        var height = Math.floor(mapInfo.map.height / mapInfo.barrier.height),
            width = Math.floor(mapInfo.map.width / mapInfo.barrier.width),
            percentage = mapInfo.levels[0].barriers,
            count = Math.ceil(height * width * percentage / 100),
            i, j, l;

        for (j = 0; j < height; j++){
            var tempArray = [];
            for (i = 0; i < width; i++){
                tempArray.push(0);
            }
            mapArray.push(tempArray);
        }
        var lenW = width-1;
        var lenH = height-1;
        for (j = 0; j < height; j++){
            mapArray[j][0] = 1;
            mapArray[j][lenW] = 1;
            for (i = 0; i < width; i++){
                mapArray[0][i] = 1;
                mapArray[lenH][i] = 1;
            }
        }

        for (l = 0; l < count; l++){
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
        mapInfo = mapInfoGlobal;

        render = new Render(mapInfo.map.width, mapInfo.map.height, window.innerWidth, window.innerHeight);
        render.initMapLayer();
        initBarriers(mapInfo);
    }
	function initFishes() {
		render.initFishLayer();
        var fishesCount = mapInfo.levels[0].fishes;
        for(var i = 0; i < fishesCount; i++) {
            var fish = new Fish(
                Math.round(mapInfo.map.width / 2) - 1000 * Math.random(),
                Math.round(mapInfo.map.height / 2) - 1000 * Math.random(),
                fishInfoGlobal.fishes[i]
            );
            render.drawFish(fish);
            fishes.push(fish);
        }
	}
    function initHero() {
        var width = 50,
            height = 100;

        render.initHeroLayer(width, height);

        hero = new Fish(
            Math.round(mapInfo.map.width / 2),
            Math.round(mapInfo.map.height / 2),
            fishInfoGlobal.hero
        );
        render.drawHero(hero);
    }
	function init() {
        initMap();
		initFishes();
        initHero();
	}

    function checkCollision(vertexs, fish) {
        var matrixCollision = false;
        for(var j = 0; j < vertexs.length; j++) {
            var x = Math.floor(vertexs[j][0]/ mapInfo.barrier.width);
            var y = Math.floor(vertexs[j][1]/ mapInfo.barrier.height);
            if (mapArray[y][x]){
                matrixCollision = true;
                //console.log('collision');
                return matrixCollision;
            }
        }

        var fishCollision = false;
        for(var i = 0; i < fishes.length; i++) {
            if (fishes[i] !== fish){
                fishes[i].vertexes = collisionLib.vert.convertSquare( fishes[i] )
                var collisionSat = collisionLib.vert.sat(vertexs, fishes[i].vertexes);
                if (collisionSat) {
                    //console.log('collisionSat');
                    fishCollision = true;
                    return fishCollision;
                }
            }
        }

        return false;
    }

    function move(wayX, wayY, fishId) {
        var fish,
            animReq,
            drawFunction,
            way,
            deltaX, deltaY,
            angle, deltaSign,
            steps, step = 0;

        if (fishId !== undefined) {
            fish = fishes[fishId];
            animReq = animReqFish[fishId];
            drawFunction = render.drawFishAi;
        } else {
            fish = hero;
            animReq = animReqHero;
            drawFunction = render.drawHero;
        }

        stopRequestAnimFrame(animReq);
        way = Math.sqrt(wayX * wayX + wayY * wayY);
        steps = way / fish.speed;

        deltaX = wayX / steps;
        deltaY = wayY / steps;

        angle = Math.atan2(wayX, -wayY) * 180 / Math.PI;
        if (angle - fish.angle > 180) {
            fish.angle += 360
        } else if (angle - fish.angle < -180){
            fish.angle -= 360;
        }
        deltaSign = (angle - fish.angle > 0) ? 1 : -1;

        var doMove = function() {
            stopRequestAnimFrame(animReq);
            if (angle !== fish.angle) {
                if (Math.abs(angle - fish.angle) > fish.speed){
                    fish.angle += fish.speed * deltaSign;
                } else {
                    fish.angle = angle;
                }
                drawFunction.call(render, fish);
                animReq = requestAnimFrame(doMove);
            } else if (step < steps) {
                var cloneFish = clone(fish);
                cloneFish.x += deltaX;
                cloneFish.y += deltaY;

                if (cloneFish.parts.length > 0) {
                    for (var i = 0; i < cloneFish.parts.length; i++) {
                        cloneFish.parts[i].vertexes = collisionLib.vert.convertSquare( cloneFish.getPartInfo(cloneFish.parts[i]) );
                        if (checkCollision(cloneFish.parts[i].vertexes)) {
                            //console.log('collision ' + cloneFish.parts[i].type);
                        }
                    }
                }

                cloneFish.vertexes = collisionLib.vert.convertSquare( cloneFish );
                if (!checkCollision(cloneFish.vertexes, fish)) {
                    //console.log('collision body');
                    fish.x = cloneFish.x;
                    fish.y = cloneFish.y;
                    drawFunction.call(render, fish);
                    animReq = requestAnimFrame(doMove);
                }

                step++;
                delete cloneFish;
            }

            if (fishId !== undefined) {
                animReqFish[fishId] = animReq;
            } else {
                animReqHero = animReq;
            }
        };

        animReq = requestAnimFrame(doMove);
        if (fishId !== undefined) {
            animReqFish[fishId] = animReq;
        } else {
            animReqHero = animReq;
        }
    }

    this.moveDirection = function(direction) {
        var deltaX = 0,
            deltaY = 0;

        switch (direction) {
            case enums.direction.down:
                deltaY = hero.speed;
                break;
            case enums.direction.left:
                deltaX = -hero.speed;
                break;
            case enums.direction.right:
                deltaX = hero.speed;
                break;
            case enums.direction.top:
                deltaY = -hero.speed;
                break;
            case enums.direction.leftAndBottom:
                deltaX = -hero.speed;
                deltaY = hero.speed;
                break;
            case enums.direction.leftAndTop:
                deltaX = -hero.speed;
                deltaY = -hero.speed;
                break;
            case enums.direction.rightAndBottom:
                deltaX = hero.speed;
                deltaY = hero.speed;
                break;
            case enums.direction.rightAndTop:
                deltaX = hero.speed;
                deltaY = -hero.speed;
                break;
        }
        move(deltaX * 10, deltaY * 10);
    };
    this.moveTo = function(clientX, clientY, fishId) {
        var wayX, wayY,
            position;

        // moveFish
        if (fishId !== undefined) {
            wayX = clientX - window.innerWidth / 2;
            wayY = clientY - window.innerHeight / 2;
        } else {
        // moveHero
            position = render.positionHeroOnScreen(hero);
            wayX = clientX - position.x;
            wayY = clientY - position.y;
        }

        move(wayX, wayY, fishId);
    };

    this.resize = function() {
        render.resize(window.innerWidth, window.innerHeight);
    };

    init();
}