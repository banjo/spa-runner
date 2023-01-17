# Spa runner

Simple API to run userscripts on SPA websites.

Userscripts generally work on pages where the content is fetched from the backend for each new request. On a SPA website, you usually fetch the content client side which does not re-run the userscripts. This simple API listens to the History API and triggers on URL changes. 


## Usage

```js
import { run } from "@banjoanton/spa-runner";


const handler = () => {
    console.log("hello world!");
}

const config = {
    timeBetweenUrlLookup: 250,
    urls: ["https://www.github.com/*/projects"],
    timeoutBeforeHandlerInit: 0,
    runAtStart: true,
    waitForElement: ".btn-danger"
};

const unsubscribe = run(handler, config);

unsubscribe(); 
```

## Config

### Time between URL lookup

The interval for each URL lookup. Defaults to `500`.

### URLs

All the URLs that the script should run at. Can include wildcard. Be sure to be more specific in here and use a very broad match in the userscript config. For example:

```
userscript: www.github.com/*
spa-runner: www.github.com/*/settings
```

Defaults to an empty array and matches all.

### Timeout before handler init

When the handler should run, it does so using a timeout to allow the page to load. This property sets that timeout duration. Defaults to `0`.


### Run at start

If the program should run at start, and not only on URL change. Defaults to `true`.

### Wait for element

The script will run after the element has been rendered. Uses `document.querySelector`. If not provided, it will run as usual.