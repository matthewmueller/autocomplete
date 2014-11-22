
example: build
	node test/server.js

build: node_modules
	@./node_modules/.bin/duo -g autocomplete index.{css,js} build

node_modules: package.json
	@npm install
	touch node_modules

clean:
	rm -fr build components node_modules template.js

.PHONY: test clean build
