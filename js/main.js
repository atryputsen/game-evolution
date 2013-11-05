function Main() {
	var render = null,
        mapInfo,
        mapArray = [],
        fishes = [],
        hero,
        animReqHero,
        animReqFish;

    function initBarriers(){
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
    }
	function initFishes() {
		var fishesCount = mapInfo.levels[0].fishes;
        for(var i = 0; i < fishesCount; i++) {
            var fish = new Fish(
                Math.round(mapInfo.map.width * Math.random()),
                Math.round(mapInfo.map.height * Math.random()),
                fishInfoGlobal.fishes[i]
            );
            fishes.push(fish);
        }
	}
    function initHero() {
        hero = new Fish(
            Math.round(mapInfo.map.width / 2),
            Math.round(mapInfo.map.height / 2),
            fishInfoGlobal.hero
        );
    }
    function renderAll(){
        render = new Render(mapInfo.map.width, mapInfo.map.height, window.innerWidth, window.innerHeight, {
            backgroundImg: mapInfo.map.src,
            barrierImg: mapInfo.barrier.src,
            footerRelativeSize: mapInfo.parallax.footer,
            effectsRelativeSize: mapInfo.parallax.effects
        });
        render.initBackground();
        render.initMapLayer();
        render.initFishLayer();
        render.initHeroLayer(hero.width, hero.height);
        render.initEffectLayer();

        render.drawBarriers(mapInfo.barrier.width, mapInfo.barrier.height, mapArray);
        for (var i = 0; i < fishes.length; i++) {
            render.drawFish(fishes[i]);
        }
        render.drawHero(hero);
    }
	function init() {
        mapInfo = mapInfoGlobal;
        initBarriers();
		initFishes();
        initHero();

        renderAll();
	}

    function checkCollision(vertexs, checkHero) {
        var matrixCollision = false, x, y;
        for(var j = 0; j < vertexs.length; j++) {
            x = Math.floor(vertexs[j][0]/ mapInfo.barrier.width);
            y = Math.floor(vertexs[j][1]/ mapInfo.barrier.height);
            if (mapArray[y][x]){
                //console.log('collision');
                matrixCollision = true;
                return matrixCollision;
            }
        }

        var fishCollision = false, collisionSat;

        if (!checkHero) {
            hero.vertexes = collisionLib.vert.convertSquare(hero);
            collisionSat = collisionLib.vert.sat(vertexs, hero.vertexes);
            if (collisionSat) {
                //console.log('collisionSat');
                fishCollision = true;
                return fishCollision;
            }
        } else {
            for(var i = 0; i < fishes.length; i++) {
                fishes[i].vertexes = collisionLib.vert.convertSquare(fishes[i]);
                collisionSat = collisionLib.vert.sat(vertexs, fishes[i].vertexes);
                if (collisionSat) {
                    //console.log('collisionSat');
                    fishCollision = true;
                    return fishCollision;
                }
            }
        }

        return false;
    }
    function countMoveStep(fish, wayX, wayY){
        var way,
            deltaX, deltaY,
            angle, deltaSign,
            steps;

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

        return {
            step: 0,
            steps: steps,
            deltaX: deltaX,
            deltaY: deltaY,
            angle: angle,
            deltaSign: deltaSign
        }
    }
    function nextMoveStep(fish, drawFunction, options){
        var step = options.step,
            steps = options.steps,
            deltaX = options.deltaX,
            deltaY = options.deltaY,
            angle = options.angle,
            deltaSign = options.deltaSign;

        if (angle !== fish.angle) {
            if (Math.abs(angle - fish.angle) > fish.speed){
                fish.angle += fish.speed * deltaSign;
            } else {
                fish.angle = angle;
            }
        } else if (step < steps) {
            var cloneFish = clone(fish);
            cloneFish.x += deltaX;
            cloneFish.y += deltaY;

            if (cloneFish.parts.length > 0) {
                for (var i = 0; i < cloneFish.parts.length; i++) {
                    cloneFish.parts[i].vertexes = collisionLib.vert.convertSquare( cloneFish.getPartInfo(cloneFish.parts[i]) );
                    if (checkCollision(cloneFish.parts[i].vertexes, options.checkHero)) {
                        //console.log('collision ' + cloneFish.parts[i].type);
                    } else {
                        //render.effect(cloneFish.x, cloneFish.y);
                    }
                }
            }

            cloneFish.vertexes = collisionLib.vert.convertSquare( cloneFish );
            if (!checkCollision(cloneFish.vertexes, options.checkHero)) {
                //console.log('collision body');
                fish.x = cloneFish.x;
                fish.y = cloneFish.y;
            } else {
                //render.effect(cloneFish.x, cloneFish.y);
            }

            options.step++;
            delete cloneFish;
        }

        drawFunction.call(render, fish);
    }

    this.moveDirection = function(direction) {
        var deltaX = 0,
            deltaY = 0,
            options;

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

        options = countMoveStep(hero, deltaX * 10, deltaY * 10);
        options.checkHero = true;

        var doMove = function(){
            stopRequestAnimFrame(animReqHero);
            nextMoveStep(hero, render.drawHero, options);
            animReqHero = requestAnimFrame(doMove);
        };

        stopRequestAnimFrame(animReqHero);
        animReqHero = requestAnimFrame(doMove);
    };
    this.heroMoveTo = function(clientX, clientY) {
        var position = render.positionHeroOnScreen(hero),
            wayX = clientX - position.x,
            wayY = clientY - position.y,
            options = countMoveStep(hero, wayX, wayY);

        options.checkHero = true;
        var doMove = function(){
            stopRequestAnimFrame(animReqHero);
            nextMoveStep(hero, render.drawHero, options);
            animReqHero = requestAnimFrame(doMove);
        };

        stopRequestAnimFrame(animReqHero);
        animReqHero = requestAnimFrame(doMove);
    };
    this.fishMoveTo = function(){
        var wayX, wayY, options = new Array(5);

        for (var i = 0; i < 5; i++) {
            wayX = Math.floor((Math.random() - 0.5) * window.innerWidth);
            wayY = Math.floor((Math.random() - 0.5) * window.innerHeight);
            options[i] = countMoveStep(fishes[i], wayX, wayY);
            options[i].checkHero = false;
        }

        var doMove = function(){
            stopRequestAnimFrame(animReqFish);
            render.clearFishLayer();
            for (var i = 0; i < 5; i++) {
                nextMoveStep(fishes[i], render.drawFish, options[i]);
            }
            animReqFish = requestAnimFrame(doMove);
        };

        stopRequestAnimFrame(animReqFish);
        animReqFish = requestAnimFrame(doMove);
    };

    this.resize = function() {
        render.resize(window.innerWidth, window.innerHeight);
    };

    init();
}