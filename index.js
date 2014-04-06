var lookup = require('nsq-lookup');
var Batch = require('batch');
var request = require('superagent');

module.exports = deleteTopic;

function deleteTopic(nsqlookupd, topic, fn){
  lookup(nsqlookupd, function(err, nodes){
    if (err) return fn(err);

    Batch(nodes
      .filter(hasTopic(topic))
      .map(function(node){
        return function(){
          request
          .post(node.broadcast_address + ':' + node.http_port + '/delete_topic')
          .send({ topic: topic })
          .end(function(err, res){
            if (err) return done(err);
            if (res.error && /INVALID_TOPIC/.test(err.message)) return done();
            done(err);
          });
        };
      }))
    .end(fn);
  });
};

function hasTopic(topic){
  return function(node){
    return node.topics.indexOf(topic) > -1;
  }
}
