let personalizedAttachmentSender = require('./lib')

personalizedAttachmentSender().then(() => {
	console.log('Finished');
}).catch((e) => {
	console.error(e.message);
});
