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
        mapLayer,
		fishLayer,
        heroLayer;

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

    this.drawBarriers = function(widthBarrier, heightBarrier, mapArray) {
        if (mapLayer) {
            mapLayer.save();
            mapLayer.fillStyle = "black";
            for (var j = 0; j < mapArray.length; j++){
                for (var i = 0; i < mapArray[0].length; i++){
                    if (mapArray[j][i]){
                        mapLayer.fillRect(i * widthBarrier, j * heightBarrier, widthBarrier, heightBarrier);
                    }
                }
            }
            mapLayer.restore();
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
            totalLayer = layer || fishLayer;

        totalLayer.save();
        totalLayer.globalAlpha = 0.5;
        totalLayer.fillStyle = "red";
		if (angle !== 0) {
            totalLayer.translate(x, y);
            totalLayer.rotate(angle * (Math.PI / 180));
            totalLayer.translate(-x, -y);
		}
        totalLayer.fillRect(Math.ceil(x - width/2), Math.ceil(y - height/2), width, height);
        if (fish.parts.length>0) {
            for (var i = 0; i < fish.parts.length; i++) {
                var px, py;
                if (fish.parts[i].type == 'mouth') {
                    px = Math.ceil(x - width/2+fish.parts[i].width)
                    py = Math.ceil(y - height/2-fish.parts[i].height)
                } else if(fish.parts[i].type == 'tail') {
                    px = Math.ceil(x - width/2+fish.parts[i].width)
                    py = Math.ceil(y + height/2)
                } else if(fish.parts[i].type == 'fin') {
                    px = Math.ceil(x- width)
                    py = Math.ceil(y-height/2)
                } else if(fish.parts[i].type == 'horn') {
                    px = Math.ceil(x- width)
                    py = Math.ceil(y)
                }
                totalLayer.fillRect(px, py, fish.parts[i].width, fish.parts[i].height);
            };
        }
        totalLayer.restore();
	};

    this.drawFishAi = function(fish) {
        fishLayer.clearRect(fish.x-100, fish.y-100, 185, 185);
        this.drawFish(fish, fishLayer);
    };

    this.clearFishLayer = function() {
        fishLayer.clearRect(0, 0, mapWidth, mapHeight);
    }

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

    function init() {
        mapWidth = arguments[0];
        mapHeight = arguments[1];
        viewportWidth = arguments[2];
        viewportHeight = arguments[3];
        centerViewportX = Math.ceil(viewportWidth / 2);
        centerViewportY = Math.ceil(viewportHeight / 2);

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
        moveLayer(fishLayer, mapStartX, mapStartY, 1);
        moveLayer(heroLayer, mapStartX - heroX + heroDimension, mapStartY - heroY + heroDimension, 1);
    }
    function moveLayer(layer, x, y, collapse){
        //layer.canvas.style.top = Math.ceil(-y * collapse) + "px";
        //layer.canvas.style.left = Math.ceil(-x * collapse) + "px";
        var px= Math.ceil(-y * collapse),
            py= Math.ceil(-x * collapse);

            layer.canvas.style.webkitTransform = 'matrix(1, 0, 0, 1, '+ py+', '+ px+')';
            layer.canvas.style.MozTransform = 'matrix(1, 0, 0, 1, '+ py+', '+ px+')';
            layer.canvas.style.msTransform = 'matrix(1, 0, 0, 1, '+ py+', '+ px+')';
            layer.canvas.style.OTransform = 'matrix(1, 0, 0, 1, '+ py+', '+ px+')';
            layer.canvas.style.transform = 'matrix(1, 0, 0, 1, '+ py+', '+ px+')';
    }

    this.resize = function(width, height){
        viewportWidth = width;
        viewportHeight = height;
        centerViewportX = Math.ceil(width / 2);
        centerViewportY = Math.ceil(height / 2);
    };

    init.apply(this, arguments);
}