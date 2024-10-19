class Scramble {
	constructor() {
		this.moves = ['U', 'F', 'R', 'B', 'L', 'D'];
		this.length = 20;
		this.element = document.getElementById("scramble-text");
		this.element.innerHTML = this.generate();		
		this.generate();
	}

	generate() {
		this.scramble = [];
		for (let i = 0; i < this.length; i++) {
			this.move = this.lastMove;
			while(this.move == this.lastMove)
				this.move = this.moves[Math.floor(Math.random() * this.moves.length)];
		    this.scramble.push(this.move);
		    if (Math.random() >= 0.5) {
		    	if (Math.random() >= 0.5) {
		    		this.scramble[i] += "'";
		    	} else {
		    		this.scramble[i] += "2";
		    	}
		    }
		    this.lastMove = this.move;
		}
		return this.scramble.join(" ");
	}
}


class Settings {
	constructor() {
		this.clearElement = document.getElementById("clear-button");
		this.exportElement = document.getElementById("export-button");
		this.fontSelectElement = document.getElementById("font-select");
		this.load();
		this.handleInput();
	}

	handleInput() {
		this.clearElement.onclick = () => this.clear();
		this.exportElement.onclick = () => solves.export();
		this.fontSelectElement.addEventListener("change", function() {
		    document.documentElement.style.setProperty("--font-family", this.value); 
		});
	}

	clear() {
		localStorage.clear();
		location.reload();
	}

	load() {
		this.json = localStorage.getItem("settings");
		this.json = this.json ? JSON.parse(this.json) : [];
	}
}


class Solve {
	constructor(time, scramble, date) {
		this.time = time;
		this.scramble = scramble;
		this.date = date;
	}
}


class Solves {
	constructor() {
		this.element = document.getElementById("solves-list");
		this.load();
	}

	load() {
		this.json = this.json ? JSON.parse(this.json) : [];
		this.jsonHtml = this.json.map(solve => `<li>${solve.time}</li>`).join('');
		this.element.innerHTML = this.jsonHtml;
	}

	add(solve) {
		this.json.push(solve);	
		stats.update(solve.time);
		this.element.innerHTML += "<li>" + solve.time + "</li>";
	}

	export() {
   		const blob = new Blob([JSON.stringify(this.json)], { type: "application/json" });
    	const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = timer.getDate(new Date());
        link.click();		
	}
}


class Stats {
	constructor() {
		this.element = document.getElementById("pb-text");
		this.load();
	}

	load() {
		this.stats = localStorage.getItem("stats");
		this.stats = this.stats ? JSON.parse(this.stats) : {};
		if (!this.stats.pb == undefined) {
			this.element.innerHTML = this.stats.pb;
		}
	}

	update(time) {
		if (this.stats.pb == undefined || time < this.stats.pb) {
			this.stats.pb = time;
			this.element.innerHTML = this.stats.pb;
		}
	}
}


class Timer {
	constructor() {
		this.decimals = 2;		
		this.element = document.getElementById("timer-input");
		this.pressed = false;
		this.running = false;
		this.handleInput();
	}

	handleInput() {
		window.addEventListener("keyup", (event) => {
			if (event.code === "Space") {
				this.element.style.color = "white";	
				if (!this.pressed && !this.running) {
					this.start();
				} else {
				this.pressed = false;
				}
			}
		});
 
		window.addEventListener("keydown", (event) => {
			if (event.code === "Space") {
				if (this.running) {
					this.stop();
				}
				this.element.style.color = "green";	
			}
		});		
	}

	start() {
		this.startTime = Date.now();
		this.running = true;
		this.interval = setInterval(() => this.updateTime(), 1); 
	}

	updateTime() {
		this.element.innerHTML = ((Date.now() - this.startTime) / 1000).toFixed(2);
	}

	getDate(date) {
		const year = date.getFullYear(); 
		const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
		const day = date.getDate().toString().padStart(2, '0'); 
		return `${day}-${month}-${year}`; 
	}

	stop() {
		this.solveTime = ((Date.now() - this.startTime) / 1000);
		this.solveTime = Math.floor(this.solveTime * 100) / 100;
		this.pressed = true;
		this.running = false;
		this.element.innerHTML = this.solveTime;
		solves.add(new Solve(this.solveTime, scramble.element.innerHTML, this.getDate(new Date())));		
		scramble.element.innerHTML = scramble.generate();
		clearInterval(this.interval);		
	}
}


class Main {
	constructor() {
		window.solves = new Solves();
		window.stats = new Stats();
		window.timer = new Timer();
		window.scramble = new Scramble();
		window.settings = new Settings();
	}
}


document.addEventListener("DOMContentLoaded", () => {
	const main = new Main();
});

window.addEventListener("beforeunload", () => {
    localStorage.setItem("solves", JSON.stringify(solves.solves));
    localStorage.setItem("stats", JSON.stringify(stats.stats));
});