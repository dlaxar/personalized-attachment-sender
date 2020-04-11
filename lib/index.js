let fs = require('fs');

let nodemailer = require('nodemailer');
let hbs = require('nodemailer-express-handlebars');
let htmlToText = require('nodemailer-html-to-text').htmlToText;

let csv = require('csv-parse/lib/sync');

const config = require('../config');

let expertConfig = config['_'] || {};

const CSV_PARSE_OPTIONS = {columns: true, ...expertConfig["csv-parse"]};
const HBS_CONFIG = {
	viewEngine: {
		partialsDir: './partials',
		layoutsDir:  './layouts',
		defaultLayout: false
	},
	viewPath: './',
	...expertConfig['nodemailer-express-handlebars']
};
const HTML_TO_TEXT_CONFIG = {...expertConfig['nodemailer-html-to-text']};

const PRINTRUN = process.argv[process.argv.length - 1] === 'print';
const DRYRUN = process.argv[process.argv.length - 1] !== 'run-actual';

function loadRecipients() {
	const content = fs.readFileSync(`./${config.bulk.recipients}`, 'utf8');
	return csv(content, CSV_PARSE_OPTIONS);
}

function verifyConnection(transporter) {
	return new Promise((resolve, reject) => {
		transporter.verify(function(error) {
			if (error) {
				reject(error)
			} else {
				resolve();
			}
		});
	});
}

/**
 * Replace strings with context variables
 *
 * @param content an object/string/anything
 * @param context an object containing the replacement variables
 * @returns any of type of content
 */
function replaceOptionsWithContext(content, context) {
	if(typeof(content) === 'string') {
		let keys = content.match(/\{\{[a-zA-Z0-9]+\}\}/g);

		if(keys !== null) {
			keys = keys.map(x => x.substr(2, x.length - 4));

			for(let key of keys) {
				content = content.replace(new RegExp('\{\{' + key + '\}\}'), context[key]);
			}
		}

		return content;
	} else if(typeof(content) == 'object') {
		for(let key in content) {
			if(content.hasOwnProperty(key)) {
				content[key] = replaceOptionsWithContext(content[key], context);
			}
		}
		return content;
	}

	return content;
}

/**
 * Convenience function to json stringify objects containing long strings
 * @param key
 * @param value
 * @returns {string|*}
 * @private
 */
function _jsonReplacer(key, value) {
	if(typeof (value) === 'string' && value.length > 200) {
		return `<str ${value.length}>`;
	} else {
		return value;
	}
}

function _printMessage(filename, message) {
	if(message.html) {
		fs.writeFileSync(filename + '.html', message.html, 'utf8');
	}

	if(message.text) {
		fs.writeFileSync(filename + '.txt', message.text, 'utf8');
	}
}

/**
 * Preformated logs for certain applications
 *
 * @param realm the format
 */
function logger(realm) {
	switch(realm) {
		case 'envelope': {
			let mail = arguments[1];
			let transporterReturn = arguments[2];
			let envelope = null;

			if(DRYRUN && transporterReturn.envelope) {
				envelope = transporterReturn.envelope;
				transporterReturn.message = JSON.parse(transporterReturn.message)
			} else {
				envelope = transporterReturn;
			}

			console.log('Sending message to ' + mail.to + ' with envelope: ' + JSON.stringify(envelope));

			if(DRYRUN) {
				console.log(JSON.stringify(transporterReturn.message, _jsonReplacer));

				if(PRINTRUN) {
					_printMessage(mail.to, transporterReturn.message);
				}
			} else {
				console.log(JSON.stringify(mail, _jsonReplacer));
			}
			// add newline
			console.log();
			break;
		}
		default:
			console.log.apply(console, Array.prototype.slice.call(arguments, 1));
	}
}

/**
 * Sends all given messages over the given transporter
 *
 * @param transporter
 * @param messages
 * @returns {Promise<unknown>} if rejected the error e is of type {message: string, errors: Error[]}
 */
function sendMessages(transporter, messages) {
	return new Promise(async (resolve, reject) => {
		let errors = [];
		// send next message from the pending queue
		for(let mail of messages) {
			try {
				let envelope = await transporter.sendMail(mail);

				logger('envelope', mail, envelope);
			} catch(e) {
				console.error(e.message + ' for message ' + JSON.stringify(mail));
				console.error(e.stack);

				errors.push({
					error: e,
					message: mail
				});
			}
		}

		if(errors.length) {
			let e = new Error('Some mails could not be sent!');
			e.errors = errors;
			return reject(e);
		}

		return resolve();
	});
}

async function main() {
	if(DRYRUN) {
		console.warn("Dry run only! No mail will be sent. Activate actual run by adding 'run-actual'");
	}

	if(!config.mail) {
		throw new Error("No key 'mail' in config");
	}

	let transportConfig = (DRYRUN) ? {jsonTransport: true} : config.smtp;
	let transporter = nodemailer.createTransport(transportConfig, config.mail.all || {});

	transporter.use('compile', hbs(HBS_CONFIG));
	transporter.use('compile', htmlToText(HTML_TO_TEXT_CONFIG));

	try {
		if(!DRYRUN) {
			await verifyConnection(transporter);
		}
	} catch(e) {
		throw e;
	}

	let recipients = loadRecipients();

	let messages = [];
	for(const recipient of recipients) {
		let optionsReplaced = replaceOptionsWithContext(Object.assign({}, config.mail.each), recipient);
		let mail = {
			...optionsReplaced, context: recipient
		};

		messages.push(mail);
	}

	let numMessages = messages.length;
	console.log(`Sending ${numMessages} messages\n+++++++++++++++++++++++++++++++++++++++++`);

	try {
		await sendMessages(transporter, messages);
		console.log('All messages sent successful');
	} catch(e) {
		if(e.errors) {
			console.log(`${e.errors.length} messages could not be sent. The other ${numMessages - e.errors.length} `
				        + `have been sent.`);
		}
	}

	transporter.close();
}

module.exports = main;
