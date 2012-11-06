/**
 * Module dependencies
 */

var throttle = require('throttle'),
    classes = require('classes'),
    event = require('event'),
    toFunction = require('to-function'),
    map = require('map'),
    Menu = require('menu'),
    Emitter = require('emitter'),
    request = require('superagent'),
    noop = function() {};

/**
 * Export `Autocomplete`
 */

module.exports = Autocomplete;

/**
 * Initialize `Autocomplete`
 */

function Autocomplete(el, url, opts) {
  if(!(this instanceof Autocomplete)) return new Autocomplete(el, url, opts);

  opts = opts || {};

  this.el = el;
  this.coords = getOffset(el);
  this.url = url;
  this._display = true;
  this.throttle = opts.throttle || 200;
  this.throttledSearch = throttle(this.search.bind(this), this.throttle);
  this._key = el.getAttribute('name');
  this.formatter = function(item) { return item; };

  // Prevents the native autocomplete from showing up
  this.el.setAttribute('autocomplete', 'off');

  classes(this.el).add('autocomplete');

  Emitter.call(this);

  this.enable();
}

/**
 * Mixin `Emitter`
 */

Emitter(Autocomplete.prototype);

/**
 * Enable the autocomplete
 *
 * @return {Autocomplete}
 */

Autocomplete.prototype.enable = function() {
  this.emit('enabled');
  event.bind(this.el, 'keyup', this.throttledSearch);
  return this;
};

/**
 * Disable the autocomplete
 *
 * @return {Autocomplete}
 */

Autocomplete.prototype.disable = function() {
  this.emit('disabled');
  event.unbind(this.el, 'keyup', this.throttledSearch);
  return this;
};

/**
 * #display(boolean)
 *
 * Display the menu or not. Defaults to `true`
 *
 * @param {Boolean} display
 * @return {Autocomplete}
 */

Autocomplete.prototype.display = function(display) {
  this._display = display;
  return this;
};

/**
 * Set the key for the search endpoint
 *
 * @param  {String} key
 * @return {Autocomplete}
 * @api public
 */

Autocomplete.prototype.key = function(key) {
  this._key = key;
  return this;
};

/**
 * #parse(fn)
 *
 * Handles parsing the response
 *
 * @param {Function} fn
 * @return {Autocomplete}
 * @api public
 */

Autocomplete.prototype.parse = function(fn) {
  this._parse = fn;
  return this;
};

/**
 * #label(str|func)
 *
 * Determines which label to show in the menu
 *
 * @param {String|Function} label
 * @return {Autocomplete}
 * @api public
 */

Autocomplete.prototype.label =
Autocomplete.prototype.labels = function(label) {
  this._label = label;
  return this;
};

/**
 * #value(str|func)
 *
 * Determines which value we use when we select an item
 *
 * @param {String|Function}  value
 * @return {Autocomplete}
 * @api public
 */

Autocomplete.prototype.value =
Autocomplete.prototype.values = function(value) {
  this._value = value;
  return this;
};

/**
 * #format(format)
 *
 * Applies formatting to the label that's displayed
 *
 * @param {Function} format
 * @return {Autocomplete}
 * @api public
 */

Autocomplete.prototype.format = function(format) {
  this.formatter = format;
  return this;
};

/**
 * #search([fn])
 *
 * Search with the given input. An optional callback
 * is provided with results
 *
 * @param {Function} fn
 * @return {Autocomplete}
 * @api public
 */

Autocomplete.prototype.search = function(fn) {
  if(fn && fn.keyCode == 13) return this;
  else if(typeof fn !== 'function') fn = noop;

  if(!this._key)
    throw new Error('autocomplete: no key to query on, add key in input[name] or key()');

  var self = this,
      url = this.url,
      val = encodeURIComponent(this.el.value),
      rkey = new RegExp(':' + this._key);
      query = {};

  if(!val) {
    if(this.menu) this.menu.hide();
    return this;
  }

  // Add basic search/:keyword
  if(rkey.test(url)) {
    url = url.replace(rkey, val);
  } else {
    query[this._key] = val;
  }

  request
    .get(url)
    .query(query)
    .end(this.respond.bind(this, fn, this.el.value));

  return this;
};

/**
 * #select(value)
 *
 * Handle the selecting of a menu item
 *
 * @param {Mixed} value
 * @return {Autocomplete}
 * @api public
 */

Autocomplete.prototype.select = function(value) {
  this.emit('select', value);
  return this;
};

/**
 * Customize the position of the `Menu`
 *
 * @param  {Function} fn
 * @return {Autocomplete}
 * @api public
 */

Autocomplete.prototype.position = function(fn) {
  this._position = fn;
  return this;
};

/**
 * Default positioning of the `Menu`. May be overwritten
 * to provide custom positioning logic
 *
 * @param {Node} el
 * @return {Object}
 * @api private
 */

Autocomplete.prototype._position = function(el) {
  var coords = getOffset(el),
      x = coords.left,
      y = coords.top + el.offsetHeight;

  return { x : x, y : y };
};

/**
 * #respond(res)
 *
 * Handles the superagent response
 *
 * @param {Function} fn
 * @param {String} query
 * @param {Object} res
 * @return {Autocomplete}
 * @api private
 */

Autocomplete.prototype.respond = function(fn, query, res) {
  if(!res.ok) {
    this.emit('error', res.text);
    fn(res.text);
    return this;
  }

  var parser = toFunction(this._parse || function(obj) { return obj; }),
      items = parser(res.body);

  if(!isArray(items)) throw new Error('autocomplete: response is not an array');

  this.emit('response', items);
  fn(null, items);

  if(!this._display) {
    return this;
  } else if(!this._label || !this._value) {
    throw new Error('autocomplete: dont know how to render menu need to specify #label(k) and #value(k)');
  }

  var el = this.el,
      labels = map(items, this._label),
      values = map(items, this._value),
      len = labels.length,
      menu = this.menu = this.menu || new Menu,
      format = this.formatter,
      pos = this._position(this.el);

  // Reset the menu
  this.menu.hide().clear().off('select');

  labels.forEach(function(label, i) {
    var value = values[i];
    menu.add(value, format(label, query));
    menu.on(value, function() {
      el.value = label;
      el.focus();
    });
  });

  // Pass select event onto autocomplete
  menu.on('select', this.select.bind(this));

  // Position the menu
  menu.moveTo(pos.x, pos.y);

  // If we have items to show, show it.
  if(items.length) menu.show();

  return this;
};

/**
 * Cross-browser Array#isArray
 *
 * @param {Array} arr
 * @return {Boolean}
 * @api private
 */

function isArray (arr) {
  return (Array.isArray)
    ? Array.isArray(arr)
    : Object.prototype.toString.call(arr) === "[object Array]";
}

/**
 * Cross-browser way to get element offset
 *
 * @param  {Node} el
 * @return {Object}
 * @api private
 */

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}
