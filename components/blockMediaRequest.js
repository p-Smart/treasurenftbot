


const blockMediaRequests = (request) => {
    if (request.resourceType() === 'image' || request.resourceType() === 'media') {
      request.abort();
    } else {
      request.continue();
    }
};

module.exports = blockMediaRequests