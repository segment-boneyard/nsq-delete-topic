
var deleteTopic = require('../../index');
var util = require('../utils');

describe('nsq-delete-topic library', function () {

  var lookupdHost = 'http://localhost:4161';
  var nsqdHttpHost = 'localhost:4151';
  var nsqdTcpHost = 'localhost:4150';

  describe('with nonexistent topic', function () {
    it('should error 404 when deleting a nonexistent topic', function (done) {
      deleteTopic(lookupdHost, 'bogusTopic', function (err) {
        if (!err) {
          return done(new Error('expected 404, topic exists?'));
        }
        err.status.should.equal(404);
        done();
      });
    });
  });

  describe('with a valid topic', function () {

    var topicName = 'testValidTopic';
    var channelName = 'myValidChannel';

    function assertDeleted(callback) {
        util.assertTopic(lookupdHost, topicName, function (err, exists) {
          if (err) return callback(err);
          if (exists) return callback(new Error('Topic still exists!'));

          return callback();
        });
    }

    function cleanup(callback) {
      deleteTopic(lookupdHost, topicName, function (err) {
        if (err) return callback(err);

        assertDeleted(callback);
      });
    }

    beforeEach(function (done) {
      util.createTopic(nsqdHttpHost, topicName, function () {
        setTimeout(function () {
          util.assertTopic(lookupdHost, topicName, function (err, exists) {
            if (err) return done(err);
            if (!exists) return done(new Error('failed to create topic'));
            done();
          });
        }, 50);
      });
    });

    it('should remove the topic from the nsqd server', function (done) {
      cleanup(done);
    });

    it('should remove the topic after a message is published', function (done) {
      util.publishMessage(nsqdHttpHost, topicName, 'blarg!', function (err) {
        if (err) return done(err);

        cleanup(done);
      });
    });

    it('should remove the topic after a channel is opened', function (done) {
      util.createChannel(nsqdHttpHost, topicName, channelName, function (err) {
        if (err) return done(err);
        cleanup(done);
      });
    });

    it('should remove with topic, channel, and message', function (done) {
      util.createChannel(nsqdHttpHost, topicName, channelName, function (err) {
        if (err) return done(err);
        util.publishMessage(nsqdHttpHost, topicName, 'Honk!', function (err) {
          if (err) return done(err);
          cleanup(done);
        });
      });
    });

  });

});
