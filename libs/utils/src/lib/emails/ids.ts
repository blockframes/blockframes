
// Sendgrid Emails
export const templateIds = {
  // Templates for the account creation flow
  user: {
    // Template for welcome message when user created his account by himself
    welcomeMessage: 'd-fc05a8cf5b1548ebae9ca44247a6c256',

    // Template for informing user who request access app
    appAccessRequest: 'd-a740796b97bf403292b3940804977bbe',

    // Template for sending the verify email
    verifyEmail: 'd-81438bdf511b43cfa866ca63a45a02ae',
    resetPassword: 'd-6a0710945bc841ffb6955e3dc202704c',
    resetPasswordFromCRM: 'd-496956508c64403393a6e5f5e2392e6c',

    // Templates for informing new user that his account have been created
    credentials: {
      attendEvent: 'd-ce3e57248a694cefacad49bc4c820078',
      joinOrganization: 'd-f0c4f1b2582a4fc6ab12fcd2d7c02f5c'
    },
  },
  // Templates for the org management flow
  org: {
    accepted: 'd-8c5f7009cd2f4f1b877fa168b4efde48',
    appAccessChanged: 'd-274b8b8370b44dc2984273d28970a06d',
    memberAdded: 'd-f84d8c5a70884316870ca4ef657e368f',
    memberRemoved: 'd-9913537cf12a497c8959bee844ad0fb7'
  },
  // Templates for requests (invitations)
  request: {
    joinOrganization: {
      created: 'd-b1ab5d21def145ccb759520e2d984436',
      pending: 'd-88665c2583dc46ea85588a39fa8ca1ee',
      accepted: 'd-d32b25a504874a708de6bfc50a1acba7',
      declined: 'd-6fbee372b12243c68edd580b02cbccf7'
    },
    attendEvent: {
      created: 'd-07f5e3cc6796455097b6082c22568d9e',
      accepted: 'd-df7b0a372b994a3090a48dc6cf17ba3e',
      declined: 'd-4e36dd72f50d4e7e9ec738476efa84a9',
      sent: 'd-113048f9990044bbb3c9431f9965f7b8'
    }
  },
  // Templates for invitations
  invitation: {
    attendEvent: {
      created: 'd-1a7cc9ca846c4ae1b4e8cf8a76455cc5',
      accepted: 'd-5d014e60af4c431dbe7316369f41591e',
      declined: 'd-b7ea357cfd41404e9ff82f8d75410079'
    },
    organization: {
      declined: 'd-d3c17695e25a453a98ab5540ea171c5c'
    }
  },
  // Used only in front (see title view component of MF)
  financiers: {
    invest: 'd-e902521de8684c57bbfa633bad88567a'
  },
  eventReminder: {
    oneDay: 'd-0c7bcb6e4a234ddc95ed74b9ecc433dc',
    oneHour: 'd-8a9439a404cc4b51887e9dea44f7fbd7'
  },
  movie: {
    accepted: 'd-bfcf2760bcb7484ab55f864a59331d26'
  },
  offer: {
    created: 'd-94a20b20085842f68fb2d64fe325638a'
  },
  contract: {
    created: 'd-f7c2e13b7d6b427daf08bdfdf904d697'
  }
}

/**
 * This is the ids of the email groups on Sendgrid.
 * We need to pass an id for each template we send to Sendgrid to avoid the default unsubscribe link at the end of the email.
 * Presently, there is only the Reset Password email, the Verification Email and the first invitation email with credentials that are mandatory
*/
export const groupIds = {
  // This is for letting user unsubscribe from every email except the critical ones as reset password.
  allExceptCriticals: 15120,
  // Critical emails that we don't want users to unsusbcribe
  criticalsEmails: 15136,
  // Use this groupId to remove unsubscribe link at mail bottom. Typically for support emails
  // Note, only "text" emails (as opposition to "html") will remove the unsubscribe link
  noUnsubscribeLink: 0
}
