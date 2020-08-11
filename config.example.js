module.exports = {
	// this option allows you to specify "expert" options for different modules
	"_": {
		// supported modules: csv-parse, nodemailer-express-handlebars, nodemailer-html-to-text

		// see https://csv.js.org/parse/options/
		"csv-parse": {
			"comment": "#"
		},

		// see https://github.com/yads/nodemailer-express-handlebars
		"nodemailer-express-handlebars": {
			// partials are in ./partials, layouts in ./layouts and templates in ./ by default
		},

		// see https://github.com/andris9/nodemailer-html-to-text
		"nodemailer-html-to-text": {

		},

		// see https://github.com/jonkemp/inline-css
		"inline-css": {
			// url defaults to '/'
		},
	},
	// SMTP connection options for nodemailer for DEV mode
	// you could use etheral or something similar here
	"dev_smtp": {
		// see https://nodemailer.com/smtp/
		"host": "smtp.example.com",
		"auth": {
			"user": "username",
			"pass": "password"
		}
	},

	// SMTP connection options for nodemailer
	"smtp": {
		// see https://nodemailer.com/smtp/
		"host": "smtp.example.com",
		"auth": {
			"user": "username",
			"pass": "password"
		}
	},

	// configures the mails to be sent
	"mail": {

		// all will be applied to all emails
		// see https://nodemailer.com/message/ for the options you can configure
		"all": {
			"from": "sender@example.com",
			"subject": "Personalized Attachment",
			"template": "mail-template"
		},

		// these options will be evaluated in context
		// string containing {{xzy}} will be replaced by the actual value but
		// make sure xyz is a valid header in your csv file
		//
		// CAVE: do not specify options here AND in 'all'
		//
		// see https://nodemailer.com/message/ for the options you can configure
		"each": {
			"to": "{{email}}",
			"attachments": [{
				"filename": "attachment.pdf",
				"path": "{{firstname}}_{{lastname}}.pdf"
			}, {
				"filename": "img.png",
				"path": "img.png",
				"cid": "cidimg.png",
				"contentDisposition": "inline"
			}]
		}
	},

	// configures the processor
	"bulk": {
		// recipient list as csv file, containing a header row!
		"recipients": "recipients.csv",
	}
};
