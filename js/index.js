var app = null;

window.onload = function(){
	app = new Main();
	setInterval(loop, 3000);
};
window.onresize = function() {
    app.resize();
};

window.onkeydown = function() {
};
window.onmousedown = function(e) {
	var x = e.clientX,
		y = e.clientY;

    app.moveTo(x, y);
};

function loop() {
	
	for (var i = 0; i < 5; i++) {
		var x = Math.floor(Math.random() * 1000),
        	y = Math.floor(Math.random() * 1000);
        	app.moveToFish(x, y, i)
    	;
	};
	
}