export const testFixture = {
  //Users Collection
  "users/uid-c8" : {
    email: 'c8@cascade8.com',
    uid: 'uid-c8' 
  },
  "users/uid-user2" : {
    email: 'u2@cascade8.com',
    uid: 'uid-user2' 
  },

  //Blockframes Admin
  "blockframesAdmin/uid-c8" : {
  },

  //Notifications
  "notifications/001" : {
      id : "001",
      date : Date.now(),
      toUserId: "uid-c8",
      type: "invitationToAttendEventAccepted",
      docId: "100",
      user: {uid: "uid-user2"},
      organization: {id: "O001"},
      movies: [{id: "M001"}]
  }

}