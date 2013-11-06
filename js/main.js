/**
 * The main module where initialize all data and send request to main functionality - render, chech collistions, play sound.
 * @private {Object} render The render module instance
 * @private {Object} mapInfo Info about map that contains width, height, barrier percentage, barrier height and width, parralax values, timer value
 * @private {Array.<boolean>} mapArray The map table that provide information about barrier in map cell
 * @private {Array.<Object>} fishes The fish instances
 * @private {Object} hero The hero instance
 * @private {number} animReqHero Hero animation request that provide animation index for hero
 * @private {number} animReqFish Fish animation request that provide animation index for all fishes
 * @private {number} finishGameTime The game left time 
 * @private {number} timerVar SetTimeout instance for timer
 * @private {Event} finishEvent Event that will be execute after game is finished
 */
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

    /**
     * Check if time is out. If yes - show message and unsibsribe all events
     */
    function timer(){
        finishGameTime--;
        if(finishGameTime==0){
            render.gameOverDisplay();
            document.dispatchEvent(finishEvent);
        } else{
            render.timeDisplay(finishGameTime);
            timerVar = setTimeout(timer,1000);
        }
    }
    /**
     * Check if time is out. If yes - show message and unsibsribe all events
     * @private {number} _height The count of map row
     * @private {number} _width The count of map column
     * @private {number} _percentage The percentage of barriers on the map
     * @private {number} _count The count of barriers on the map
     */
    function initBarriers(){
        var _height = Math.floor(mapInfo.map.height / mapInfo.barrier.height),
            _width = Math.floor(mapInfo.map.width / mapInfo.barrier.width),
            _percentage = mapInfo.levels[0].barriers,
            _count = Math.ceil(_height * _width * _percentage / 100),
            i, j, l;

        for (j = 0; j < _height; j++) {
            var tempArray = [];
            for (i = 0; i < _width; i++) {
                tempArray.push(0);
            }
            mapArray.push(tempArray);
        }
        var lenW = _width - 1;
        var lenH = _height - 1;
        for (j = 0; j < _height; j++) {
            mapArray[j][0] = 1;
            mapArray[j][lenW] = 1;
            for (i = 0; i < _width; i++) {
                mapArray[0][i] = 1;
                mapArray[lenH][i] = 1;
            }
        }

        for (l = 0; l < _count; l++){
            i = Math.floor(Math.random() * (_width - 1));
            j = Math.floor(Math.random() * (_height - 1));
            if (j != _height / 2 && i != _width / 2) {
                mapArray[j][i] = 1;
            }
        }
    }
    /**
     * Generate random position fish on the map
     * @param {number} i The fish index
     * @return {number} Fish instance
     */
    function generateRandomPositionFish(i) {
        var _fish = new Fish(
            Math.round(mapInfo.map.width / 2) - 1000 * Math.random(),
            Math.round(mapInfo.map.height / 2) - 1000 * Math.random(),
            fishInfoGlobal.fishes[i]
        );
        return _fish;
    }
    /**
     * Initialize fish instance array
     * @private {number} _fishesCount The fish count on the map
     */
    function initFishes() {
        var _fishesCount = mapInfo.levels[0].fishes;
        for (var i = 0; i < _fishesCount; i++) {
            var fish = generateRandomPositionFish(i);
            while (checkWallCollision(fish)) {
                fish = generateRandomPositionFish(i);
            }
            fishes.push(fish);
        }
    }
    /**
     * Initialize hero instance in the center of the map
     */
    function initHero() {
        hero = new Fish(
            Math.round(mapInfo.map.width / 2),
            Math.round(mapInfo.map.height / 2),
            fishInfoGlobal.hero
        );
    }
    /**
     * Set up timer
     */
    function initTimer() {
        finishGameTime = mapInfo.levels[0].timer;
        timerVar = setTimeout(timer,1000);
    }
    /**
     * Execute all initialize fucntions from render module and draw all fishes
     */
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
    /**
     * Execute all initialize fucntions from total module, create finial event
     */
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

    /**
     * Check collision between fish and barriers
     * @param {Object} fishPart The fish body part (body, mouth, fin, etc.) that will be checked for collision
     * @return {boolean} Boolean value if collision was
     */
    function checkWallCollision(fishPart) {
        var vertexs = fishPart.vertexes,
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
    /**
     * Check collision between fish and barriers, between fish and other fishes
     * @param {Object} fishPart The fish body part (body, mouth, fin, etc.) that will be checked for collision
     * @param {boolean} isHero The boolean value that is true if we check our hero to other fishes. If we check fish we check collisions only with hero
     * @return {boolean} Boolean value if collision was
     */
    function checkCollision(fishPart, isHero) {
        var vertexs = fishPart.vertexes;

        var matrixCollision = checkWallCollision(fishPart);
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
                    /*if (fishPart.animation_eat){
                        fishPart.animation_eat_index = (fishPart.animation_eat_index + 1) % fishPart.animation_eat.length || 0;
                        fishPart.sprite = fishPart.sprites.getOffset(fishPart.animation_eat[fishPart.animation_eat_index]);
                    }*/
                    render.healthDisplay(fishes[i].health);
                    if (fishes[i].health <= 0) {
                        AudioModule.playCollisionSound();
                        fishes.splice(i, 1);
                    }
                    render.fishesCounterDisplay(fishes.length);
                    if (fishes.length <= 0) {
                        clearTimeout(timerVar);
                        setTimeout(function(){
                          AudioModule.playSuccessSound();
                          document.dispatchEvent(finishEvent);
                          render.finishDisplay();
                        },1000);
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
    /**
     * Count values of fish movement
     * @param {Object} fish The fish instance
     * @param {number} wayX The x offset between current position and destination one
     * @param {number} wayY The y offset between current position and destination one
     * @private {number} way The offset between current position and destination one
     * @private {number} deltaX The x distance for one fish step
     * @private {number} deltaY The y distance for one fish step
     * @private {number} angle The offset between current angle and destination one
     * @private {number} deltaSign The value that provide information about rotate direction
     * @private {number} steps The count of steps between current position and destination one
     * @return {Object} Information about total movement
     */
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
    /**
     * Count values of fish movement
     * @param {Object} fish The fish instance
     * @param {Function} drawFunction The function that will be executed to draw our fish
     * @param {Object} options Information about total movement from countMoveStep funtion
     * @return {Object} Information about total movement
     */
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

    /**
     * Init hero animation request for movement in some direction
     * @param {string} direction The direction value
     */
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
    /**
     * Init hero animation request for movement to some point
     * @param {number} clientX The x destination point on the viewport
     * @param {number} clientY The y destination point on the viewport
     */
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
    /**
     * Init fish animation request for movement all fishs to some random points
     */
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