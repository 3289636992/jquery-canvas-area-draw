(function( $ ){

  $.fn.canvasAreaDraw = function(options) {
    var points, activePoint, settings, $hidden, $reset, $canvas, ctx, image;
    var draw, mousedown, stopdrag, move, resize, reset;

    points = this.val().length ? this.val().split(',') : [];

    settings = $.extend({
      imageUrl: this.attr('data-image-url')
    }, options);

    $hidden = $('<input type="hidden">')
      .attr('name', this.attr("name"))
      .val(this.val());
    this.replaceWith($hidden);

    $reset = $('<button type="button" class="btn">Clear</button>');
    $canvas = $('<canvas>');
    ctx = $canvas[0].getContext('2d');

    image = new Image();
    resize = function() {
      $canvas.attr('height', image.height).attr('width', image.width);
    };
    $(image).load(resize);
    image.src = settings.imageUrl;
    if (image.loaded) resize();
    $canvas.css({background: 'url('+image.src+')'});

    $(document).ready( function() {
      $hidden.after($canvas, '<br>', $reset);
      $reset.click(reset);
      $canvas.bind('mousedown', mousedown);
      $canvas.bind('contextmenu', rightclick);
      $canvas.bind('mouseup', stopdrag);
    });

    reset = function() {
      points = [];
      draw();
    };

    move = function(e) {
      if(!e.offsetX) {
        e.offsetX = (e.pageX - $(e.target).offset().left);
        e.offsetY = (e.pageY - $(e.target).offset().top);
      }
      points[activePoint] = e.offsetX;
      points[activePoint+1] = e.offsetY;
      draw();
    };

    stopdrag = function() {
      $(this).unbind('mousemove');
      activePoint = null;
    };

    rightclick = function(e) {
      e.preventDefault();
      if(!e.offsetX) {
        e.offsetX = (e.pageX - $(e.target).offset().left);
        e.offsetY = (e.pageY - $(e.target).offset().top);
      }
      var x = e.offsetX, y = e.offsetY;
      for (var i = 0; i < points.length; i+=2) {
        dis = Math.sqrt(Math.pow(x - points[i], 2) + Math.pow(y - points[i+1], 2));
        if ( dis < 6 ) {
          points.splice(i, 2);
          draw();
          return false;
        }
      }
      return false;
    };

    mousedown = function(e) {
      var x, y, dis, lineDis, insertAt = points.length;

      if (e.which != 1) {
        return true;
      }

      e.preventDefault();
      if(!e.offsetX) {
        e.offsetX = (e.pageX - $(e.target).offset().left);
        e.offsetY = (e.pageY - $(e.target).offset().top);
      }
      x = e.offsetX; y = e.offsetY;

      for (var i = 0; i < points.length; i+=2) {
        dis = Math.sqrt(Math.pow(x - points[i], 2) + Math.pow(y - points[i+1], 2));
        if ( dis < 6 ) {
          activePoint = i;
          $(this).bind('mousemove', move);
          return false;
        }
      }

      for (var i = 0; i < points.length; i+=2) {
        if (i > 1) {
          lineDis = dotLineLength(
            x, y,
            points[i], points[i+1],
            points[i-2], points[i-1],
            true
          );
          if (lineDis < 6) {
            insertAt = i;
          }
        }
      }

      points.splice(insertAt, 0, x, y);
      activePoint = insertAt;
      $(this).bind('mousemove', move);

      draw();

      return false;
    };

    draw = function() {
      ctx.canvas.width = ctx.canvas.width;

      if (points.length < 2) {
        return false;
      }

      ctx.fillStyle = ctx.strokeStyle = 'rgb(200,30,30)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(points[0], points[1]);
      for (var i = 0; i < points.length; i+=2) {
        ctx.fillRect(points[i]-4, points[i+1]-4, 8, 8);
        if (points.length > 2 && i > 1) {
          ctx.lineTo(points[i], points[i+1]);
        }
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(200,0,0,0.4)';
      ctx.fill();

      record();
    };

    record = function() {
      $hidden.val(points.join(','));
    };

  };

  $(document).ready(function() {
    $('input.canvas-area[data-image-url]').canvasAreaDraw();
  });

  var dotLineLength = function(x, y, x0, y0, x1, y1, o) {
    function lineLength(x, y, x0, y0){
      return Math.sqrt((x -= x0) * x + (y -= y0) * y);
    }
    if(o && !(o = function(x, y, x0, y0, x1, y1){
      if(!(x1 - x0)) return {x: x0, y: y};
      else if(!(y1 - y0)) return {x: x, y: y0};
      var left, tg = -1 / ((y1 - y0) / (x1 - x0));
      return {x: left = (x1 * (x * tg - y + y0) + x0 * (x * - tg + y - y1)) / (tg * (x1 - x0) + y0 - y1), y: tg * left - tg * x + y};
    }(x, y, x0, y0, x1, y1), o.x >= Math.min(x0, x1) && o.x <= Math.max(x0, x1) && o.y >= Math.min(y0, y1) && o.y <= Math.max(y0, y1))){
      var l1 = lineLength(x, y, x0, y0), l2 = lineLength(x, y, x1, y1);
      return l1 > l2 ? l2 : l1;
    }
    else {
      var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
      return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
    }
  };
})( jQuery );
