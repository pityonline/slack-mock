'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru();

chai.use(require('sinon-chai'));

describe('mocker: events', function() {
  let requestMock
  let resMock
  let headersMock
  let bodyMock
  let loggerMock
  let events
  let target
  let data

  beforeEach(function() {
    bodyMock = {walter: 'white'}
    headersMock = {channel: 'AMC'}
    resMock = {
      headers: headersMock,
      statusCode: 200
    }

    requestMock = sinon.stub().yields(null, resMock, bodyMock)

    const levels = ['error', 'info', 'debug']
    loggerMock = {}
    levels.forEach((level) => {
      loggerMock[level] = sinon.stub()
    })

    events = proxyquire('../../mocker/events', {
      'request': requestMock,
      '../lib/logger': loggerMock
    })

    target = 'http://gus.fring'
    data = {ding: 'ding'}

    events.reset()
  });

  describe('send', function() {

    it('should record a successful response', function() {
      return events.send(target, data)
        .then(() => {
          expect(events.calls).to.have.length(1)

          const firstCall = events.calls[0]
          expect(firstCall.url).to.equal(target)
          expect(firstCall.body).to.equal(bodyMock)
          expect(firstCall.headers).to.equal(headersMock)
          expect(firstCall.statusCode).to.equal(resMock.statusCode)
        })
    });

    it('should log an error if request fails', function() {
      const error = new Error('GUS')
      requestMock.yields(error)

      return events.send(target, data)
        .then(() => {
          expect(events.calls).to.have.length(0)
          expect(loggerMock.error).to.have.been.called
        })
    });
  });

  describe('reset', function() {

    it('should reset calls array', function() {
      return events.send(target, data)
        .then(() => {
          expect(events.calls).to.have.length(1)
          events.reset()
          expect(events.calls).to.have.length(0)
        })
    });
  });
});