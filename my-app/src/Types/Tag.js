export default class Tag {
  constructor(id, subject, originator, label, timestamp, publicity) {
    this.id = id;
    this.subject = subject;
    this.originator = originator;
    this.label = label;
    this.timestamp = timestamp;
    this.publicity = publicity;
    this.types = 'generic';
  }

  static decodeTagTypes = tagTypeString => {
    var sepChar = ',';
    return tagTypeString.split(',');
  };

  fromServerTag = serverTagObject => {
    this.id = serverTagObject.slug;
    this.publicity = serverTagObject.publicity;
    this.originator = serverTagObject.originator;
    this.subject = serverTagObject.subject;
    this.types = Tag.decodeTagTypes(serverTagObject.type);
    this.label = serverTagObject.text;
  };
}
