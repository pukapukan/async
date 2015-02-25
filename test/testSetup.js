var chai = require('chai');
chai.should();

beforeEach(function () {
    for (var key in require.cache) {
        delete require.cache[key];
    }
});
