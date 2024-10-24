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
		this.bg1ColorElement = document.getElementById("bg-color-1");
		this.bg2ColorElement = document.getElementById("bg-color-2");
		this.clearElement = document.getElementById("clear-button");
		this.exportElement = document.getElementById("export-button");
		this.fontColorElement = document.getElementById("font-color");
		this.fontSelectElement = document.getElementById("font-select");
		this.defaultSettingsElement = document.getElementById("default-settings");
		this.load();
		this.handleInput();
	}

	handleInput() {
		this.clearElement.addEventListener("click", () => {
			if (!confirm("Delete all solves?")) {
				return;
			}
			solves.json = [];
			stats.json = {};
			location.reload();
		});	
		this.exportElement.addEventListener("click", () => {
			solves.export();
		});		
		this.bg1ColorElement.addEventListener("change", () => {
			this.json.bgColor1 = this.bg1ColorElement.value;
		    document.documentElement.style.setProperty("--bg-color-1", this.json.bgColor1);  
		});
		this.bg2ColorElement.addEventListener("change", () => {
			this.json.bgColor2 = this.bg2ColorElement.value;
		    document.documentElement.style.setProperty("--bg-color-2", this.json.bgColor2);  
		});		
		this.fontColorElement.addEventListener("change", () => {
			this.json.fontColor = this.fontColorElement.value;
		    document.documentElement.style.setProperty("--font-color", this.fontColorElement.value);  
		});				
		this.fontSelectElement.addEventListener("change", function() {
		    document.documentElement.style.setProperty("--font-family", this.value); 
		});
		this.defaultSettingsElement.addEventListener("click", () => {
			this.json = {
				bgColor1: "#111111", 
				bgColor2: "#222222",
				fontColor: "#ffffff", 
				fontFamily: "Verdana" 
			};	
			location.reload();	
		});		
	}

	load() {
		this.json = localStorage.getItem("settings");
		this.json = this.json ? JSON.parse(this.json) : {
			bgColor1: "#111111", 
			bgColor2: "#222222",
			fontColor: "#ffffff", 
			fontFamily: "Verdana" 
		}; 
		document.documentElement.style.setProperty("--bg-color-1", this.json.bgColor1);  
		document.documentElement.style.setProperty("--bg-color-2", this.json.bgColor2);  
		document.documentElement.style.setProperty("--font-color", this.json.fontColor); 
		document.documentElement.style.setProperty("--font-family", this.json.fontFamily); 
		this.bg1ColorElement.value = this.json.bgColor1;
		this.bg2ColorElement.value = this.json.bgColor2;
		this.fontColorElement.value = this.json.fontColor;
		this.fontSelectElement.value = this.json.fontFamily;
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
		this.json = localStorage.getItem("solves");		
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
		link.download = main.getDate(new Date());
        link.click();		
	}
}


class Stats {
	constructor() {
		this.singlePbElement = document.getElementById("single-pb-text");
		this.avgPbElement = document.getElementById("avg-pb-text");
		this.avgElement = document.getElementById("avg-text");
		this.solvesCountElement = document.getElementById("solves-count-text");
		this.load();
	}

	load() {
		this.json = localStorage.getItem("stats");		
		this.json = this.json ? JSON.parse(this.json) : {};	
		this.singlePbElement.innerHTML = this.json.pb === undefined ? "-" : this.json.pb;
		//this.json.avgPb = this.json.avgPb === undefined ? 9999 : this.json.avgPb;
		//this.avgPbElement.innerHTML = this.json.avgPb;
		console.log(this.json);
		this.updateAvg();
	}

	updateSinglePb(time) {
		if (this.json.pb == undefined || time < this.json.pb || !this.json.pb) {
			this.json.pb = time;
			this.singlePbElement.innerHTML = this.json.pb;	
			localStorage.setItem("stats", JSON.stringify(this.json));	
		}			
	}

	updateAvg(avgLength) {
		let avg = solves.json.map(item => item.time);
		this.solvesCountElement.innerHTML = avg.length;
		if (avg.length > 0) {
			avg = Math.floor(avg.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / avg.length * 100) / 100;
			this.avgElement.innerHTML = avg.toFixed(2);
			this.avgPbElement.innerHTML = this.json.avgPb;
			if (avg < this.json.avgPb || this.json.avgPb == undefined) {
				this.json.avgPb = avg;
				this.avgPbElement.innerHTML = this.json.avgPb;
			}
		} else {
			this.avgElement.innerHTML = "-";
			this.avgPbElement.innerHTML = "-";
		}
	}

	update(time) {
		this.updateSinglePb(time);
		this.updateAvg();
		let timeDiffHtml = (Math.floor((time - this.lastTime) * 100) / 100).toFixed(2);	
		timeDiffHtml = timeDiffHtml > 0 ? `+${timeDiffHtml}` : timeDiffHtml.toString();
		timer.timeDiffElement.innerHTML = timeDiffHtml;			
		if (time < this.lastTime) {
			timer.timeDiffElement.style.color = "green";
		} else if (time > this.lastTime) {
			timer.timeDiffElement.style.color = "red";
		} else {
			this.lastTime = time;
			timer.timeDiffElement.innerHTML = "-";	
		}
		this.lastTime = time;	
	}

}


class Timer {
	constructor() {
		this.decimals = 2;		
		this.timerElement = document.getElementById("timer-input");
		this.timeDiffElement = document.getElementById("time-diff");
		this.pressed = false;
		this.running = false;
		this.handleInput();
	}

	handleInput() {
		window.addEventListener("keyup", (event) => {
			if (event.code === "Space") {
				this.timerElement.style.color = settings.json.fontColor;	
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
				this.timerElement.style.color = "green";	
			}
		});		
	}

	start() {
		this.startTime = Date.now();
		this.running = true;
		this.interval = setInterval(() => this.update(), 1); 
	}

	update() {
		this.timerElement.innerHTML = ((Date.now() - this.startTime) / 1000).toFixed(2);
	}

	stop() {
		this.solveTime = (Math.floor(((Date.now() - this.startTime) / 1000) * 100) / 100);
		this.pressed = true;
		this.running = false;
		this.timerElement.innerHTML = this.solveTime;
		solves.add(new Solve(this.solveTime, scramble.element.innerHTML, main.getDate(new Date())));		
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

	getDate(date) {
		const year = date.getFullYear(); 
		const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
		const day = date.getDate().toString().padStart(2, '0'); 
		return `${day}-${month}-${year}`; 
	}

}


document.addEventListener("DOMContentLoaded", () => {
	window.main = new Main();
});

window.addEventListener("beforeunload", () => {
	localStorage.setItem("settings", JSON.stringify(settings.json));
    localStorage.setItem("solves", JSON.stringify(solves.json));
    localStorage.setItem("stats", JSON.stringify(stats.json));
});