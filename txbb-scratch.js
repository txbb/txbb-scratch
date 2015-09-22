/**
 * Txbb.Scratch 组件
 *
 * 同学帮帮移动端刮刮卡组件
 * 0.1.1
 * by zhangyang
 */
(function(factory) {
    'use strict';

    if (typeof define !== 'undefined' && define.amd) {
        define('Txbb/Scratch', function() {
            return factory.call(null);
        });
    } else {
        if (!window.Txbb) window.Txbb = {};
        window.Txbb.Scratch = factory.call(null);
    }

}(function() {
    'use strict';

    // helps
    function q(s) {return document.querySelector(s);}
    function elem(nodeType, attrs) {
        var node = document.createElement(nodeType);
        if (attrs) {
            for (var k in attrs) {
                node[k] = attrs[k];
            }
        }
        return node;
    }
    function extend(origin, extendObj) {
        var back = {};
        if (origin) {
            for (var k1 in origin) {
                back[k1] = origin[k1];
            }
        }
        if (extendObj) {
            for (var k2 in extendObj) {
                back[k2] = extendObj[k2];
            }
        }
        return back;
    }
    Element.prototype._css = function (attrs) {
        if (!this) return this;
        if (attrs) {
            for (var k in attrs) {
                if (this.style.hasOwnProperty(k))
                    this.style[k] = attrs[k];
            }
        }
        return this;
    };
    Element.prototype._attr = function (attrs) {
        if (!this) return this;

        if (attrs && typeof attrs === 'object') {
            for (var k in attrs) {
                this.setAttribute(k, attrs[k]);
            }
        }

        if (attrs && typeof attrs === 'string') return this.getAttribute(attrs);

        return this;
    };
    Element.prototype._remove = function() {
        this.parentNode.removeChild(this);
    };
    Element.prototype._show = function() {
        this.style.display = 'block';
    };
    Element.prototype._hide = function() {
        this.style.display = 'none';
    };
    Element.prototype._addEvent = function(eventNames, handler) {
        var events = eventNames.split(/\s+/);
        var _this = this;
        events.forEach(function(evt) {
            _this.addEventListener(evt, handler, false);
        });
        return _this;
    };
    Element.prototype._offset = function() {
        var offset = {
            left: 0,
            top: 0
        };
        var dom = this;
        while (dom !== document.body) {
            offset.left += dom.offsetLeft;
            offset.top += dom.offsetTop;
            dom = dom.offsetParent; // 0.1.1 修复 _offset 方法错误
        }
        return offset;
    };

    /*-------------- 华丽丽的分割线 ---------------*/

    // 是否支持 canvas
    var supportCanvas = elem('canvas').getContext;
    // 实例化后的 Scratch 实例缓存
    var cache = {};
    // 实例序号
    var id = 0;
    // 类定义
    function Scratch(elem, options, id) {
        this.elem = elem;
        this.id = id;
        this.options = options;

        this.elem._attr({'scratch' : id});

        this._render();
    }
    // 实例方法定义
    Scratch.prototype = {
        _render : function() {
            this.elem._css({
                backgroundColor : this.options.bg,
                position: 'relative'
            });

            this._createCanvas();
            this.reset();
            this._createMiddle();
            this._eventBind();
        },

        _createCanvas: function() {
            var canvas = elem('canvas');
            canvas.width = this.elem.offsetWidth;
            canvas.height = this.elem.offsetHeight;
            canvas._css({
                position: 'absolute',
                zIndex: 2,
                top: 0,
                left: 0
            });
            this.elem.appendChild(canvas);
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.offset = canvas._offset();
            console.debug(this.offset);
        },

        _createMiddle: function() {
            var div = elem('div');
            div._css({
                position: 'absolute',
                zIndex: 1,
                color: '#333',
                textAlign: 'center',
                lineHeight: this.height + 'px',
                height: this.height + 'px',
                width: this.width + 'px',
                fontSize: '20px',
                top: 0,
                left: 0
            }).innerHTML = this.options.middle;
            this.elem.appendChild(div);
        },

        _eventBind: function() {
            var _this = this;
            _this.canvas._addEvent('touchstart', function(e) {
                var x = Math.floor(e.touches[0].pageX - _this.offset.left);
                var y = Math.floor(e.touches[0].pageY - _this.offset.top);

                _this.ctx.globalCompositeOperation = 'destination-out';
                _this.ctx.lineJoin = 'round';
                _this.ctx.lineCap = 'round';
                _this.ctx.strokeStyle = _this.options.color;
                _this.ctx.lineWidth = _this.options.size;

                //draw single dot in case of a click without a move
                _this.ctx.beginPath();
                _this.ctx.arc(x, y, _this.options.size/2, 0, Math.PI*2, true);
                _this.ctx.closePath();
                _this.ctx.fill();

                //start the path for a drag
                _this.ctx.beginPath();
                _this.ctx.moveTo(x, y);
            })._addEvent('touchmove', function(e) {
                var x = Math.floor(e.touches[0].pageX - _this.offset.left);
                var y = Math.floor(e.touches[0].pageY - _this.offset.top);
                _this.ctx.lineTo(x, y);
                _this.ctx.stroke();
                e.preventDefault();
            })._addEvent('touchend', function(e) {
                _this.ctx.closePath();
                var percent = _this._percent();
                if (percent >= 50) _this._clear();
            });
        },

        reset: function(options) {
            if (options && typeof options === 'object')
                this.options = extend(this.options, options);
            this.canvas._show();
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.ctx.globalCompositeOperation = 'source-over';
            this.pixels = this.width * this.height;
            this.ctx.fillStyle = this.options.fg;
            this.ctx.beginPath();
            this.ctx.rect(0, 0, this.width, this.height);
            this.ctx.fill();
            this.ctx.closePath();
        },

        _percent: function() {
            var hits = 0,
                imageData = this.ctx.getImageData(0,0, this.width, this.height);

            for (var i=0, ii=imageData.data.length; i<ii; i=i+4) {
              if (imageData.data[i] === 0 && imageData.data[i+1] === 0 && imageData.data[i+2] === 0 && imageData.data[i+3] === 0) {
                hits++;
              }
            }

            return (hits / this.pixels) * 100;
        },

        _clear: function() {
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.canvas._hide();
            if (this.options.onEnd) this.options.onEnd.call(this);
        }
    };

    // 默认参数
    var defaults = {
        bg: '#f00',
        fg: '#888',
        middle: '谢谢惠顾，嘿嘿',
        size: 20,
        onEnd: function(){}
    };

    return {
        attach:function(elem, willOptions){
            var options = extend(defaults, willOptions);
            var existedId = elem._attr('scratch');
            if (!existedId) {
                id++;
                cache['TxbbScratch' + id] = new Scratch(elem, options, id);
                return cache['TxbbScratch' + id];
            }
            else return cache['TxbbScratch' + existedId];
        }
    };
}));
