import * as d3 from 'd3';

export class FullscreenManager {
  constructor(state) {
    this.state = state;
  }

  fullscreen(elem) {
    const attrs = this.state.getState();
    const el = d3.select(elem || attrs.container).node();

    // Set up fullscreen change event listener
    d3.select(document).on('fullscreenchange.' + attrs.id, function (d) {
      const fsElement = document.fullscreenElement || 
                       document.mozFullscreenElement || 
                       document.webkitFullscreenElement;
      
      if (fsElement == el) {
        // Entering fullscreen
        setTimeout(d => {
          attrs.svg.attr('height', window.innerHeight - 40);
        }, 500);
      } else {
        // Exiting fullscreen
        setTimeout(d => {
          attrs.svg.attr('height', attrs.svgHeight);
        }, 500);
      }
    });

    // Request fullscreen using appropriate method
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.mozRequestFullScreen) {
      el.mozRequestFullScreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }

  isFullscreen() {
    return !!(document.fullscreenElement || 
             document.mozFullScreenElement || 
             document.webkitFullscreenElement || 
             document.msFullscreenElement);
  }
}