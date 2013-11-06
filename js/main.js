function Main() {
    var render = null,
        mapInfo,
        mapArray = [],
        fishes = [],
        hero,
        animReqHero,
        animReqFish,
        finishGameTime,
        timerVar,
        finishEvent;

    function timer(){
        finishGameTime--;
        if(finishGameTime==0){
            render.gameOverDisplay();
            document.dispatchEvent(finishEvent);
            setTimeout(function(){},1000);
        } else{
            render.timeDisplay(finishGameTime);
            timerVar = setTimeout(timer,1000);
        }
    }
    function initBarriers(){
        var height = Math.floor(mapInfo.map.height / mapInfo.barrier.height),
            width = Math.floor(mapInfo.map.width / mapInfo.barrier.width),
            percentage = mapInfo.levels[0].barriers,
            count = Math.ceil(height * width * percentage / 100),
            i, j, l;

        for (j = 0; j < height; j++) {
            var tempArray = [];
            for (i = 0; i < width; i++) {
                tempArray.push(0);
            }
            mapArray.push(tempArray);
        }
        var lenW = width - 1;
        var lenH = height - 1;
        for (j = 0; j < height; j++) {
            mapArray[j][0] = 1;
            mapArray[j][lenW] = 1;
            for (i = 0; i < width; i++) {
                mapArray[0][i] = 1;
                mapArray[lenH][i] = 1;
            }
        }

        for (l = 0; l < count; l++){
            i = Math.floor(Math.random() * (width-1));
            j = Math.floor(Math.random() * (height-1));
            if (j != height/2 && i != width/2) {
                mapArray[j][i] = 1;
            }
        }
    }
    function generateRandomPositionFish(i) {
        var fish = new Fish(
            Math.round(mapInfo.map.width / 2) - 1000 * Math.random(),
            Math.round(mapInfo.map.height / 2) - 1000 * Math.random(),
            fishInfoGlobal.fishes[i]
        );
        return fish;
    }
    function initFishes() {
        var fishesCount = mapInfo.levels[0].fishes;
        for (var i = 0; i < fishesCount; i++) {
            var fish = generateRandomPositionFish(i);
            while (checkWallCollision(fish)) {
                fish = generateRandomPositionFish(i);
            }
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
    function initTimer() {
        finishGameTime = mapInfo.levels[0].timer;
        timerVar = setTimeout(timer,1000);
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
        render.initHudLayer();
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
        AudioModule.playBackgroundMusic();

        finishEvent = document.createEvent('Events');
        finishEvent.initEvent('end');
        document.addEventListener('end', function(){
            stopRequestAnimFrame(animReqHero);
            stopRequestAnimFrame(animReqFish);
            AudioModule.stopFishMoveSound();
        });

        renderAll();
        initTimer();
	}

    function checkWallCollision(fish) {
        var vertexs = fish.vertexes,
            matrixCollision = false,
            x, y;
        for (var j = 0; j < vertexs.length; j++) {
            x = Math.floor(vertexs[j][0] / mapInfo.barrier.width);
            y = Math.floor(vertexs[j][1] / mapInfo.barrier.height);
            if (mapArray[y][x]) {
                matrixCollision = true;
                break;
            }
        }
        return matrixCollision;
    }
    function checkCollision(fish, isHero) {
        var vertexs = fish.vertexes;

        var matrixCollision = checkWallCollision(fish);
        if (matrixCollision){
            return matrixCollision;
        }

        var fishCollision = false, collisionSat;
        if (isHero) {
            for(var i = 0; i < fishes.length; i++) {
                fishes[i].vertexes = collisionLib.vert.convertSquare(fishes[i]);
                collisionSat = collisionLib.vert.sat(vertexs, fishes[i].vertexes);
                if (collisionSat) {
                    AudioModule.playFishCollisionSound();
                    fishes[i].health = fishes[i].health - hero.damage;
                    if (fish.animation_eat){
                        fish.animation_eat_index = (fish.animation_eat_index + 1) % fish.animation_eat.length || 0;
                        var sprite = fish.sprites.getOffset(fish.animation_eat[fish.animation_eat_index]);
                        fish.x = sprite.x;
                        fish.y = sprite.y;
                    }
                    render.healthDisplay(fishes[i].health);
                    if (fishes[i].health <= 0) {
                        AudioModule.playCollisionSound();
                        fishes.splice(i, 1);
                    }
                    render.fishesCounterDisplay(fishes.length);
                    if (fishes.length <= 0) {
                        AudioModule.playSuccessSound();
                        document.dispatchEvent(finishEvent);
                        render.finishDisplay();
                        clearTimeout(timerVar);
                    }
                    fishCollision = true;
                    break;
                }
            }
        } else {
            hero.vertexes = collisionLib.vert.convertSquare(hero);
            collisionSat = collisionLib.vert.sat(vertexs, hero.vertexes);
            if (collisionSat) {
                //console.log('collisionSat');
                fishCollision = true;
                return fishCollision;
            }
        }

        return fishCollision;
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
        } else if (angle - fish.angle < -180) {
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
                    if (checkCollision(cloneFish.parts[i], options.isHero)) {
                        //console.log('collision ' + cloneFish.parts[i].type);
                    } else {
                        //render.effect(cloneFish.x, cloneFish.y);
                    }
                }
            }

            cloneFish.vertexes = collisionLib.vert.convertSquare( cloneFish );
            if (!checkCollision(cloneFish, options.isHero)) {
                //console.log('collision body');
                fish.x = cloneFish.x;
                fish.y = cloneFish.y;
            } else {
                //render.effect(cloneFish.x, cloneFish.y);
            }

            options.step++;
            delete cloneFish;
        } else {
            if (options.isHero){
                AudioModule.stopFishMoveSound();
            }
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
        options.isHero = true;

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

        options.isHero = true;
        var doMove = function(){
            stopRequestAnimFrame(animReqHero);
            AudioModule.playFishMoveSound();
            nextMoveStep(hero, render.drawHero, options);
            animReqHero = requestAnimFrame(doMove);
        };

        stopRequestAnimFrame(animReqHero);
        animReqHero = requestAnimFrame(doMove);
    };
    this.fishMoveTo = function(){
        var wayX, wayY, options = new Array(5);

        for (var i = 0; i < fishes.length; i++) {
            wayX = Math.floor((Math.random() - 0.5) * window.innerWidth);
            wayY = Math.floor((Math.random() - 0.5) * window.innerHeight);
            options[i] = countMoveStep(fishes[i], wayX, wayY);
            options[i].isHero = false;
        }

        var doMove = function(){
            stopRequestAnimFrame(animReqFish);
            render.clearFishLayer();
            for (var i = 0; i < fishes.length; i++) {
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