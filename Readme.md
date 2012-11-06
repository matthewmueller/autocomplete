
# autocomplete

  Autocomplete component

![autocomplete](http://f.cl.ly/items/1X2L2Y3P3t2d1p411W3Y/autocomplete.png)

## Installation

    $ component install matthewmueller/autocomplete

## Example

```html
<input type="search" id="search" name="keyword">
```

```js
autocomplete(document.getElementById('search'), '/search/:keyword')
  .parse('result')
  .label('title')
  .value('url')
  .format(function(label, q) {
    var r = new RegExp('(?:' + q + ')', 'i');
    return label.replace(r, '<span class="highlight">$&</span>');
  })
  .on('select', function(url) {
    img.src = url;
  })
```

## Events

* `enabled` autocomplete is now listening for user input
* `disabled` autocomplete is no longer listening for user input
* `response` (res) response object after running through `autocomplete#parse`
* `error` (err) emitted when the server responds with an error
* `select` (value) emitted when you select an item from the autocomplete menu

## API

### autocomplete(el, url, [opts])

Initialize a new `Autocomplete` instance. Pass in an `input` el, a `url` endpoint and some options.

`url` may take a single express-style parameter to be used as the query key. You can specify the query key by either setting the `input[name]` or calling `autocomplete#key(...)`. If no query key is present, autocomplete will pass the query through as a querystring.

Available options include:

* `throttle` : *Defaults to 500*. Throttles the user input to reduce the number of AJAX calls.

```js
autocomplete(el, "https://api.github.com/legacy/repos/search/:keyword")
```

### #enable()

Enables the autocomplete.

```js
autocomplete.enable()
```

### #disable()

Disables the autocomplete.

```js
autocomplete.disable()
```

### #key(key)

The query key used as either part of the query string or express-style parameter. May also be set by adding a `name` attribute to the input `el`.

```js
autocomplete.key('q') // http://google.com/?q=...
```

### #display(display)

Displays the menu. `display` defaults to `true`. You may set this `false` if you just want to use the search feature without the autocomplete menu.

```js
autocomplete.display(false)
```

### #parse(key)

Parses the result object called immediately after a successful response from the server. This is useful for preparing the data. Many times you don't recieve a direct result set, but instead an object containing the results, maybe something like `{ result : [...] }`. `key` may be a string or a function and supports [to-function](https://github.com/component/to-function) notation.

```js
autocomplete.parse('result')
```

or as a function

```js
autocomplete.parse(function(res) {
  return res.result;
})
```

### #label(key)

Determines which key from the result object should be used to map label names in the menu. `key` may be a string or a function. label uses [to-function](https://github.com/component/to-function), so you may use dot notation to traverse the result object.

```js
autocomplete.label('name.first')
```

or as a function

```js
autocomplete.label(function(item) {
  return item.name.first;
})
```

### #value(key)

Determines which key from the result object should be used to map to values in the menu. This data is what will be passed when the user selects an item on the menu. `key` may be a string or a function and supports [to-function](https://github.com/component/to-function) notation.

```js
autocomplete.value('url')
```

or as a function

```js
autocomplete.value(function(item) {
  return item.url;
})
```

### #format(formatter)

Format the menu items. Pass a `formatter(label, query)` function in to modify menu items. Useful for styling the result, such as providing query highlighting.

Here's how to highlight the query within the menu

```js
autocomplete.format(function(label, query) {
  var r = new RegExp('(?:' + q + ')', 'i');
  return label.replace(r, '<span class="highlight">$&</span>');
})
```

### #search(fn)

Call `search` to manually execute a search. This is usually called by default as you type, but may be useful for one-off searches or if you disabled autocomplete. Optionally you may pass an `fn` function to handle the results or listen for the `response` event. Please note that `res` is run through `autocomplete#parse` beforehand.

```js
autocomplete.search(function(err, res) {
  if(err) throw err;
  console.log(res);
})
```

### #menu

Access to the raw [menu](https://github.com/component/menu) component. Useful for listening to specific `menu` events.

### #position(fn)

Used to manually modify the position of the menu. May be useful for providing additional menu styling like carets and stuff. `fn` must return a position object with `x` and `y` keys.

Here's the default `fn`

```js
autocomplete.position(function(el) {
  var coords = getOffset(el),
      x = coords.left,
      y = coords.top + el.offsetHeight;

  return { x : x, y : y };
})
```

## Test

    $ make test
    $ node test/server.js
    $ open http://localhost:7000

## License

  MIT
