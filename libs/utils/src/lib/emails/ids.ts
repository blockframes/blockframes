
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
      attendEvent: 'd-de129a43fb43430a8e1d4e8de4d43e46',
      attendNonPrivateEvent: 'd-13e08d0d89d94cc880a8f40b9880e683',
      joinOrganization: 'd-5c03ed5bde6d40768a44e3d1e1c95b67'
    },
  },
  // Templates for the org management flow
  org: {
    accepted: 'd-8c5f7009cd2f4f1b877fa168b4efde48',
    appAccessChanged: 'd-274b8b8370b44dc2984273d28970a06d',
    memberAdded: 'd-4527b4cf44b747db86fa760408202f34',
    memberRemoved: 'd-a921599689da4c7c9f3b33af2c297a55'
  },
  // Templates for requests (invitations)
  request: {
    joinOrganization: {
      created: 'd-95a9ae5824044c42ae90d804146c5080',
      pending: 'd-a6135fbfa277434e908c3c515cf50692',
      accepted: 'd-4e646560616b4030be5b8fdae4dfc50d'
    },
    attendEvent: {
      created: 'd-bdd7b72c3c6e47d5835f4df3575985b1',
      accepted: 'd-0e1a2cd4b0154476b4ff7baf8efbdc6b',
      declined: 'd-7dae9d381a684a4faa4c1528d239e50b',
      sent: 'd-113048f9990044bbb3c9431f9965f7b8'
    }
  },
  // Templates for invitations
  invitation: {
    attendEvent: {
      created: 'd-ecd4fd15707142cdbb1a72179be9d20b',
      accepted: 'd-65d0309f916942519bd8ec35d1a37040',
      declined: 'd-0fbe1de6a0834430a0683e495a4f2b0a',
      missedScreening: 'd-1d75256d03cf486cac275033ecdcc389',
      attendedScreening: 'd-6a8df635e1ce42e2a2a7ef071f9159fc'
    }
  },
  // Used only in front (see title view component of MF)
  financiers: {
    invest: 'd-3c648c48d33c475e9e03eaf7d8cace05'
  },
  eventReminder: {
    oneDay: 'd-a6ba88218dfd42c3b09a192de2a08f65',
    oneHour: 'd-f43aa663bb9046c99b7fc7c36ddb06e2'
  },
  event: {
    screeningRequested: 'd-52467be7bfdd43c89bec2a1f3cca4374'
  },
  movie: {
    accepted: 'd-bfcf2760bcb7484ab55f864a59331d26',
    askingPriceRequested: 'd-afa28cb76e034d9b969588db5933362f',
    askingPriceRequestSent: 'd-31ba12e3df9946bcb52fefca0c431240'
  },
  offer: {
    toAdmin: 'd-f45a08ce5be94e368f868579fa72afa8',
    toBuyer: 'd-a4ee1970187e4fd8bef47a4008a2267a',
    // #7946 this may be reactivated later
    // allContractsAccepted: 'd-4f067ef3abca42cc9d8dc25b57935ccc', 
    // allContractsDeclined: 'd-c92f8799273f497cb2256eb6ed8baa78',
    // underSignature: 'd-38ee6949f4724b1c8796b8df9229f21d'
  },
  contract: {
    created: 'd-2e90ffb26f2e462ca574dccbc1e80ba2'
  },
  negotiation: {
    receivedCounterOffer: 'd-5826727a7741475cbe120a8ef50e3cc7',
    createdCounterOffer: 'd-a8098e7ac093457ba834397a4657daad',
    myOrgAcceptedAContract: 'd-fd5f02d9b693449db4647b7de9940168',// send to org who accepted the contract
    myContractWasAccepted: 'd-261e5613cbd84c3c99ea49b4f3e8cc20',// send to org whose contract was accepted
    myOrgDeclinedAContract: 'd-022cee72b5904d7386a838d6317054ad',// send to org who declined the contract
    myContractWasDeclined: 'd-b928481ce938423dabb34e50c264d320',// send to org whose contract was declined
    toAdminCounterOffer: 'd-ac1dfcbf692d4ef8888ccad9b6938c8e',
    toAdminContractAccepted: 'd-6750c3d980834301a057403668deceed',
    toAdminContractDeclined: 'd-fba5c684bdbc4187b27b82e2ba703a2a',
  }
}

/**
 * This is the ids of the email groups on Sendgrid.
 * We need to pass an id for each template we send to Sendgrid to avoid the default unsubscribe link at the end of the email.
 * Presently, there is only the Reset Password email, the Verification Email and the first invitation email with credentials that are mandatory
*/
export const groupIds = {
  // This is for letting user unsubscribe from every email except the critical ones as reset password.
  unsubscribeAll: 15120,
  // forceUnsubscribeAll : if we ever need a group to unsubscribe from all email even critical, we will use this namming
  // Critical emails that we don't want users to unsusbcribe
  criticalsEmails: 15136,
  // Use this groupId to remove unsubscribe link at mail bottom. Typically for support emails
  // Note, only "text" emails (as opposition to "html") will remove the unsubscribe link
  noUnsubscribeLink: 0
}
