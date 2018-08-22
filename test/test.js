const { expect } = require('chai');
const sinon = require('sinon');
const { Router } = require('../index');

const addEventListener = function add(type, fn) {
  this[type] = fn;
};

const links = [
  {
    hasListenerAttached: false,
    addEventListener,
    href: '',
    dataset: { href: 'about' },
  },
  {
    hasListenerAttached: false,
    addEventListener,
    href: '',
    dataset: { href: 'home' },
  },
];

global.window = { history: { pushState: (a, b, path) => { global.window.location.pathname = path; } }, location: { pathname: '', search: '' } };
global.document = { querySelectorAll: () => links };

describe('#rw-router', () => {
  before(() => {
    Router.config();
    Router.listen();
  });
  it('configures links correctly', () => {
    expect(links[0].href).to.equal('#');
    expect(links[0].hasListenerAttached).to.equal(true);
    expect(links[1].href).to.equal('#');
    expect(links[1].hasListenerAttached).to.equal(true);
  });
  it('responds to link clicks', (done) => {
    expect(Router.current).to.equal('');
    links[0].click({ preventDefault: () => {} });
    setTimeout(() => {
      expect(Router.current).to.equal('about');
      done();
    }, 200);
  });
  it('can add a route', (done) => {
    const routeFn = sinon.stub();
    Router.add(/home/, routeFn);
    window.location.pathname = 'home';
    setTimeout(() => {
      expect(Router.current).to.equal('home');
      done();
    }, 200);
  });
  it('returns false if pushState is not supported', () => {
    const { window } = global;
    global.window.history.pushState = null;
    expect(Router.config()).to.equal(false);
    global.window = window;
  });
  after(() => {
    clearInterval(Router.interval);
  });
});
