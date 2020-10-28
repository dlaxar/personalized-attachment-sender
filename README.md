# personalized-attachment-sender

This tools enables you to quickly send custom emails with personalized attachments. 
Similar to mail merge function in Outlook but without the bullshit.

Use https://gist.github.com/dlaxar/4987d6a5466edfc7be20c0794e515e99 to generate PDFs.

## Usage
1. Make sure you've got everything installed by running `npm i`. 

2. Now copy the `config.example.js` to `config.js` and configure your emails. Get the attachments ready and 
make sure that they are somehow connectable to your list of recipients (eg. by having some sort of identifier 
in the name like `customer_1234.pdf` and the same identifier in the csv like `John,Doe,1234`).

3. Get your list of recipients and put them into CSV format. Make sure to include a header row as
the names given in the header will be the ones you can use to identify your attachments and
build your email templates.

4. Write your mail template. Use [Handlebars](https://handlebarsjs.com/) for that. Each column name in the CSV 
becomes the variable name for your Handlebars expressions.

5. Run `node personalized-attachment-sender.js` to start a dry run. No mails will be sent. 
Run `node personalized-attachment-sender.js print` to output all mails into files. No mails will be sent.

6. Check the outputs.

7. *Optional*: Use `node personalized-attachment-sender.js run-dev` to send it to the smtp catcher (we recommend https://ethereal.email/)

8. If you're satisfied with your results run `node personalized-attachment-sender.js run-actual`. ***Mails will be sent!***

## Caveats

- Make sure your CSV headers match your handlebars-templates (e.g. CSV header `'Firstname'` matches `{{Firstname}}`). 
Same goes for config string placeholders
