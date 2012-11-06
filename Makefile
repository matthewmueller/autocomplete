
build: components index.js
	@component build --dev

components: component.json
	@component install --dev

test:
	@npm install express superagent

clean:
	rm -fr build components template.js

.PHONY: test clean
