/*
 * Pulse
 * HTML 5 Song Visualizer (Using Audio Context)
 *
 * Author : Muhibbudin Suretno
 * Date : April 9, 2017
 * License : MIT
 * 
 */
var Pulse = {

	/*
	 * All configuration start here
	 *
	 * @type : Type of visualizer (default bars)
	 * @element : Source audio context in audio tag (Default #player)
	 * @parse : Element initialize for detection selector type
	 * @nodes : Visualizer bars element
	 * @debug : Start debuging get byte of frequency
	 * 
	 */
	config: {
		type    : 'bars',
		element : '#player',
		parse   : '',
		nodes   : '',
		debug   : false
	},

	/*
	 * isUndefined() function will return true if paramter realy undefined
	 */
	isUndefined: function(param) {
		return typeof param == 'undefined';
	},

	/*
	 * Initialize Pulse class and throw parameter from user
	 */
	init: function(params) {
		var self = this;
		
		/*
		 * Set default element source
		 */
		if (!self.isUndefined(params.source)) {
			self.config.element = params.source;
		}
		
		/*
		 * Set default debug type
		 */
		if (!self.isUndefined(params.debug)) {
			self.config.debug = params.debug;
		}

		/*
		 * Set default type
		 */
		self.config.type = params.type;

		/*
		 * Start detection selector type of element source
		 */
		self.detect();

		/*
		 * Starting visualizer
		 */
		self.visualizer(function() {
			var bars = document.querySelectorAll('.visualizer_nodes');

			/*
			 * Start stream audio context
			 */
			self.stream(bars);
		});
	},

	/*
	 * Returning type of selector
	 */
	detect: function() {
		var element      = this.config.element,
			parse        = element.substr(0,1);
		
		return this.config.parse = parse;
	},

	/*
	 * Start stream Audio Context
	 */
	stream: function(visualizer) {
		var AudioContext = window.AudioContext || window.webkitAudioContext,
			context      = new AudioContext(),
			analyser     = context.createAnalyser(),
			self         = this;

		self.getElement(self.config.parse, function(res) {
			res.addEventListener("canplay", function() {
			    if (self.isUndefined(context.mediaElement)) {
			    	var source = context.createMediaElementSource(res);
			    } else {
			    	var source = context;
			    }
			    
			    source.connect(analyser);

				// console.log(analyser.fftSize);
				// console.log(analyser.frequencyBinCount);

			    analyser.connect(context.destination);
				analyser.fftSize = 64;

				var frequencyData = new Uint8Array(analyser.frequencyBinCount);
				analyser.getByteFrequencyData(frequencyData);

				function update() {
					/*
					 * Requesting animation frame
					 */
				    requestAnimationFrame(update);

				    /*
				     * Getting frequenxy byte from analyser
				     */
				    analyser.getByteFrequencyData(frequencyData);

				    /*
				     * Starting debuging
				     */
				    if (self.config.debug) {
				    	console.log(frequencyData)
				    }

				    /*
				     * Changing element style
				     */
					for (var i = 0; i < visualizer.length; i++) {
				        visualizer[i].style.height = frequencyData[i] + 'px';
					}
				};

				/*
				 * Timeout update for 1 ms
				 */
				setTimeout(function() {
					update();
				}, 100)
			});
		})
	},

	/*
	 * Getting element from parse
	 */
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

	/*
	 * Starting visualizer initialize
	 */
	visualizer: function(callback) {
		var visualizer = document.querySelector('.visualizer_wrapper');

		if (visualizer !== null) {
			callback('Visualizer ready!');
		} else {
			var element  = '',
				byte     = 32, // Default byte point from FFTSize / 2
				wrapper  = document.createElement('div'),
				fragment = document.createDocumentFragment();

			wrapper.className = 'visualizer_wrapper';

			this.getElement(this.config.parse, function(res) {
				element = res;
			});

			for (var i = 1; i <= byte; i++) {
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
}