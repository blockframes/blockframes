import mailchimp from "@mailchimp/mailchimp_marketing";
import { mailchimpAPIKey, mailchimpServer, mailchimpListId } from './environments/environment';
import { MailchimpTag } from '@blockframes/utils/mailchimp/mailchimp-model';

mailchimp.setConfig({
  apiKey: mailchimpAPIKey,
  server: mailchimpServer,
});

export const registerToNewsletters = async (data: {email: string, appTag: MailchimpTag[]}) => {
  const {email, appTag} = data;
  
  return await mailchimp.lists.addListMember(mailchimpListId, {
    email_address: email,
    tags: [appTag]
  });
}