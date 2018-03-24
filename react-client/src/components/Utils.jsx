export const uuid = foo => {
  // Get a random uuid
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

export const createEdge = (subject, originator, tag, timestamp) => {
    var edge = {
        id: uuid(),
        subject: subject,
        originator: originator,
        tag: tag,
        timestamp: timestamp
      };
    return edge;
}