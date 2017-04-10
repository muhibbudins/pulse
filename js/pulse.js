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
	 * @type    : Type of visualizer (default bars)
	 * @element : Source audio context in audio tag (Default #player)
	 * @visual  : Target for visualize bars
	 * @parse   : Element initialize for detection selector type
	 * @nodes   : Visualizer bars element
	 * @debug   : Start debuging get byte of frequency
	 * 
	 */
	config: {
		type    : 'bars',
		element : '#player',
		visual  : '#visualizer',
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
		 * Set default target visualize
		 */
		if (!self.isUndefined(params.target)) {
			self.config.visual = params.target;
		}

		/*
		 * Set default type
		 */
		self.config.type = params.type;

		/*
		 * Starting visualizer
		 */
		self.visualizer(function() {
			var bars = document.querySelectorAll('.visualizer__nodes');

			/*
			 * Start stream audio context
			 */
			self.stream(bars);
		});
	},

	/*
	 * Start stream Audio Context
	 */
	stream: function(visualizer) {
		var AudioContext = window.AudioContext || window.webkitAudioContext,
			context      = new AudioContext(),
			analyser     = context.createAnalyser(),
			element      = this.config.element,
			self         = this;

		self.getElement(element, function(res) {
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
	getElement: function(element, callback) {
		var streams = '',
			parse   = element.substring(0,1),
			element = element.substring(1);

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
		var visualizer = document.querySelector('.visualizer__wrapper');

		if (visualizer !== null) {
			callback('Visualizer ready!');
		} else {
			var byte     = 32, // Default byte point from FFTSize / 2
				wrapper  = document.createElement('div'),
				fragment = document.createDocumentFragment();

			wrapper.className = 'visualizer__wrapper';

			for (var i = 1; i <= byte; i++) {
				var nodes = document.createElement('div');
				
				nodes.className = 'visualizer__nodes nodes--' + i;
				nodes.setAttribute('data-id', i);
				fragment.appendChild(nodes);

				this.config.nodes = nodes;
			}
			
			wrapper.appendChild(fragment);
			this.getElement(this.config.visual, function(res) {
				res.appendChild(wrapper);
				callback('Visualizer ready!');
			});
		}
	}
}