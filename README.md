# Spa runner

Simple API to run userscripts on SPA websites.

## Usage

```js
const handler = () => {
    console.log("hello world!");
}

const config = {
    timeBetweenUrlLookup: 250
};

const unsubscribe = run(handler, config);

unsubscribe();
```

## Description

Userscripts generally work on pages where the content is fetched from the backend for each new request. On a SPA website, you usually fetch the content client side which does not re-run the userscripts. This simple API listens to the History API and triggers on URL changes. 
