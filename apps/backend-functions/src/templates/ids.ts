
// Sendgrid Emails
export const templateIds = {
  // Templates for the account creation flow
  user: {
    // Template for welcome message when user created his account by himself
    welcomeMessage: 'd-fc05a8cf5b1548ebae9ca44247a6c256',

    // Template for sending the verify email
    verifyEmail: 'd-81438bdf511b43cfa866ca63a45a02ae',
    resetPassword: 'd-6a0710945bc841ffb6955e3dc202704c',

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
  },
  // Templates for requests (invitations)
  request: {
    joinOrganization: {
      created: 'd-b1ab5d21def145ccb759520e2d984436',
      pending: 'd-88665c2583dc46ea85588a39fa8ca1ee',
      accepted: 'd-d32b25a504874a708de6bfc50a1acba7',
    },
    attendEvent: {
      created: 'd-07f5e3cc6796455097b6082c22568d9e',
      accepted: 'd-df7b0a372b994a3090a48dc6cf17ba3e',
    }
  },
  // Templates for invitations
  invitation: {
    attendEvent: {
      created: 'd-1a7cc9ca846c4ae1b4e8cf8a76455cc5'
    }
  },
  financiers: {
    invest: 'd-e902521de8684c57bbfa633bad88567a'
  }
}
