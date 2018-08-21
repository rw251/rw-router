// Minimalistic router inspired (nicked) largely from http://krasimirtsonev.com/blog/article/A-modern-JavaScript-router-in-100-lines-history-api-pushState-hash-url

// Usage

// import {Router} from './rw-router'
// Router.config(); // wires everything up - also converts <a> tags with data-href into route links
// Router.navigate(); // navigate to the home page
// Router
//  .add('', () => {
//     document.getElementById('main').innerText = 'DEFAULT PAGE';
//  })
//  .add(/about/, () => {
//     document.getElementById('main').innerText = 'ABOUT';
//  })
//  .listen()
//
// Then if you want to navigate call Router.navigate('blah;);


exports.Router = {
  routes: [],
  current: '',

  // do something if pushstate is not supported
  config() {
    // Wire up any <a> tags with a data-href attribute
    [].slice.call(document.querySelectorAll('[data-href]')).forEach((link) => {
      if (!link.hasListenerAttached) {
        link.addEventListener('click', (e) => {
          if ((e.ctrlKey || e.metaKey) && e.target.tagName.toLowerCase() === 'a') {
            return false;
          }
          const location = link.dataset.href;

          e.preventDefault();
          return this.navigate(location);
        });
        link.href = '#';
        link.hasListenerAttached = true;
      }
    });
    return window.history.pushState ? this : false;
  },

  // remove leading and trailing slashes
  clearSlashes(path) {
    return path.toString().replace(/\/$/, '').replace(/^\//, '');
  },

  // get the part of the url for routing
  getFragment() {
    return this.clearSlashes(decodeURI(window.location.pathname + window.location.search)).replace(/\?(.*)$/, '');
  },

  // add a route
  add(re, handler) {
    this.routes.push({ re, handler });
    return this;
  },

  // check fragment against a route
  check(f) {
    const fragment = f || this.getFragment();
    for (let i = 0; i < this.routes.length; i += 1) {
      const match = fragment.match(this.routes[i].re);
      if (match) {
        match[0] = null; // this is always the callback argument
        this.routes[i].handler.apply({}, match);
        return this;
      }
    }
    return this;
  },

  // listen for url changes
  listen() {
    this.current = this.getFragment();
    const fn = () => {
      if (this.current !== this.getFragment()) {
        this.current = this.getFragment();
        this.check(this.current);
      }
    };
    clearInterval(this.interval);
    this.interval = setInterval(fn, 50);
    return this;
  },

  // navigate to new url if different to previous
  navigate(path = '') {
    if (this.clearSlashes(path) === this.current) return this;
    window.history.pushState(null, null, `/${this.clearSlashes(path)}`);
    return this;
  },

};
