# personalized-attachment-sender

This tools enables you to quickly send custom emails with a certain attachment. 
Similar to mail merge function in Outlook but without the bullshit.

## Usage
1. Make sure you've got everything installed by running `npm i`. 

2. Now copy the `config.example.js` and configure your emails. Get the attachments ready and 
make sure that they are somehow connectable to your list of recipients.

3. Get your list of recipients and put them into CSV format. Make sure to include a header row as
the names given in the header will be the ones you can use to identify your attachments and
build your email templates.

4. Write your mail template

5. Run `node index.js` to start a dry run. No mails will be sent. 
Run `node index.js print` to output all mails into files. No mails will be sent.

6. Check the outputs.

7. If you're satisfied with your results run `node index.js run-actual`. ***Mails will be sent!***

## Caveats

- Make sure your CSV headers match your handlebars-templates (e.g. CSV header `'Firstname'` matches `{{Firstname}}`). 
Same goes for config string placeholders
