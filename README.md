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
    runAtStart: true
};

const unsubscribe = run(handler, config);

unsubscribe(); 
```
