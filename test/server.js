var express = require('express'),
    join = require('path').join,
    json = require('./data.json'),
    app = express(),
    response;

app.use(express.static(join(__dirname, '..')));

app.get('/search/:query', function(req, res) {
  var query = req.params.query.toLowerCase();

  var children = json.data.children.filter(function(item) {
    return ~item.data.title.toLowerCase().indexOf(query);
  });

  res.send({ data : { children : children }});

});

app.get('/', function(req, res) {
  res.sendfile(join(__dirname, 'test.html'));
});

app.listen(7000, function() {
  console.log('Listening on port 7000');
});
