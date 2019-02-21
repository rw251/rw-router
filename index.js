export default {
  routes: [],
  current: '',

  // do something if pushstate is not supported
  config(callback) {
    if (!window.history.pushState) return false;
    // Wire up any <a> tags with a data-href attribute
    document.addEventListener('click', (event) => {
      let element = event.target;
      if ((!element.dataset || !element.dataset.href) && element.parentNode) element = element.parentNode;
      if (element.dataset && element.dataset.href) {
        const location = element.dataset.href;

        event.preventDefault();
        if(callback) callback();
        this.navigate(location);
      }
    });
    return this;
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

  // allow moving to url without firing
  shift(url, addToHistory) {
    if (addToHistory) window.history.pushState(null, null, `/${this.clearSlashes(url)}`);
    else window.history.replaceState(null, null, `/${this.clearSlashes(url)}`);
    this.current = `${this.clearSlashes(url)}`;
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
