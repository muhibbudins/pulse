var Pulse = {
	config: {
		type    : 'bars',
		element : '#player',
		parse   : '',
		nodes   : ''
	},
	isUndefined: function(param) {
		return typeof param == 'undefined';
	},
	init: function(type, element) {
		var self = this;
		
		if (!this.isUndefined(element)) {
			this.config.element = element;
		}

		this.config.type = type;
		this.stream();
		this.visualizer(function() {
			var bars = document.querySelectorAll('.visualizer_nodes');
			self.start(bars);
		});
	},
	stream: function() {
		var element      = this.config.element,
			streams      = '',
			parse        = element.substr(0,1),
			_self        = this;
		
		this.config.parse = parse;
	},
	start: function(visualizer) {
		var AudioContext = window.AudioContext || window.webkitAudioContext,
			context      = new AudioContext(),
			analyser     = context.createAnalyser();

		this.getElement(this.config.parse, function(res) {
			res.addEventListener("canplay", function() {
			    var source = context.createMediaElementSource(res);
			    source.connect(analyser);

				// console.log(analyser.fftSize); // 2048 by default
				// console.log(analyser.frequencyBinCount); // will give us 1024 data points
				// console.log(analyser.frequencyBinCount); // fftSize/2 = 32 data points

			    analyser.connect(context.destination);
				analyser.fftSize = 64;

				var frequencyData = new Uint8Array(analyser.frequencyBinCount);
				analyser.getByteFrequencyData(frequencyData);

				function update() {
				    requestAnimationFrame(update);

				    analyser.getByteFrequencyData(frequencyData);
				    // console.log(frequencyData)

					for (var i = 0; i < visualizer.length; i++) {
				        visualizer[i].style.height = frequencyData[i] + 'px';
					}
				};

				setTimeout(function() {
					update();
				}, 100)
			});
		})
	},
	getElement: function(parse, callback) {
		var streams = '',
			element = this.config.element.substring(1);

		if (parse == '#') {
			streams = document.getElementById(element);
		} else if(parse == '.') {
			streams = document.querySelector(element);
		} else {
			streams = document.getElementsByTagName(element);
		}

		callback(streams);
	},
	visualizer: function(callback) {
		var element  = '',
			bits     = 32, // Default bit point from FFTSize / 2
			wrapper  = document.createElement('div'),
			fragment = document.createDocumentFragment();

		wrapper.className = 'visualizer_wrapper';

		this.getElement(this.config.parse, function(res) {
			element = res;
		});

		for (var i = 1; i <= bits; i++) {
			var nodes = document.createElement('div');
			
			nodes.className = 'visualizer_nodes';
			nodes.setAttribute('data-id', i);
			fragment.appendChild(nodes);

			this.config.nodes = nodes;
		}
		
		wrapper.appendChild(fragment);
		element.parentNode.insertBefore(wrapper, element.nextSibling);

		callback('Visualizer ready!');
	}
}