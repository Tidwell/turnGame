function renderer() {
	currentRenderer = this;
	var game = currentGame;

	this.gameShow = function() {
		$('#gamestate').fadeIn();
	};

	/*
	args.map {
		hexes: [
			{
				x: #
				y: #
				z: #
				tileType: string, classname to give hex
			},
		]
	}
	*/
	this.renderMap = function(args) {
		var i = 0;
		$('.hex').remove();
		args.map.hexes.forEach(function(hex) {
			//create it
			var domHex = createHex(hex);

			//args.map.hexes[i].domHex = domHex;
			//for some reason we will setTimeout this.  It will need to be
			//use the animation queue eventually...
			setTimeout(function() {
				//animate the hex up 18 px for each level
				if(hex.z > 0) {
					var amnt = 18 * (hex.z);
					$(domHex).animate({
						top: '-=' + amnt
					}, 100);
				}
			}, 500);
			i++;
		});
		currentEditor.finish();
	};

	var createHex = function(obj) {
		var q = obj.x;
		var i = obj.y;
		var hex = $('<div class="hex"></div>').appendTo('#map #hexContainer');
		hex.css('top', 0 - (34 * i) + (11 * q)); //29, 7
		hex.css('left', 0 + (94 * q) + (72 * i)); //58, 42
		hex.css('z-index', 10 - i);
		hex.data('column', q);
		hex.data('row', i);
		hex.attr('rel', 'x' + q + 'y' + i);
		hex.text('x' + q + 'y' + i + 'z' + obj.z);
		hex.addClass(obj.tileType);
		return hex;
	};
}