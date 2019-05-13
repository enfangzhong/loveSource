function Vector(x, y) {  // 矢量
	this.x = x;
	this.y = y;
};

Vector.prototype = {
	rotate: function (theta) {
		var x = this.x;
		var y = this.y;
		this.x = Math.cos(theta) * x - Math.sin(theta) * y;
		this.y = Math.sin(theta) * x + Math.cos(theta) * y;
		return this;
	},
	mult: function (f) {
		this.x *= f;
		this.y *= f;
		return this;
	},
	clone: function () {
		return new Vector(this.x, this.y);
	}
};

function Petal(stretchA, stretchB, startAngle, angle, growFactor, bloom) {  // 花瓣
	this.stretchA = stretchA;
	this.stretchB = stretchB;
	this.startAngle = startAngle;
	this.angle = angle;
	this.bloom = bloom;
	this.growFactor = growFactor;
	this.r = 1;
	this.isfinished = false;
}

Petal.prototype = {
	draw: function () {
		var ctx = this.bloom.garden.ctx;
		var v1, v2, v3, v4;
		v1 = new Vector(0, this.r).rotate(Garden.degrad(this.startAngle));
		v2 = v1.clone().rotate(Garden.degrad(this.angle));
		v3 = v1.clone().mult(this.stretchA);
		v4 = v2.clone().mult(this.stretchB);
		ctx.strokeStyle = this.bloom.c;  // ?
		ctx.beginPath();
		ctx.moveTo(v1.x, v1.y);
		ctx.bezierCurveTo(v3.x, v3.y, v4.x, v4.y, v2.x, v2.y);
		ctx.stroke();
	},
	render: function () {
		if (this.r <= this.bloom.r) {
			this.r += this.growFactor;
			this.draw();
		} else {
			this.isfinished = true;
		}
	}
}

function Bloom(p, r, c, pc, garden) {  // 花
	this.p = p;
	this.r = r;
	this.c = c;
	this.pc = pc;
	this.petals = [];
	this.garden = garden;
	this.init();
	this.garden.addBloom(this);
};

Bloom.prototype = {
	draw: function () {
		var p, isfinished = true;
		this.garden.ctx.save();
		this.garden.ctx.translate(this.p.x, this.p.y);
		for (var i = 0; i < this.petals.length; i++) {
			p = this.petals[i];
			p.render();
			isfinished *= p.isfinished;
		}
		this.garden.ctx.restore();
		if (isfinished == true) {
			this.garden.removeBloom(this);
		}
	},
	init: function () {
		var angle = 360 / this.pc;
		var startAngle = Garden.randomInt(0, 90);
		for (var i = 0; i < this.pc; i++) {
			this.petals.push(new Petal(Garden.random(Garden.options.petalStretch.min, Garden.options.petalStretch.max), Garden.random(Garden.options.petalStretch.min, Garden.options.petalStretch.max), startAngle + i * angle, angle, Garden.random(Garden.options.growFactor.min, Garden.options.growFactor.max), this));
		}
	}
}

function Garden(ctx, element) {
	this.blooms = [];
	this.element = element;
	this.ctx = ctx;
}

Garden.prototype = {
	render: function () {
		for(let i = 0; i < this.blooms.length; i++) {
			this.blooms[i].draw();
		}
	},
	addBloom: function (b) {
		this.blooms.push(b);
	},
	removeBloom: function (b) {
		let bloom;
		for (let i = 0; i < this.blooms.length; i++) {
			bloom = this.blooms[i];
			if (bloom === b) {
				this.blooms.splice(i, 1);
				return this;
			}
		}
	},
	createRandomBloom: function(x, y) { // 创建花朵
		this.createBloom(x, y, Garden.randomInt(Garden.options.bloomRadius.min, Garden.options.bloomRadius.max), Garden.randomrgba(Garden.options.color.rmin, Garden.options.color.rmax, Garden.options.color.gmin, Garden.options.color.gmax, Garden.options.color.bmin, Garden.options.color.bmax, Garden.options.color.opacity), Garden.randomInt(Garden.options.petalCount.min, Garden.options.petalCount.max));
	},
	createBloom: function (x, y, r, c, pc) { // x,y,半径，颜色，花盘数量
		new Bloom(new Vector(x, y), r, c, pc, this);
	}
}

Garden.options = {
	petalCount: {    // 花盘数量
		min: 8,
		max: 15
	},
	petalStretch: { // 拉伸
		min: 0.1,
		max: 3
	},
	growFactor: {  // 因素
		min: 0.1,
		max: 1
	},
	bloomRadius: {
		min: 8,
		max: 10
	},
	growSpeed: 1000 / 60,  // 花的生长速度;
	color: {
		rmin: 128,
		rmax: 255,
		gmin: 0,
		gmax: 128,
		bmin: 0,
		bmax: 128,
		opacity: 0.1
	}
};
Garden.random = function (min, max) {
	return Math.random() * (max - min) + min;
};
Garden.randomInt = function (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
Garden.circle = 2 * Math.PI;
Garden.degrad = function (angle) {
	return Garden.circle / 360 * angle;
};
Garden.raddeg = function (angle) {
	return angle / Garden.circle * 360;
};
Garden.rgba = function (r, g, b, a) {
	return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
};
Garden.randomrgba = function (rmin, rmax, gmin, gmax, bmin, bmax, a) {
	var r = Math.round(Garden.random(rmin, rmax));
	var g = Math.round(Garden.random(gmin, gmax));
	var b = Math.round(Garden.random(bmin, bmax));
	return Garden.rgba(r, g, b, a);
}
