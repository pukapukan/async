var Promise = function Promise() {
    var stack = [];

    var outputData = {};
    var hasCompleted = false;
    var wasRejected = false;

    this.then = function (onFulfilled, onRejected) {
        var returnedPromise = new Promise();

        var stackItem = {
            promise: returnedPromise,
            onFulfilled: onFulfilled,
            onRejected: onRejected
        };

        if (hasCompleted) {
            initiateCallback(stackItem);
        } else {
            stack.push(stackItem);
        }

        return returnedPromise;
    };

    var initiateCallback = function (stackItem) {
        var toCall = wasRejected ? stackItem.onRejected : stackItem.onFulfilled;
        var promiseToFulfill = stackItem.promise;

        if (!(toCall instanceof Function)) {
            if (wasRejected) {
                promiseToFulfill.reject(outputData);
            } else {
                promiseToFulfill.fulfill(outputData);
            }

            return;
        }

        setImmediate(function () {
            var value;
            try {
                value = toCall(outputData);
            } catch (e) {
                promiseToFulfill.reject(e);
            }

            if (value && value.then instanceof Function) {
                value.then(promiseToFulfill.fulfill, promiseToFulfill.reject);
            } else {
                promiseToFulfill.fulfill(value);
            }
        });
    };

    var processResult = function (cameFromRejected, data) {
        outputData = data;

        hasCompleted = true;
        wasRejected = cameFromRejected;

        while (stack.length) {
            var command = stack.shift();

            initiateCallback(command);
        }
    };

    this.fulfill = function (value) {
        if (hasCompleted) {
            return this;
        }

        processResult(false, value);

        return this;
    };

    this.reject = function (reason) {
        if (hasCompleted) {
            return this;
        }

        processResult(true, reason);

        return this;
    };

    this.inspect = function () {
        return {
            state: !hasCompleted ? 'pending' : wasRejected ? 'rejected' : 'fulfilled',
            value: outputData
        };
    };
};

Promise.promisify = function () {
    var promise = new Promise();

    var argumentsArray = Array.prototype.slice.call(arguments);

    var toCall = argumentsArray.shift();

    argumentsArray.push(function (reason, value) {
        if (reason) {
            promise.reject(reason);
            return;
        }

        promise.fulfill(value);
    });

    toCall.apply(null, argumentsArray);

    return promise;
};

Promise.prepare = function (toCall) {
    return function () {
        var promise = new Promise();

        var argumentsArray = Array.prototype.slice.call(arguments);

        argumentsArray.push(function (reason, value) {
            if (reason) {
                promise.reject(reason);
                return;
            }

            promise.fulfill(value);
        });

        toCall.apply(null, argumentsArray);

        return promise;
    };
};

Promise.all = function (promises) {
    var p = new Promise();
    var countDown = 0;
    var fulfillNow = true;

    promises.forEach(function(promise, index) {
        var snapshot;
        if((snapshot = promise.inspect()).state === 'fulfilled') {
            promises[index] = snapshot.value;
        } else {
            ++countDown;
            fulfillNow = false;
            promise.then(function (value) {
                promises[index] = value;
                if(--countDown === 0) {
                    p.fulfill(promises);
                }
            }, p.reject);
        }
    });
    if(fulfillNow) {
        p.fulfill(promises);
    }
    return p;
};

module.exports = Promise;
