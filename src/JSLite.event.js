/*依赖JSLite.core.js*/
;(function($){
    var handlers = {},_zid = 1,_jid = 1,focusinSupported = 'onfocusin' in window,type = event,specialEvents={}
            specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents',hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' };
    function zid(element) {
	    return element._zid || (element._zid = _zid++)
	}
    /* 绑定事件 start */
  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$|webkitMovement[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }
    function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        event[predicate] = returnFalse
      })

      event.timeStamp || (event.timeStamp = Date.now())

      if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }
    $.fn.extend({
        ready: function(callback){
            if (/complete|loaded|interactive/.test(document.readyState) && document.body) callback(JSLite)
            else document.addEventListener('DOMContentLoaded', function(){callback(JSLite) }, false)
            return this
        },
        bind: function(event, func) {return this.each(function(){add(this, event, func)})},
        unbind:function(event, func) {return this.each(function(){remove(this, event, func)})},
        on:function(event, selector, data, callback,one){
            var autoRemove, delegator, $this = this
		    if (event && !isString(event)) {
		      $.each(event, function(type, fn){
		        $this.on(type, selector, data, fn, one)
		      })
		      return $this
		    }

		    if (!isString(selector) && !isFunction(callback) && callback !== false)
		      callback = data, data = selector, selector = undefined
		    if (callback === undefined || data === false)
		      callback = data, data = undefined

		    if (callback === false) callback = returnFalse
		    return $this.each(function(_, element){
		      if (one) autoRemove = function(e){
		        remove(element, e.type, callback)
		        return callback.apply(this, arguments)
		      }

		      if (selector) delegator = function(e){
		        var evt, match = $(e.target).closest(selector, element).get(0)
		        if (match && match !== element) {
		          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
		          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
		        }
		      }

		      add(element, event, callback, data, selector, delegator || autoRemove)
		    })
        },
        off:function(event, selector, callback){
            var self = this
            if (event && !$.isString(event)) {
                $.each(event, function(type, fn){
                    self.off(type, selector, fn)
                })
                return self
            }
            if (!$.isString(selector) && !$.isFunction(callback) && callback !== false)
                callback = selector, selector = undefined
            if (callback === false) callback =  function(){return false;}
            return self.each(function(){
                remove(this, event, callback, selector)
            })
        },
        delegate: function(selector, event, callback){
            return this.on(event, selector, callback)
        },
        trigger:function(event, data){
            /* 移除了
            var type = event,specialEvents={}
            specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';
              */
            if (typeof type == 'string') {
                event = document.createEvent(specialEvents[type] || 'Events');
                event.initEvent(type,true, true);
            }else return;
            event._data = data;
            return this.each(function(){
                if('dispatchEvent' in this) this.dispatchEvent(event);
            });
        }
    });
    $.event={add:add,remove:remove};
    function realEvent(type) {
	    return hover[type] || (focusinSupported && focus[type]) || type
	}
	function eventCapture(handler, captureSetting) {
	    return handler.del &&
	      (!focusinSupported && (handler.e in focus)) ||
	      !!captureSetting
	}
	function createProxy(event) {
	    var key, proxy = { originalEvent: event }
	    for (key in event)
	      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

	    return compatible(proxy, event)
	}
    function add(element, events, fn, data, selector, delegator, capture){
    	var id = zid(element), set = (handlers[id] || (handlers[id] = []))
		events.split(/\s/).forEach(function(event){
		  if (event == 'ready') return $(document).ready(fn)
		  var handler   = parse(event)
		  handler.fn    = fn
		  handler.sel   = selector
		  // emulate mouseenter, mouseleave
		  if (handler.e in hover) fn = function(e){
		    var related = e.relatedTarget
		    if (!related || (related !== this && !$.contains(this, related)))
		      return handler.fn.apply(this, arguments)
		  }
		  handler.del   = delegator
		  var callback  = delegator || fn
		  handler.proxy = function(e){
		    e = compatible(e)
		    if (e.isImmediatePropagationStopped()) return
		    e.data = data
		    var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
		    if (result === false) e.preventDefault(), e.stopPropagation()
		    return result
		  }
		  handler.i = set.length
		  set.push(handler)
		  if ('addEventListener' in element)
		    element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
		})
    }
    function remove(element, events, func, selector){
        ;(events || '').split(/\s/).forEach(function(event){
            $.event = parse(event)
            findHandlers(element, event, func, selector).forEach(function(handler){
                delete handlers[jid(element)][handler.i]
                if (element.removeEventListener) element.removeEventListener(handler.e, handler.proxy, false);
            })
        })
    }
    function jid(element) {return element._jid || (element._jid = _jid++)}
    function parse(event) {
        var parts = ('' + event).split('.');
        return {e: parts[0], ns: parts.slice(1).sort().join(' ')};
    }
    function findHandlers(element, event, func, selector){
        var self=this,id = jid(element);event = parse(event)
        return (handlers[jid(element)] || []).filter(function(handler) {
            return handler
            && (!event.e  || handler.e == event.e)
            && (!func || handler.fn.toString()===func.toString())
            && (!selector || handler.sel == selector);
        })
    }
    ;("blur focus focusin focusout load resize scroll unload click dblclick " +
    "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
    "change select submit keydown keypress keyup error paste drop dragstart dragover " +
    "beforeunload").split(' ').forEach(function(event) {
        $.fn[event] = function(callback) {
            return callback ? this.bind(event, callback) : this.trigger(event);
        }
    });
    $.Event = function(type, props) {
        if (!isString(type)) props = type, type = props.type
        var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
        if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
        event.initEvent(type, bubbles, true)
        return compatible(event)
      }
    /* 绑定事件 end */
})(JSLite);