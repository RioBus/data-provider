'use strict';
/* global describe, it, before, after; */

const Assert = require('assert');
const Http = require('../../src/core').Http;
const express = require('express');


describe('Http', () => {

	let http, server, addr;

    before( () => {
        let app = express();
        let port = 3000;

        app.get('/', function (req, res) {
            res.send('success');
        });

        app.get('/long', function (req, res) {
            setTimeout(() => {
                res.send('long');
            }, 4000);
        });

        app.get('/toolong', function (req, res) {
            setTimeout(() => {
                res.send('toolong');
            }, 10000);
        });

        server = app.listen(port, () => addr = `http://localhost:${port}` );
    });

    after(() => server.close());

    it(`should read 'success' from the request to '${addr}'`, (done) => {
        Http.get(addr).then( response => {
            Assert.equal(response.statusCode, 200);
            Assert.equal(response.body, 'success');
            done();
        });
    });

    it(`should read 'long' from the request to '${addr}/long'`, (done) => {
        Http.get(`${addr}/long`).then( response => {
            Assert.equal(response.statusCode, 200);
            Assert.equal(response.body, 'long');
            done();
        });
    });

    it(`should end the request to '${addr}/toolong' when taking more than 5 sec to respond`, (done) => {
        let p = Http.get(`${addr}/toolong`, undefined, 5000);
        p.then(
            response => Assert(false, 'Request not aborted after 5 seconds.'),
            error => {
                Assert.equal(error.code, 'ETIMEDOUT');
                done();
        });
    });
});