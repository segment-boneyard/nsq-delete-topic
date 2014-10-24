var lookup = require('nsq-lookup');
var Batch = require('batch');
var request = require('superagent');
var debug = require('debug')('nsq-delete-topic');

module.exports = deleteTopic;

function deleteTopic(nsqlookupd, topic, fn){
  var batch = new Batch();

  if ('string' === typeof(nsqlookupd)) {
    nsqlookupd = [nsqlookupd];
  }

  debug('deleting topic', topic);
  debug('lookup up servers', nsqlookupd);

  deleteFromNsqd(nsqlookupd, topic, function () {
    deleteFromLookupd(nsqlookupd, topic, fn);
  });
}

function deleteFromNsqd(nsqlookupd, topic, callback) {
  var batch = new Batch();
  lookup(nsqlookupd, function(err, nodes){
    if (err) {
      debug('lookup error', err);
      return fn(err);
    }

    nodes
      .filter(hasTopic(topic))
      .map(function(node){
        // loop through all of our nodes that contain this topic
        // and call the delete on each of them.
        debug('found node', node.broadcast_address, node.http_port);
        batch.push(function(done){
          var nodeAddress = node.broadcast_address + ':' + node.http_port;
          debug('processing nsqd node', nodeAddress);

          request
            .post(nodeAddress + '/topic/delete?topic=' + topic)
            .end(function(err, res){
              debug(
                'nsqd node complete',
                nodeAddress,
                res.status,
                err
              );

              if (err) return done(err);
              if (res.error) {
                debug(res.error);
                return done(res.error);
              }
              debug('success', nodeAddress);
              done();
            });
        });
      });

    batch.end(callback);
  });

}

function deleteFromLookupd(nsqlookupd, topic, callback) {
  var batch = new Batch();
  // now we need to loop through all of our lookupd servers
  // and delete the topic from there
  nsqlookupd.map(function(node) {
    debug('processing lookupd node', node);
    batch.push(function (done) {
      request
        .post(node + '/topic/delete?topic=' + topic)
        .end(function (err, res) {
          debug('lookupd node delete complete', node, res.status, err);
          done();
        });
    });
  });

  batch.end(callback);
}

function hasTopic(topic){
  return function(node){
    return node.topics.indexOf(topic) > -1;
  };
}
