var requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame || 
		window.oRequestAnimationFrame || 
		window.msRequestAnimationFrame ||
		function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
})();
var stopRequestAnimFrame = (function() {
    return window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        window.msCancelAnimationFrame ||
        window.clearTimeout;
})();

function Render() {
	var container,
        options,
        backgroundLayer,
        mapLayer,
		fishLayer,
        heroLayer,
        hudLayer,
        effectsLayer;

    var mapWidth, mapHeight,
        centerMapX, centerMapY,
        viewportWidth, viewportHeight,
        centerViewportX, centerViewportY;

    this.initMapLayer = function() {
		var canvas, ctx;

        canvas = document.createElement("canvas");
        canvas.id = "mapLayer";
        canvas.height = mapHeight;
		canvas.width = mapWidth;
        container.appendChild(canvas);
		
		ctx = canvas.getContext("2d");
		
		mapLayer = ctx;
	};
    this.initFishLayer = function() {
        var canvas, ctx;

        canvas = document.createElement("canvas");
        canvas.id = "fishLayer";
        canvas.height = mapHeight;
        canvas.width = mapWidth;
        container.appendChild(canvas);

        ctx = canvas.getContext("2d");

        fishLayer = ctx;
    };
    this.initHeroLayer = function(width, height) {
        var canvas, ctx, dimension;

        dimension = width > height ? width : height;
        canvas = document.createElement("canvas");
        canvas.id = "heroLayer";
        canvas.height = 2 * dimension;
        canvas.width = 2 * dimension;
        container.appendChild(canvas);

        ctx = canvas.getContext("2d");

        heroLayer = ctx;
    };
    this.initHudLayer = function() {
        var canvas, ctx;

        canvas = document.createElement("canvas");
        canvas.id = "hudLayer";
        canvas.height = mapHeight;
        canvas.width = mapWidth;
        container.appendChild(canvas);

        ctx = canvas.getContext("2d");

        hudLayer = ctx;
    };
    this.initBackground = function(){
        var canvas, ctx, img, pattern;

        canvas = document.createElement("canvas");
        canvas.id = "backgroundLayer";
        canvas.height = viewportHeight + mapHeight * options.footerRelativeSize;
        canvas.width = viewportWidth + mapWidth * options.footerRelativeSize;
        container.appendChild(canvas);

        ctx = canvas.getContext("2d");
        img = new Image();
        img.src = options.backgroundImg;
        img.onload = function(){
            pattern = ctx.createPattern(img, "repeat");
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        backgroundLayer = ctx;
    };
    this.initEffectLayer = function(){
        var canvas, ctx;

        canvas = document.createElement("canvas");
        canvas.id = "effectLayer";
        canvas.height = viewportHeight + mapHeight * options.effectsRelativeSize;
        canvas.width = viewportWidth + mapWidth * options.effectsRelativeSize;
        container.appendChild(canvas);

        ctx = canvas.getContext("2d");
        ctx.strokeStyle = 'black';
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 5;
        effectsLayer = ctx;
    };

    this.drawBarriers = function(widthBarrier, heightBarrier, mapArray) {
        var img, pattern;

        if (mapLayer) {
            img = new Image();
            img.src = options.barrierImg;
            img.onload = function() {
                pattern = mapLayer.createPattern(img, 'repeat');

                mapLayer.save();
                mapLayer.fillStyle = pattern;
                for (var j = 0; j < mapArray.length; j++){
                    for (var i = 0; i < mapArray[0].length; i++){
                        if (mapArray[j][i]){
                            mapLayer.fillRect(i * widthBarrier, j * heightBarrier, widthBarrier, heightBarrier);
                        }
                    }
                }
                mapLayer.restore();
            }
        } else {
            alert("Couldn't create barriers")
        }
    };

    this.clearFishLayer = function(){
        var layer = fishLayer,
            canvas = layer.canvas;

        layer.clearRect(0, 0, canvas.width, canvas.height);
    };
    this.drawFish = function(fish, layer) {
        var x = fish.x,
            y = fish.y,
            width = fish.width,
            height = fish.height,
            angle = fish.angle,
            totalLayer = layer || fishLayer,
            pattern;

        totalLayer.save();
        pattern = totalLayer.createPattern(fish.image, 'repeat');
        totalLayer.fillStyle = pattern;
		if (angle !== 0) {
            totalLayer.translate(x, y);
            totalLayer.rotate(angle * (Math.PI / 180));
            totalLayer.translate(-x, -y);
		}

        totalLayer.translate(x, y);
        for (var i = 0; i < fish.parts.length; i++) {
            totalLayer.drawImage(fish.parts[i].image,
                0, 0, fish.parts[i].width, fish.parts[i].height,
                fish.parts[i].x, fish.parts[i].y, fish.parts[i].width, fish.parts[i].height
            );
        }

        totalLayer.save();
        totalLayer.scale(1, height / width);
        totalLayer.beginPath();
        totalLayer.arc(0, 0, width / 2, 0, 2 * Math.PI, false);
        totalLayer.fill();
        totalLayer.restore();

        totalLayer.restore();
	};
    this.drawHero = function(fish) {
        var x = fish.x,
            y = fish.y,
            heroClone = clone(fish),
            dimension = heroLayer.canvas.width;
            halfDimension = dimension / 2;

        heroClone.x = halfDimension;
        heroClone.y = halfDimension;

        heroLayer.clearRect(0, 0, dimension, dimension);
        this.drawFish(heroClone, heroLayer);

        moveLayers(x, y, halfDimension);
    };

    this.positionHeroOnScreen = function(hero){
        return {
            x: (hero.x < centerViewportX) ?
                    hero.x :
                    ((hero.x > mapWidth - centerViewportX) ?
                        (viewportWidth - (mapWidth - hero.x)) :
                        centerViewportX),
            y: (hero.y < centerViewportY) ?
                hero.y :
                ((hero.y > mapHeight - centerViewportY) ?
                    (viewportHeight - (mapHeight - hero.y)) :
                    centerViewportY)
        };
    };

    this.healthDisplay = function (health) {
        hudLayer.clearRect(0, 0, hudLayer.canvas.width, 20);
        hudLayer.font = "bold 18px Arial";
        hudLayer.fillText("Life Remaining:"+health, 80, 20);
    };
    this.fishesCounterDisplay = function (count) {
        hudLayer.clearRect(0, 40, hudLayer.canvas.width, 40);
        hudLayer.font = "bold 18px Arial";
        hudLayer.fillText("Fishes Remaining:"+count, 80, 60);
    };
    this.timeDisplay = function (count) {
        hudLayer.clearRect(0, 60, hudLayer.canvas.width, 60);
        hudLayer.font = "bold 18px Arial";
        hudLayer.fillText("Time Remaining:"+count, 80, 100);
    };
    this.gameOverDisplay = function () {
        hudLayer.clearRect(0, 0, hudLayer.canvas.width, hudLayer.canvas.height);
        hudLayer.fillStyle = "rgba(0, 0, 255, 1)";
        hudLayer.font = "bold 84px Arial";
        hudLayer.fillText("Game Over", 80, 100);
    };
    this.finishDisplay = function () {
        hudLayer.clearRect(0, 0, hudLayer.canvas.width, hudLayer.canvas.height);
        hudLayer.fillStyle = "rgba(0, 0, 255, 1)";
        hudLayer.font = "bold 84px Arial";
        hudLayer.fillText("Success", 80, 100);
    };

    this.effect = function (x, y){
        var maxParallax = options.effectsRelativeSize,
            centerLayerX = centerMapX * maxParallax,
            centerLayerY = centerMapY * maxParallax,
            steps = 5,
            delta = maxParallax / steps,
            parallax = 1;

        var drawEffect = function() {
            effectsLayer.beginPath();
            effectsLayer.arc(
                centerLayerX - centerMapX * parallax + (x - centerViewportX) * maxParallax - + (x - centerViewportX) * parallax,
                centerLayerY + (y - centerViewportY) * parallax,
                5 * parallax, 0, 2 * Math.PI, false
            );
            effectsLayer.stroke();

            if (parallax <= maxParallax) {
                parallax += delta;
                requestAnimFrame(drawEffect);
            }
        };

        requestAnimFrame(drawEffect);
    };

    function init() {
        mapWidth = arguments[0];
        mapHeight = arguments[1];
        centerMapX = Math.ceil(mapWidth / 2);
        centerMapY = Math.ceil(mapHeight / 2);
        viewportWidth = arguments[2];
        viewportHeight = arguments[3];
        centerViewportX = Math.ceil(viewportWidth / 2);
        centerViewportY = Math.ceil(viewportHeight / 2);
        options = arguments[4];

        container = document.getElementById("container");
    }
    function moveLayers(heroX, heroY, heroDimension){
        var layerStartX, layerStartY;

        if (heroX < centerViewportX) {
            layerStartX = 0;
        } else {
            if (heroX > mapWidth - centerViewportX) {
                layerStartX = mapWidth - viewportWidth;
            } else {
                layerStartX = heroX - centerViewportX;
            }
        }

        if (heroY < centerViewportY) {
            layerStartY = 0;
        } else {
            if (heroY > mapHeight - centerViewportY) {
                layerStartY = mapHeight - viewportHeight;
            } else {
                layerStartY = heroY - centerViewportY;
            }
        }

        moveLayer(mapLayer, layerStartX, layerStartY);
        moveLayer(backgroundLayer, heroX * options.footerRelativeSize, heroY * options.footerRelativeSize);
        moveLayer(effectsLayer, heroX * options.effectsRelativeSize, heroY * options.effectsRelativeSize);
        moveLayer(fishLayer, layerStartX, layerStartY);
        moveLayer(heroLayer, layerStartX - heroX + heroDimension, layerStartY - heroY + heroDimension);
    }
    function moveLayer(layer, layerStartX, layerStartY){
        var elementStyle = layer.canvas.style,
            transformValue = 'matrix(1, 0, 0, 1, ' + -layerStartX + ', ' + -layerStartY + ')';

        elementStyle.webkitTransform = transformValue;
        elementStyle.MozTransform = transformValue;
        elementStyle.msTransform = transformValue;
        elementStyle.OTransform = transformValue;
        elementStyle.transform = transformValue;
    }

    this.resize = function(width, height){
        viewportWidth = width;
        viewportHeight = height;
        centerViewportX = Math.ceil(width / 2);
        centerViewportY = Math.ceil(height / 2);
    };

    init.apply(this, arguments);
}