const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const { Router } = require('../index');
require('jsdom-global')(null, { url: 'http://smash/' });

chai.use(sinonChai);
const { expect } = chai;

// jsdom doesn't support navigation - but we only need to
// change the pathname - so let's mock it.
// delete window.location;
// window.location = { pathname: '', search: '' };

const createLink = (title, href) => {
  const a = document.createElement('a');
  const linkText = document.createTextNode(title);
  a.appendChild(linkText);
  a.title = title;
  if (href) a.dataset.href = href;
  document.body.appendChild(a);
};

describe('#rw-router', () => {
  before(() => {
    createLink('about', '/about');
    createLink('home', '/home');
    createLink('another', '/another');
    createLink('nolink', '');
    Router.config();
    Router.listen();
  });
  it('responds to link clicks', (done) => {
    expect(Router.current).to.equal('');
    const links = document.querySelectorAll('a');
    links[0].click();
    setTimeout(() => {
      expect(Router.current).to.equal('about');
      done();
    }, 200);
  });
  it('can add a route', (done) => {
    const routeFn = sinon.stub();
    Router.add(/home/, routeFn);
    window.history.pushState(null, null, '/home');
    setTimeout(() => {
      expect(routeFn).to.have.been.calledOnce;
      expect(Router.current).to.equal('home');
      done();
    }, 200);
  });
  it('returns false if pushState is not supported', () => {
    const { pushState } = window.history;
    delete window.history.pushState;
    window.history.pushState = null;
    expect(Router.config()).to.equal(false);
    window.history.pushState = pushState;
  });
  it('fails to navigate to same page - from pushstate', (done) => {
    const routeFn = sinon.stub();
    Router.add(/test/, routeFn);
    window.history.pushState(null, null, '/test');
    setTimeout(() => {
      expect(Router.current).to.equal('test');
      expect(routeFn).to.have.been.calledOnce;
      window.history.pushState(null, null, '/test');
      setTimeout(() => {
        expect(Router.current).to.equal('test');
        expect(routeFn).to.have.been.calledOnce;
        done();
      }, 200);
    }, 200);
  });
  it('fails to navigate to same page - from clicks', (done) => {
    const routeFn = sinon.stub();
    Router.add(/another/, routeFn);
    const links = document.querySelectorAll('a');
    links[2].click();
    setTimeout(() => {
      expect(Router.current).to.equal('another');
      expect(routeFn).to.have.been.calledOnce;
      links[2].click();
      setTimeout(() => {
        expect(Router.current).to.equal('another');
        expect(routeFn).to.have.been.calledOnce;
        done();
      }, 200);
    }, 200);
  });
  it('navigate called if data-href is set', () => {
    const links = document.querySelectorAll('a');
    const { navigate } = Router;
    Router.navigate = sinon.stub();
    links[0].click();
    expect(Router.navigate).to.have.been.calledOnce;
    Router.navigate = navigate;
  });
  it('navigate not called if data-href is not set', () => {
    const links = document.querySelectorAll('a');
    const { navigate } = Router;
    Router.navigate = sinon.stub();
    links[3].click();
    expect(Router.navigate).to.have.not.been.called;
    Router.navigate = navigate;
  });
  after(() => {
    clearInterval(Router.interval);
  });
});
