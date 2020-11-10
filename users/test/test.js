/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai');
const chaiHttp = require('chai-http');

const {
  expect,
} = chai;

const app = require('../app');

chai.use(chaiHttp);

// Before we begin, stub our services or similar
before(() => {
  // Some code here, probably involving sinon
});

// Clean up afterwards
after(() => {
  // Put your clean up code here
});

describe('Health checks', () => {
  it('is alive', (done) => {
    chai
      .request(app)
      .get('/health/alive')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        console.log(res.text);
        expect(JSON.parse(res.text).success).to.be.true;
        done();
      });
  });
});
