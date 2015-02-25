describe('Promise', function () {
    var ProjectRoot = process.env.WITH_COVERAGE ? '../lib-cov' : '../lib';

    var Promise = require('../' + ProjectRoot + '/promise');

    describe('Promises/A+ test suite.', function () {
        var adapter = {
            pending: function () {
                var promise = new Promise();

                return {
                    promise: promise,
                    fulfill: promise.fulfill,
                    reject: promise.reject
                };
            }
        };

        require("promises-aplus-tests").mocha(adapter);
    });

    describe('#inspect()', function () {
        it('should return an object containing state and output data of a promise', function (done) {
            var promise = new Promise();
            var snapshot = promise.inspect();

            snapshot.should.be.an('object');
            snapshot.state.should.exist;
            snapshot.value.should.exist;

            done();
        });

        it('should represent state of a promise', function (done) {
            var promise = new Promise();
            var snapshot = promise.inspect();
            snapshot.state.should.equal('pending');

            promise.fulfill();
            snapshot = promise.inspect();
            snapshot.state.should.equal('fulfilled');

            promise = new Promise();
            promise.reject();
            snapshot = promise.inspect();
            snapshot.state.should.equal('rejected');

            done();
        });

        it('should return value of promise', function (done) {
            var promise = new Promise();
            var snapshot = promise.inspect();
            snapshot.value.should.eql({ });

            promise.fulfill('yay');
            snapshot = promise.inspect();
            snapshot.value.should.equal('yay');

            promise = new Promise();
            promise.reject('doh!');
            snapshot = promise.inspect();
            snapshot.value.should.equal('doh!');

            done();
        });
    });

    describe('#promisify()', function () {
        it('should take a function, returning a promise linked to the function\'s callback.', function () {
            var testFunction = function (callback) {
                callback();
            };

            var promise = Promise.promisify(testFunction);

            promise.then.should.exist;
        });

        it('should fulfill the promise if the callback is successful.', function (done) {
            var expectedValue = 'some data.';

            var testFunction = function (callback) {
                callback(null, expectedValue);
            };

            var promise = Promise.promisify(testFunction);

            promise.then(function (value) {
                value.should.equal(expectedValue);

                done();
            });
        });

        it('should reject the promise if the callback returns an error.', function (done) {
            var expectedError = 'some data.';

            var testFunction = function (callback) {
                callback(expectedError, null);
            };

            var promise = Promise.promisify(testFunction);

            promise.then(function (value) {
                throw Error('Expected the promise to be rejected.');
            }, function (reason) {
                reason.should.equal(expectedError);

                done();
            });
        });

        it('should pass any provided arguments to the function to call.', function (done) {
            var argumentOne = 'some data.';
            var argumentTwo = 'some other data.';

            var testFunction = function (arg1, arg2, callback) {
                arg1.should.equal(argumentOne);
                arg2.should.equal(argumentTwo);

                done();
            };

            Promise.promisify(testFunction, argumentOne, argumentTwo);
        });
    });

    describe('#prepare()', function () {
        it('should return a function.', function () {
            var preparedFunction = Promise.prepare(function () {});

            preparedFunction.should.be.a('function');
        });

        it('should fulfill the promise if the callback is successful.', function (done) {
            var expectedValue = 'some data.';

            var testFunction = function (callback) {
                callback(null, expectedValue);
            };

            var preparedFunction = Promise.prepare(testFunction);

            var promise = preparedFunction();

            promise.then(function (value) {
                value.should.equal(expectedValue);

                done();
            });
        });

        it('should reject the promise if the callback returns an error.', function (done) {
            var expectedError = 'some data.';

            var testFunction = function (callback) {
                callback(expectedError, null);
            };

            var preparedFunction = Promise.prepare(testFunction);

            var promise = preparedFunction();

            promise.then(function (value) {
                throw Error('Expected the promise to be rejected.');
            }, function (reason) {
                reason.should.equal(expectedError);

                done();
            });
        });

        it('should pass any provided arguments to the function to call.', function (done) {
            var argumentOne = 'some data.';
            var argumentTwo = 'some other data.';

            var testFunction = function (arg1, arg2, callback) {
                arg1.should.equal(argumentOne);
                arg2.should.equal(argumentTwo);

                done();
            };

            var preparedFunction = Promise.prepare(testFunction);

            preparedFunction(argumentOne, argumentTwo);
        });
    });

    describe('#all()', function () {
        it('should return a promise', function (done) {
            Promise.all([]).should.be.an.instanceof(Promise);

            done();
        });

        it('should return an array of results to the assigned callback once all the promises are resolved', function (done) {
            var promise1 = new Promise();
            var promise2 = new Promise();

            Promise.all([ promise1, promise2 ]).then(function (results) {
                results.should.exist;
                results.length.should.equal(2);

                results[0].should.equal('hi there');
                results[1].should.equal('having fun using Promise?');

                done();
            });

            promise1.fulfill('hi there');
            promise2.fulfill('having fun using Promise?');
        });
    });
});
