export const titleInvest = 'Movie 3';

export const discussionData = {
  subject: 'Main',
  scope: {
    from: 123,
    to: 456
  },
  message: 'This is the first E2E test email on Media Financiers !'
}


export const strEmail = (nameRecipient, nameinvestor, orgName, emailinvestor, title, min, max, cc='$') =>
`Hi ${nameRecipient},*

${nameinvestor} (${orgName}) would like to know more about *${title}*.

Your potential investor left you a message:
" This is the first E2E test email on Media Financiers ! "

Potential investment range goes from ${cc}${min} to ${cc}${max}.

You can contact that person at ${emailinvestor}\n
Best regards

The Media Financiers team`;
