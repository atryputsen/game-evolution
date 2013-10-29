var requestAnimFrame = (function(callback) {
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
        effectsLayer;

    var mapWidth, mapHeight,
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
    this.initBackground = function(){
        var canvas, ctx, img, pattern;

        canvas = document.createElement("canvas");
        canvas.id = "backgroundLayer";
        canvas.height = viewportHeight + (mapHeight - viewportHeight) * options.footerRelativeSize;
        canvas.width = viewportWidth + (mapWidth - viewportWidth) * options.footerRelativeSize;
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
        canvas.height = viewportHeight + (mapHeight - viewportHeight) * options.effectsRelativeSize;
        canvas.width = viewportWidth + (mapWidth - viewportWidth) * options.effectsRelativeSize;
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
            totalLayer.drawImage(fish.parts[i].image, fish.parts[i].x, fish.parts[i].y, fish.parts[i].width, fish.parts[i].height);
        }

        totalLayer.save();
        totalLayer.scale(1, height / width);
        totalLayer.beginPath();
        totalLayer.arc(0, 0, width / 2, 0, 2 * Math.PI, false);
        totalLayer.fill();
        totalLayer.restore();

        totalLayer.restore();
	};

    this.drawFishAi = function(fish) {
        fishLayer.clearRect(fish.x-100, fish.y-100, 185, 185);
        this.drawFish(fish, fishLayer);
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

    this.effect = function (x, y){
        var maxParallax = options.effectsRelativeSize,
            steps = 5,
            delta = maxParallax / steps,
            parallax = 1;

        var drawEffect = function() {
            effectsLayer.beginPath();
            effectsLayer.arc(x * parallax, y * parallax, 5 * parallax, 0, 2 * Math.PI, false);
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
        viewportWidth = arguments[2];
        viewportHeight = arguments[3];
        centerViewportX = Math.ceil(viewportWidth / 2);
        centerViewportY = Math.ceil(viewportHeight / 2);
        options = arguments[4];

        container = document.getElementById("container");
    }
    function moveLayers(heroX, heroY, heroDimension){
        var mapStartX, mapStartY;

        if (heroX < centerViewportX) {
            mapStartX = 0;
        } else {
            if (heroX > mapWidth - centerViewportX) {
                mapStartX = mapWidth - viewportWidth;
            } else {
                mapStartX = heroX - centerViewportX;
            }
        }

        if (heroY < centerViewportY) {
            mapStartY = 0;
        } else {
            if (heroY > mapHeight - centerViewportY) {
                mapStartY = mapHeight - viewportHeight;
            } else {
                mapStartY = heroY - centerViewportY;
            }
        }

        moveLayer(mapLayer, mapStartX, mapStartY, 1);
        moveLayer(backgroundLayer, mapStartX, mapStartY, options.footerRelativeSize);
        moveLayer(effectsLayer, mapStartX, mapStartY, options.effectsRelativeSize);
        moveLayer(fishLayer, mapStartX, mapStartY, 1);
        moveLayer(heroLayer, mapStartX - heroX + heroDimension, mapStartY - heroY + heroDimension, 1);
    }
    function moveLayer(layer, x, y, parallax){
        var deltaY = Math.ceil(-y * parallax),
            deltaX = Math.ceil(-x * parallax),
            elementStyle = layer.canvas.style,
            transformValue = 'matrix(1, 0, 0, 1, ' + deltaX + ', ' + deltaY + ')';

        /*elementStyle.top = deltaY + "px";
        elementStyle.left = deltaX + "px";*/
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