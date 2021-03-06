# rw-router

[![Build Status](https://travis-ci.org/rw251/rw-router.svg?branch=master)](https://travis-ci.org/rw251/rw-router)
[![Coverage Status](https://coveralls.io/repos/github/rw251/rw-router/badge.svg?branch=master)](https://coveralls.io/github/rw251/rw-router?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/rw251/rw-router/badge.svg)](https://snyk.io/test/github/rw251/rw-router)

Minimalistic router inspired (nicked) largely from http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url

## Usage

index.html
```html
<!-- Link elements with a data-href corresponding to the url -->
<a data-href="home">Home</a> <!-- e.g. mysite.com/home -->
<a data-href="about">About</a> <!-- e.g. mysite.com/about -->
<a data-href="product/22/edit">Edit</a> <!-- e.g. mysite.com/product/22/edit -->

<div id="main">Route content will end up here</div>
```

script.js
```js
import {Router} from 'rw-router'
Router.config(callback); // wires everything up - also converts <a> tags with data-href into route links. The optional callback executes just prior to navigation following a user click
Router.navigate(); // navigate to the home page
Router
 .add('', (callback) => {
    document.getElementById('main').innerText = 'DEFAULT PAGE';
 })
 .add(/home/, (callback) => {
    document.getElementById('main').innerText = 'HOME';
 })
 .add(/about/, (callback) => {
    document.getElementById('main').innerText = 'ABOUT';
 })
 .add(/products\/(.*)\/edit/, (callback, productId) => { 
    // in general matched capture groups in the regex fill in arguments 2 and upwards
    document.getElementById('main').innerText = 'EDIT PRODUCT ' + productId;
 })
 .listen()
 ```

Then if you want to navigate call Router.navigate('blah;);