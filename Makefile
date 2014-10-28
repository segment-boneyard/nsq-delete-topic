
test:
	@./node_modules/.bin/mocha --require should --recursive tests

.PHONY: test