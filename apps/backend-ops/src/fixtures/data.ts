export const testFixture = {
  //Permissions
  "permissions/O001" : {
    "documentPermissions" : {
      "D001" : {
        "ownerId" : 'O001'
      },
      "MI-000": {
        "canCreate": false
      },
      "MI-007": {
        "canCreate": true
      },
      "MI-077": {
        "canCreate": true,
        "ownerId": 'O001'
      }
    },
    "roles": {
      "uid-user2": 'member'
    }
  },

  //Orgs
  "orgs/O001" : {
    "status": 'accepted',           //belongs to O001
  },

  //Users Collection
  "users/uid-c8" : {
    email: 'c8@cascade8.com',
    uid: 'uid-c8' 
  },
  "users/uid-user2" : {
    email: 'u2@cascade8.com',
    uid: 'uid-user2',
    orgId: 'O001'
  },
  "users/uid-peeptom" : {
    email: 'tom@no-org.com',
    uid: 'uid-peeptom',
  },  

  //Blockframes Admin
  "blockframesAdmin/uid-c8" : {
  },

  //Movies
  "movies/M001": {
    "id": 'M001',
    "title": {
      "original": 'UnitTest'
    },
    "distributionRights/DR001": {
      "id": 'DR001'
    }
  },

  "movies/MI-077": {
    "id": 'MI-077',
    "title": {
      "original": 'UnitTest'
    },
    "note": ''
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