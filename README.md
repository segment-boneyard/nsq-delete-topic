
# nsq-delete-topic

  Delete a nsq topic and all its channels and messages.

## API

### deleteTopic(nsqlookupd, topic, fn)

  Given a string or array of strings of `nsqlookupd` addresses, and a `topic`,
  delete that topic from all known instances of `nsqd` and call `fn` with the
  possible error object.

```js
var deleteTopic = require('nsq-delete-topic');

deleteTopic('http://localhost:4161', 'events', function(err){
  // ...
});
```

## Installation

```bash
$ npm install nsq-delete-topic
```

## License

  MIT

