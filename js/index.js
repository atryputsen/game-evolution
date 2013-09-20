var app = null;

window.onload = function(){
	app = new Main();
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