
var request = require('superagent');

module.exports = {
  createTopic: function (nsqd, topic, callback) {
    request
      .post('http://' + nsqd + '/topic/create?topic=' + topic)
      .end(callback);
  },
  getLookupdTopics: function (lookupd, callback) {
    request
      .post(lookupd + '/topics')
      .end(function (err, res) {
        if (err) return callback(err);
        if (res.error) return callback(res.error);
        console.log(res.body);
        callback(undefined, res.body);
      });
  },
  getAllTopics: function (lookupd, callback) {
    request
      .post(lookupd + '/nodes')
      .end(function (err, res) {
        if (err) return callback(err);
        if (res.error) return callback(res.error);

        var topics = [];
        res.body.data.producers.forEach(function(node) {
          node.topics.forEach(function(topic) {
            if (topics.indexOf(topic) === -1) {
              topics.push(topic);
            }
          });
        });

        callback(undefined, topics);
      });
  },
  assertTopic: function (lookupd, topic, callback) {
    this.getAllTopics(lookupd, function (err, topics) {
      if (err) return callback(err);
      if (topics.indexOf(topic) >= 0) {
        return callback(undefined, true);
      }

      return callback(undefined, false);
    });
  },
  publishMessage: function (nsqd, topic, message, callback) {
    request
      .post('http://' + nsqd + '/pub?topic=' + topic)
      .send(message)
      .end(function (err, res) {
        if (err) return callback(err);
        if (res.error) return callback(res.error);

        callback();
      });
  },
  createChannel: function (nsqd, topic, channel, callback) {
    request
      .post('http://' + nsqd + '/channel/create?topic=' + topic + '&channel=' + channel)
      .end(function (err, res) {
        if (err) return callback(err);
        if (res.error) return callback(res.error);

        callback();
      });
  }
};
