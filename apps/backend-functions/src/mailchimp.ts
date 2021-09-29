import { mailchimpAPIKey, mailchimpServer, mailchimpListId } from './environments/environment';
import { MailchimpTag } from '@blockframes/utils/mailchimp/mailchimp-model';

let _mailchimp;

async function getMailChimp() {
  if (!_mailchimp) {
    _mailchimp = await import("@mailchimp/mailchimp_marketing").then(mailchimp => mailchimp.default);
  }
  return _mailchimp
}

export const registerToNewsletters = async (data: {email: string, tags: MailchimpTag[]}) => {
  const {email: email_address, tags} = data;
  const mailchimp = await getMailChimp();

  mailchimp.setConfig({
    apiKey: mailchimpAPIKey,
    server: mailchimpServer,
  });

  return await mailchimp.lists.addListMember(mailchimpListId, 
    {email_address, 
    tags,
    status: "unsubscribed"}
  );
}