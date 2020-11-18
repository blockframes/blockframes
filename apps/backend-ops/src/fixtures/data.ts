﻿export const testFixture = {
  //Permissions
  "permissions/O001" : {
    "roles": {
      "uid-admin": 'admin',
      "uid-user2": 'member',
      "uid-super-admin": 'superAdmin'
    }
  },

  "permissions/O001/documentPermissions/D001" : {
    "ownerId" : 'O001'
  },
  "permissions/O001/documentPermissions/MI-000": {
    "canCreate": false
  },
  "permissions/O001/documentPermissions/MI-007": {
     "canCreate": true,
     "canDelete": true,
  },
  "permissions/O001/documentPermissions/MI-0d7": {
    "canDelete": true,
    "ownerId": 'O001'
  },  
  "permissions/O001/documentPermissions/MI-077": {
    "canUpdate": true,
    "canCreate": true,
    "ownerId": 'O001'
  },

  //Orgs
  "orgs/O001" : {
    "status": 'accepted',           //belongs to O001
  },

  //Users Collection
  "users/uid-super-admin" : {
    email: 'admin@cascade8.com',
    uid: 'uid-super-admin',
    orgId: 'O001'
  },  
  "users/uid-admin" : {
    email: 'admin@cascade8.com',
    uid: 'uid-admin',
    orgId: 'O001'
  },
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
  "movies/MI-0d7": {
    "id": 'MI-0d7',
    "title": {
      "original": 'UnitTest Eraser'
    },
  },
  "movies/MI-077": {
    "id": 'MI-077',
    "title": {
      "original": 'UnitTest'
    },
    "note": ''
  },

  "events/E001": {
    "id": 'E001'
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