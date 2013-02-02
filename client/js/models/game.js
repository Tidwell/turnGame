function game() {
	this.map;

	this.setMap = function(map) {
		this.map = map;
	};

	function init() {
		currentGame = this;
	}

	init();
}