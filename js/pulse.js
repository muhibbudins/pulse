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
	 * @player  : Source audio context in audio tag (Default #player)
	 * @target  : Target for visualize bars
	 * @parse   : Element initialize for detection selector type
	 * @nodes   : Visualizer bars player
	 * @debug   : Start debuging get byte of frequency
	 * 
	 */
	config: {
		type    : 'bars',
		player  : '#player',
		source  : '#source',
		target  : '#visualizer',
		parse   : '',
		nodes   : '',
		debug   : false,
		song    : {}
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
		 * Set default type
		 */
		if (!self.isUndefined(params.type)) {
			self.config.type = params.type;
		}
		
		/*
		 * Set default player player
		 */
		if (!self.isUndefined(params.player)) {
			self.config.player = params.player;
		}
		
		/*
		 * Set default element source
		 */
		if (!self.isUndefined(params.source)) {
			self.config.source = params.source;
		}
		
		/*
		 * Set default target visualize
		 */
		if (!self.isUndefined(params.target)) {
			self.config.target = params.target;
		}
		
		/*
		 * Set default debug type
		 */
		if (!self.isUndefined(params.debug)) {
			self.config.debug = params.debug;
		}

		self.getElement(self.config.source, function(source) {
		    source.onchange = function(){
		        var files = this.files,
		            file  = URL.createObjectURL(files[0]);
		        
		        self.getElement(self.config.player, function(audio) {	        	
					var song     = {};

			        audio.src = file;
			        audio.play();

					/*
					 * Starting visualizer
					 */
					self.visualizer(function() {
						var bars = document.querySelectorAll('.pulse__nodes');

						/*
						 * Start stream audio context
						 */
						self.stream(bars);
					});

					parse_audio_metadata(files[0], function(meta) {
						document.querySelector('.pulse__song--title').innerHTML = meta.title;
						document.querySelector('.pulse__song--artist').innerHTML = meta.artist;

						if (!self.isUndefined(meta.picture)) {
							self.blobToDataURL(meta.picture, function(res) {
								document.querySelector('.pulse__song--image').innerHTML = '<img src="'+ res +'" alt="Dummy Image" />';
							})
						} else {
							document.querySelector('.pulse__song--image').innerHTML = '<img src="img/120x120.png" alt="Dummy Image" />';
						}
					}, function(err) {
						console.warn(err);
					});


			        self.config.song = song;
		        })
		    };
		})
	},

	/*
	 * Converting array buffer to base64 string
	 */
	blobToDataURL(blob, callback) {
	    var fr = new FileReader();
	    fr.onload = function(e) {
	    	callback(e.target.result);
	    }
	    fr.readAsDataURL(blob);
	},

	/*
	 * Start stream Audio Context
	 */
	stream: function(visualizer) {
		var AudioContext = window.AudioContext || window.webkitAudioContext,
			context      = new AudioContext(),
			analyser     = context.createAnalyser(),
			element      = this.config.player,
			self         = this;

		self.getElement(element, function(res) {
			res.addEventListener("canplay", function() {
			    if (self.isUndefined(context.mediaElement)) {
			    	var source = context.createMediaElementSource(res);
			    } else {
			    	var source = context;
			    }
			    
			    source.connect(analyser);

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
		var visualizer = document.querySelector('.pulse__wrapper');

		if (visualizer !== null) {
			callback('Visualizer ready!');
		} else {
			var byte         = 32, // Default byte point from FFTSize / 2
				wrapper      = document.createElement('div'),
				wrapperSong  = document.createElement('div'),
				songImage    = document.createElement('div'),
				songTitle    = document.createElement('div'),
				songArtist   = document.createElement('div'),
				wrapperInner = document.createElement('div'),
				fragment     = document.createDocumentFragment(),

				song         = this.config.song;

			wrapper.className     = 'pulse__wrapper';
			
			wrapperSong.className = 'pulse__song';
			songImage.className   = 'pulse__song--image';
			songTitle.className   = 'pulse__song--title';
			songArtist.className  = 'pulse__song--artist';
			
			songImage.innerHTML   = '';
			songTitle.innerHTML   = '';
			songArtist.innerHTML  = '';

			wrapperSong.appendChild(songImage);
			wrapperSong.appendChild(songTitle);
			wrapperSong.appendChild(songArtist);

			wrapperInner.className = 'pulse__inner';

			for (var i = 1; i <= byte; i++) {
				var nodes = document.createElement('div');
				
				nodes.className = 'pulse__nodes pulse__nodes--' + i;
				nodes.setAttribute('data-id', i);
				fragment.appendChild(nodes);

				this.config.nodes = nodes;
			}
			
			wrapperInner.appendChild(fragment);

			wrapper.appendChild(wrapperSong);
			wrapper.appendChild(wrapperInner);

			this.getElement(this.config.target, function(res) {
				res.appendChild(wrapper);
				callback('Visualizer ready!');
			});
		}
	}
}