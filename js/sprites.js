var Sprites = function() {
    this.init(arguments[0]);
};

Sprites.prototype = {
    _sprites: [],
    _width: 0,
    _height: 0,

    init: function(data) {
        this._height = data.height;
        this._width = data.width;
        this._sprites = data.sprites;
    },

    getOffset: function(spriteName) {
        for(var i = 0, len = this._sprites.length; i < len; i++) {
            var sprite = this._sprites[i];

            if(sprite.name == spriteName) {
                return {
                    x: (sprite.x * this._width) || 0,
                    y: (sprite.y * this._height) || 0,
                    width: this._width,
                    height: this._height
                };
            }
        }

        return null;
    }
};