
build: components index.js
	@component build --dev

components: component.json
	@component install --dev

test:
	@npm install
	node test/server.js

clean:
	rm -fr build components template.js

.PHONY: test clean
