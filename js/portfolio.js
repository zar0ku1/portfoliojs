/*
 * Portfolio.js v1.0
 * jQuery Plugin for Portfolio Gallery
 * http://portfoliojs.com
 *
 * Copyright (c) 2012 Abhinay Omkar (http://abhiomkar.in) @abhiomkar
 * Licensed under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Dependencies
 *  - jQuery: http://jquery.com
 *  - jQuery easing: http://gsgd.co.uk/sandbox/jquery/easing
 *  - jQuery touch swipe: http://labs.skinkers.com/touchSwipe
 *  - jQuery imagesLoaded: http://desandro.github.com/imagesloaded
 *  - jQuery scrollTo: http://flesler.blogspot.in/2007/10/jqueryscrollto.html
 *  - JS Spin: http://fgnass.github.com/spin.js

 * */

;(function($) {

    $.fn.radium_gallery_h = function(settings) {
        
    // default values 
    var defaults = {
        autoplay: false,
        firstLoadCount: 4,
        enableKeyboardNavigation: true,
        loop: false,
        easingMethod: 'easeOutQuint',
        height: '500px',
        width: '100%',
        lightbox: false,
        showArrows: true,
        logger: true,
        showThumbnails: false,
        showScrollbar: true
    };

    // overriding default values
    $.extend(this, defaults, settings);

    // Local variables
    var radium_gallery_h = this, gallery = this,
    currentViewingImage,
    totalLoaded = 0,
    offset_left = 6,
    imageLoadedCalled = false;

    // radium_gallery_h public methods
    $.extend(this, {
        version: "0.2",
        init: function() {

            radium_gallery_h.scrollToOptions={axis: 'x', easing: radium_gallery_h.easingMethod, offset: -4}

            // Responsive for Mobile
            if ($(window).width() <= 700) {
                // if mobile, reduce the gallery height to fit on screen
                // 200px fixed height is good enough?
                
                // override gallery height
                radium_gallery_h.height = '200px';
            }

            // CSS Base
            $(this).css({
                width: radium_gallery_h.width,
                'max-height': radium_gallery_h.height,
                'overflow-x': 'scroll',
                'overflow-y': 'hidden',
                'white-space': 'nowrap'
            });

            $(this).find('img').css({
                display: 'inline-block',
                'max-width': 'none',
                height: radium_gallery_h.height,
                width: 'auto'
            });


            $(this).find("img").css('display', 'none');
            // end

            // set all images element attribute loaded to false and hide, bcoz the
            // game is not yet started :)
            $(this).find("img").attr('loaded', 'false');
            // end

            // mark first & last images
            $(this).find("img").first().attr('first', 'true').css({'margin-left': '5px'});
            $(this).find("img").last().attr('last', 'true').css({'margin-right': '6px'});
            // end

            // spinner
            // show spinner while the images are being loaded...
            radium_gallery_h.spinner.show('100%');

            // load first 4 images
            radium_gallery_h.loadNextImages(radium_gallery_h.firstLoadCount);
            
            // First Image
            $(this).find("img").first().addClass('active');

            if (radium_gallery_h.lightbox) {
                $(gallery).find('img').not('.active').animate({opacity: '0.2'});
                $(gallery).find('img.active').animate({opacity: '1'});
                $(gallery).css({ 'overflow-x': 'hidden' });
            }
			
			 // Show scrollbar
			if (!radium_gallery_h.showScrollbar) {
			    $(gallery).css({ 'overflow-x': 'hidden' });
			}
			
            // Show Arrows
            if (radium_gallery_h.showArrows) {
                radium_gallery_h.navigation.show();
            }
			
			// Show Thumbnails
			if (radium_gallery_h.showThumbnails) {
			    radium_gallery_h.thumbnails.show();
			}
			
            // add a 5px space at the end
            $('.gallery-blank-space').css({
                position: 'absolute',
                width: '5px',
                height: radium_gallery_h.height,
            });

            // Events

            /* Swipe Left */
            $(this).swipe( {
                swipeLeft: function() {
                                radium_gallery_h.next();
                            },
                swipeRight: function() {
                                radium_gallery_h.prev();
                            }
            });

            $(this).find('img').on('movestart', function(e) {
                console_.log('movestart');
                if ((e.distX > e.distY && e.distX < -e.distY) ||
                    (e.distX < e.distY && e.distX > -e.distY)) {
                    e.preventDefault();
                        // TODO: touchstart? the gallery should follow the
                        // finger on touchstart
                } 
            });

            /* Click */
            $(this).find("img").click(function(event) {

                if ($(gallery).find('img.active')[0] === $(this)[0]) {
                    // If clicked on the current viewing image
                    // then scroll to next image
                    radium_gallery_h.next();

                }
                else {
                    // clicked on the next image or particular image, scroll to that image
                    radium_gallery_h.slideTo( $(this) );
                }
                
                console.log( $(this) );
            }); // click()

            // Gallery Scroll
            $(this).scroll(function() {
                    if ($(gallery).find('img').last().attr('loaded') === 'true') {
                        $('.gallery-blank-space').css({left: $(gallery).find('img').last().data('offset-left') + $(gallery).find('img').last().width() + 'px'});
                    }

                    // if (gallery[0].offsetWidth + gallery.scrollLeft() >= gallery[0].scrollWidth) // scroll end condition
                    
                    // scroll amount is greater than 60%
                    if ((gallery[0].offsetWidth + gallery.scrollLeft())*100 / gallery[0].scrollWidth > 60) {

                        if (totalLoaded < $(gallery).find('img').length) {
                            console_.log('scroll(): loading some more images');
                            radium_gallery_h.loadNextImages(6);
                            // $(gallery).find('img[loaded=true]').last().addClass('ctive');

                        }
                    }
            });

            // Window Resize
            $(window).resize(function() {
                if ($(window).width() <= 700 && $(gallery).find('img').first().height()!==200) {
                    $(gallery).css({height: '200px'});
                    $(gallery).find('img').css({height: '200px'});
                    $(gallery).find('.gallery-arrow-left, .gallery-arrow-right').css({height: '200px'});
                }
                else if ($(window).width() > 700 && $(gallery).find('img').first().height()===200) {
                    $(gallery).css({height: radium_gallery_h.height});
                    $(gallery).find('img').css({height: radium_gallery_h.height});
                    $(gallery).find('.gallery-arrow-left, .gallery-arrow-right').css({height: radium_gallery_h.height});
                }
            });

        }, // init

        next: function() {

            var cur_img = $(gallery).find('img.active'),
                next_img = $(gallery).find('img.active').next();

            if($(cur_img).attr('last') === 'true') {

                // if on last image and if loop is on 
                if(radium_gallery_h.loop) {
                    // go to first image 
                    console_.log('last', 'loop: on');

                    $(gallery).scrollTo(0, 500, radium_gallery_h.scrollToOptions);

                    $(gallery).find('img').removeClass('active').first().addClass('active');

                    if (radium_gallery_h.lightbox) {
                        $(gallery).find('img').not('.active').animate({opacity: '0.2'});
                        $(gallery).find('img.active').animate({opacity: '1'});
                    }
                }
                else {
                    console_.log('last', 'loop: off');
                }
            }

            // if next image is already loaded
            else if ($(next_img).attr('loaded') === 'true') {
                // go to next image
                $(gallery).scrollTo(next_img, 600, radium_gallery_h.scrollToOptions);

                $(gallery).find('img').removeClass('active');
                $(next_img).addClass('active');

                if (radium_gallery_h.lightbox) {
                    $(gallery).find('img').not('.active').animate({opacity: '0.2'});
                    $(gallery).find('img.active').animate({opacity: '1'});
                }

            }
            // if next image is not yet loaded
            else if ($(next_img).attr('loaded') === 'false') {
                // show the spinner and prepare to load next images
                console_.log('next images are being loaded...');
            }

            /*
            if (gallery.offsetWidth + gallery.scrollLeft >= gallery.scrollWidth) {
                console_.log('scrollEnd');
                var spinner_target = $(currentViewingImage).after('<span class="spinner-container"></span>');
                $(gallery).scrollTo($(currentViewingImage).data("offset-left") + 100, 500, {axis: 'x'});
                radium_gallery_h.spinner(spinner_target);
            }
            */
            console_.log('next: current viewing image', $(gallery).find('img.active'));
        },

        prev: function() {
            var cur_img = $(gallery).find('img.active'),
                prev_img = $(gallery).find('img.active').prev();

            if($(cur_img).attr('first') === 'true') {
                // If on first Image stay there, do not scroll
            }
            else if (prev_img){
                // go to prev image
                $(gallery).scrollTo(prev_img, 500, radium_gallery_h.scrollToOptions);

                $(gallery).find('img').removeClass('active');
                $(prev_img).addClass('active');

                if (radium_gallery_h.lightbox) {
                    $(gallery).find('img').not('.active').animate({opacity: '0.2'});
                    $(gallery).find('img.active').animate({opacity: '1'});
                }
            }

            console_.log('prev: current viewing image', $(gallery).find('img.active'));
        },

        slideTo: function(img) {

            $(gallery).scrollTo(img, 500, radium_gallery_h.scrollToOptions);

            $(gallery).find('img').removeClass('active');
            $(img).addClass('active');

            if (radium_gallery_h.lightbox) {
                $(gallery).find('img').not('.active').animate({opacity: '0.2'});
                $(gallery).find('img.active').animate({opacity: '1'});
            }

        },

        spinner: {
            remove: function() {
                $(gallery).find('.spinner-container').remove();
            },

            show: function(width) {
                // Spinner
                radium_gallery_h.spinner.remove();

                var lastImg = $(gallery).find('img[loaded=true]').last();
                $(gallery).append('<span class="spinner-container"></span>');
                $(gallery).find('.spinner-container').css({
                    display: 'inline-block',
                    height: radium_gallery_h.height,
                    width: width,
                    'vertical-align': 'top'
                });

                var opts = {
                    lines: 17, // The number of lines to draw
                    length: 4, // The length of each line
                    width: 2, // The line thickness
                    radius: 5, // The radius of the inner circle
                    corners: 1, // Corner roundness (0..1)
                    rotate: 0, // The rotation offset
                    color: '#000', // #rgb or #rrggbb
                    speed: 1.5, // Rounds per second
                    trail: 72, // Afterglow percentage
                    shadow: false, // Whether to render a shadow
                    hwaccel: false, // Whether to use hardware acceleration
                    className: 'spinner', // The CSS class to assign to the spinner
                    zIndex: 2e9, // The z-index (defaults to 2000000000)
                    top: parseInt(radium_gallery_h.height)/2, // Top position relative to parent in px
                    left: 'auto' // Left position relative to parent in px
                };

                var spinner = new Spinner(opts).spin($(gallery).find('.spinner-container')[0]);
            }
        },

        loadNextImages: function(count) {
                // console_.log('loading...', totalLoaded, count, $(gallery).find(".photo img").slice(totalLoaded, totalLoaded + count));

            if (!imageLoadedCalled) {
                var nextImages;
                
                // load first few pictures - gallery init
                nextImages = $(gallery).find("img[loaded=false]").slice(0, count);
                $(nextImages).each(function(index) {
                    // current img element
                    var cur_img = this;

                    cur_img.src = $(cur_img).data('src');
                    $(cur_img).attr('loaded', 'loading');
                }); // each()

                // .imagesLoaded callback on images having src attribute but not loaded yet
                // on otherwords, filter only loading images
                $(nextImages).imagesLoaded(function($img_loaded){

                    console_.log('images loaded:');
                    console_.log($img_loaded);
                    $img_loaded.each(function(index) {
                        var img = this;

                        // Inorder to fadeIn effect to work, make the new
                        // img element invisible by 'display: none'
                        $(img).css({display: 'none'});
                        radium_gallery_h.spinner.remove();
                        $(img).fadeIn('slow');

                        img_width = $(img).width();

                        totalLoaded += 1;

                        $(img).data('width', img_width);
                        $(img).attr('loaded', 'true');

                    }); // each()

                    radium_gallery_h.spinner.show('100px');
                    imageLoadedCalled = false;

                    // loaded all images
                    if (totalLoaded === $(gallery).find('img').length) {
                        radium_gallery_h.spinner.remove();
                    }
                    else if (gallery[0].offsetWidth === gallery[0].scrollWidth) {
                        // if the first loaded images doesn't fill the
                        // offsetWidth of gallery then load some more images
                        radium_gallery_h.loadNextImages(6);
                    }

                }); // imagesLoaded()

                imageLoadedCalled = true;
            } // if(!imageLoadedCalled)

        }, // loadNextImages
        navigation: {
            show: function() {
                if (radium_gallery_h.navigation.created) {
                    // arrows already exists, do not create again
                    $('.gallery-arrow-left, .gallery-arrow-right').show();
                    $('.gallery-arrow-left, .gallery-arrow-right').delay(6000).fadeOut();
                }
                else {
                    // create arrows
                    $(gallery).before('<span class="gallery-arrow-left"></span>').after('<span class="gallery-arrow-right"></span>');
                    $(gallery).prev('.gallery-arrow-left').css({
                        position: 'absolute',
                        left: '8px',
                        height: radium_gallery_h.height,
                        width: '50px',
                        'z-index': '9999',
                        opacity: '0.5'
                    });
                    $(gallery).next('.gallery-arrow-right').css({
                        position: 'absolute',
                        right: '0',
                        top: $(gallery).position().top,
                        height: radium_gallery_h.height,
                        width: '50px',
                        'z-index': '9999',
                        opacity: '0.5'
                    });

                    $(gallery).prev('.gallery-arrow-left').click(function(e) {
                        radium_gallery_h.prev();
                    });

                    $(gallery).next('.gallery-arrow-right').click(function(e) {
                        radium_gallery_h.next();
                    });

                    $('.gallery-arrow-left, .gallery-arrow-right').hover(function(){
                        // Mouse In
                        $(this).css({ 'opacity': '1' });
                    }, 
                    function() {
                        // Mouse Out
                        $(this).css({ 'opacity': '0.5' });
                    }); // hover()

                    $(gallery).mousemove(function(){
                        radium_gallery_h.navigation.show();
                    });

                    $('.gallery-arrow-left, .gallery-arrow-right').delay(6000).fadeOut();
                    radium_gallery_h.navigation.created = true;

                } // if.. else..
            }, // show() 

            hide: function() {
                $('.gallery-arrow-left, .gallery-arrow-right').fadeOut();
            }, // hide()
            created: false
        }, // navigation
        
        thumbnails: { 
        
       		show: function() {
        		
        		if ( radium_gallery_h.thumbnails.created ) {
        			
        		} else {
        			// create thumbnails
        			$('#gallery-wrapper').append('<div class="gallery-thumb-navigation"></div>');
        			var divContent = $(gallery).html();
        			$('.gallery-thumb-navigation').html( divContent );
        			
        			var whitelist = ['src', 'alt', 'data-index'];
        			
 					$('.gallery-thumb-navigation img').each( function( index ) { 
 						
 						var url = $(this).data('src');
 						
 						$(this).attr({ 'src': url });
 						
 						//strip all other attributes
 						var attributes = this.attributes;
					    var i = attributes.length;
					    while( i-- ) {
					        var attr = attributes[i];
					        if( $.inArray(attr.name,whitelist) == -1 )
					            this.removeAttributeNode(attr);
					    }
					    //adjust width
 						$(this).css({ cursor: 'pointer'  });   
 						
 					});
 					
 					$('.gallery-thumb-navigation .spinner-container').remove();
 					
        			radium_gallery_h.thumbnails.created = true;	
        			
        		} // if.. else..
        		
        		
        		 /* Click */
	            $(".gallery-thumb-navigation img").click(function(event) {
					
					var index = $(this).data('index');
						
	                var image_match =  $(gallery).find("[data-index='" + index + "']");
	
                     if ( $(gallery).find('img.active')[0] === image_match[0]) {
                        // If clicked on the current viewing image
                        // then scroll to next image
                        radium_gallery_h.next();
    
                    } else {
                    
                        // clicked on the next image or particular image, scroll to that image
                        radium_gallery_h.slideTo( image_match );
                    }
                    
                    console_.log( 'scroll via thumbnail' );
	                
	            }); // click()
        		            		
        	}, // show() 

            hide: function() {
                $('.gallery-thumb-nav').fadeOut();
            }, // hide()
            created: false	
        
        } //thumbnails
    }); // extend()

    // keyboard navigation
    if (this.enableKeyboardNavigation) {
            $(document).keydown(function(e) {
                    var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
                    switch(key) {
                            case 73: // 'i' key
                                        // go to first slide
                                    radium_gallery_h.slideTo($(gallery).find('img').first());
                                    break;
                            case 65: // 'a' key
                                        // go to last slide
                                    radium_gallery_h.slideTo($(gallery).find('img').last());
                                    break;

                            case 75: // 'k' key
                            case 37: // left arrow
                                    radium_gallery_h.navigation.hide();
                                    radium_gallery_h.prev();
                                    e.preventDefault();
                                    break;
                            // case 74: // 'j' key
                            case 39: // right arrow
                                    radium_gallery_h.navigation.hide();
                                    radium_gallery_h.next();
                                    e.preventDefault();
                                    break;
                    }
            });
    } // keyboard shortcuts

    // logger
    var console_ = {
        log: function() {
            if (this.active) {
                // var l = [];
                for (var i=0, len=arguments.length; i < len; i++) {
                    // l.push(arguments[i]);
                    console.log(arguments[i]);
                }
                // console.log(l.join(' '));
            }
        },
        active: radium_gallery_h.logger
    } // console_

    return this;
} // $.fn.radium_gallery_h

// TODO
// handle keyboard shortcuts in a smart way when multiple galleries are used

})(jQuery);
