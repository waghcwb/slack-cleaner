default: build

install:
	npm install

build:
	npm run build

watch:
    npm run build:dev

clean:
	./node_modules/.bin/rimraf dist