import mailchimp from "@mailchimp/mailchimp_marketing";
import { mailchimpAPIKey, mailchimpServer, mailchimpListId } from './environments/environment';
import { MailchimpTag } from '@blockframes/utils/mailchimp/mailchimp-model';

mailchimp.setConfig({
  apiKey: mailchimpAPIKey,
  server: mailchimpServer,
});

export const registerToNewsletters = async (data: {email: string, tags: MailchimpTag[]}) => {
  const {email: email_address, tags} = data;

  return await mailchimp.lists.addListMember(mailchimpListId, 
    {email_address, 
    tags,
    status: "unsubscribed"}
  );
}