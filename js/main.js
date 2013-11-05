function Main() {
    var render = null,
        mapInfo,
        mapArray = [],
        fishes = [],
        hero,
        animReqHero,
        animReqFish = {},
        backgroundAudio,
        fishMoveAudio,
        collisionAudio,
        fishCollisionAudio,
        successAudio,
        finishGameTime,
        timerVar;

    function initBarriers() {
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

        for (l = 0; l < count; l++) {
            i = Math.floor(Math.random() * (width - 1));
            j = Math.floor(Math.random() * (height - 1));
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
            if (checkWallCollision(fish)) {
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

    function renderAll() {
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
        //render.initEffects();

        render.drawBarriers(mapInfo.barrier.width, mapInfo.barrier.height, mapArray);
        for (var i = 0; i < fishes.length; i++) {
            render.drawFish(fishes[i]);
        }
        render.drawHero(hero);
    }

    function initBackgroundMusic() {
        backgroundAudio = new Audio(audioGlobal.background.src);
        backgroundAudio.loop = true;
        backgroundAudio.volume = .25;
        backgroundAudio.load();
        backgroundAudio.play();
    }

    function initFishMoveSound() {
        fishMoveAudio = new Audio(audioGlobal.fishMove.src);
        fishMoveAudio.loop = true;
        fishMoveAudio.volume = .75;
        fishMoveAudio.load();
    }

    function timer(){
        finishGameTime--;
        if(finishGameTime==0){
            render.gameOverDisplay();
            setTimeout(function(){},1000);
        } else{
            render.timeDisplay(finishGameTime);
            timerVar = setTimeout(timer,1000);
        }
    }

    function initTimer() {
        finishGameTime = mapInfo.levels[0].timer,
        timerVar = setTimeout(timer,1000);
    }

    function playFishMoveSound() {
        fishMoveAudio.play();
    }

    function stopFishMoveSound() {
        fishMoveAudio.pause();
    }

    function initCollisionSound() {
        collisionAudio = new Audio(audioGlobal.collision.src);
        collisionAudio.loop = false;
        collisionAudio.volume = .75;
        collisionAudio.load();
    }

    function playCollisionSound() {
        collisionAudio.play();
    }

    function stopCollisionSound() {
        collisionAudio.pause();
    }

    function initFishCollisionSound() {
        fishCollisionAudio = new Audio(audioGlobal.fishCollision.src);
        fishCollisionAudio.loop = false;
        fishCollisionAudio.volume = .75;
        fishCollisionAudio.load();
    }

    function playFishCollisionSound() {
        fishCollisionAudio.play();
    }

    function stopFishCollisionSound() {
        fishCollisionAudio.pause();
    }

    function initSuccessSound() {
        successAudio = new Audio(audioGlobal.success.src);
        successAudio.loop = false;
        successAudio.volume = .75;
        successAudio.load();
    }

    function playSuccessSound() {
        successAudio.play();
    }

    function init() {
        mapInfo = mapInfoGlobal;
        initBarriers();
        initFishes();
        initHero();
        initBackgroundMusic();
        initFishMoveSound();
        initCollisionSound();
        initFishCollisionSound();
        initSuccessSound()
        renderAll();
        initTimer()
    }

    function checkWallCollision(hero) {
        var vertexs = hero.vertexes;
        var matrixCollision = false;
        for (var j = 0; j < vertexs.length; j++) {
            var x = Math.floor(vertexs[j][0] / mapInfo.barrier.width);
            var y = Math.floor(vertexs[j][1] / mapInfo.barrier.height);
            if (mapArray[y][x]) {
                matrixCollision = true;
                return matrixCollision;
            }
        }
        return matrixCollision;
    }

    function checkCollision(hero, fish, fishId) {
        var vertexs = hero.vertexes;
        var matrixCollision = false;
        for (var j = 0; j < vertexs.length; j++) {
            var x = Math.floor(vertexs[j][0] / mapInfo.barrier.width);
            var y = Math.floor(vertexs[j][1] / mapInfo.barrier.height);
            if (mapArray[y][x]) {
                matrixCollision = true;
                //console.log('collision');
                return matrixCollision;
            }
        }

        var fishCollision = false;
        for (var i = 0; i < fishes.length; i++) {
            if (fishes[i] !== fish) {
                fishes[i].vertexes = collisionLib.vert.convertSquare(fishes[i])
                var collisionSat = collisionLib.vert.sat(vertexs, fishes[i].vertexes);
                if (collisionSat) {
                    if (fishId === undefined) {
                        playFishCollisionSound();
                        fishes[i].health = fishes[i].health - hero.damage;
                        render.healthDisplay(fishes[i].health)
                        if (fishes[i].health <= 0) {
                            playCollisionSound()
                            render.clearFish(fishes[i])
                            fishes.splice(i, 1)
                        }
                        render.fishesCounterDisplay(fishes.length)
                        if (fishes.length <= 0) {
                            playSuccessSound();
                            render.finishDisplay();
                            clearTimeout(timerVar);
                        }
                    }
                    fishCollision = true;
                    return fishCollision;
                }
            }
        }
        // fish hero collision
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
            playFishMoveSound();
            fish = hero;
            animReq = animReqHero;
            drawFunction = render.drawHero;
        }
        if (fish) {
            stopRequestAnimFrame(animReq);
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

            var doMove = function() {
                stopRequestAnimFrame(animReq);
                if (angle !== fish.angle) {
                    if (Math.abs(angle - fish.angle) > fish.speed) {
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
                            cloneFish.parts[i].vertexes = collisionLib.vert.convertSquare(cloneFish.getPartInfo(cloneFish.parts[i]));
                            if (checkCollision(cloneFish.parts[i], null, fishId) && (fishId === undefined)) {
                                //console.log(cloneFish.health)
                                //console.log('collision ' + cloneFish.parts[i].type + ' damage ' + cloneFish.parts[i].damage);
                            }
                        }
                    }

                    cloneFish.vertexes = collisionLib.vert.convertSquare(cloneFish);
                    if (!checkCollision(cloneFish, fish, fishId)) {
                        //console.log('collision body');
                        fish.x = cloneFish.x;
                        fish.y = cloneFish.y;
                        drawFunction.call(render, fish);
                        animReq = requestAnimFrame(doMove);
                    }

                    step++;
                    delete cloneFish;
                } else {
                    stopFishMoveSound()
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