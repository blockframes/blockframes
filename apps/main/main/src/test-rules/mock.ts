export const userMax = {
  uid: '1DI4000000000000000000000000',
  orgId: 'jnbH0000000000000000'
};

export const userMarie = {
  uid: '1M9D000000000000000000000000',
  orgId: 'jnbH0000000000000000'
};

export const userGilles = {
  uid: 'NGKw000000000000000000000000',
  orgId: 'e1VX0000000000000000'
};

export const userTom = {
  uid: 'uTOM0000000000000000000000000',
  orgId: 'oTOM0000000000000000'
};

export const userVincentBlockframesAdmin = {
  uid: 'MDnN000000000000000000000000',
  orgId: 'jnbH0000000000000000'
};

export const contractAznavour = {
  parties: [
    {
      childRoles: [],
      party: {
        showName: false,
        role: 'licensor',
        orgId: 'e1VX0000000000000000',
        displayName: 'PC'
      },
      status: 'unknown'
    },
    {
      party: { showName: true, role: 'licensee', orgId: 'TBD', displayName: 'BE' },
      status: 'unknown',
      childRoles: []
    }
  ],
  titleIds: ['dYhnPajGZYMEj69Y52E7'],
  childContractIds: [],
  parentContractIds: [],
  type: 'Mandate',
  id: 'aznavourPCSales2',
  partyIds: ['e1VX0000000000000000', 'TBD'],
  documents: { chainOfTitles: [], invoices: [] }
};

export const mockData = [
  // Administration Management
  {
    docPath: 'blockframesAdmin/MDnN000000000000000000000000',
    content: {
      exists: true
    }
  },
  // Users
  {
    docPath: 'users/MDnN000000000000000000000000',
    content: {
      phoneNumber: '',
      position: '',
      orgId: 'jnbH0000000000000000',
      email: 'vincent@cascade8.com',
      name: 'Vincent',
      surname: 'C',
      avatar: '1573117490159_Congrats.png',
      uid: 'MDnN0000000000000000000000000'
    }
  },
  {
    docPath: 'users/1DI4000000000000000000000000',
    content: {
      email: 'max@c8.com',
      surname: 'F',
      name: 'Max',
      avatar: '',
      uid: '1DI4000000000000000000000000',
      orgId: 'jnbH0000000000000000'
    }
  },
  {
    docPath: 'users/1M9D000000000000000000000000',
    content: {
      orgId: 'jnbH0000000000000000',
      email: 'marie@c8.com',
      surname: 'A',
      name: 'Marie',
      avatar: '',
      uid: '1M9D000000000000000000000000'
    }
  },
  {
    docPath: 'users/NGKw000000000000000000000000',
    content: {
      orgId: 'e1VX0000000000000000',
      email: 'gs@pc.com',
      surname: 'S',
      name: 'Gilles',
      avatar: '',
      uid: 'NGKw000000000000000000000000'
    }
  },
  // Organizations
  // c8: with Vincent, Marie, and Max
  {
    docPath: 'orgs/jnbH0000000000000000',
    content: {
      email: 'team@c8.com',
      fiscalNumber: '',
      name: 'C8',
      activity: 'Dapps Programming',
      id: 'jnbH0000000000000000',
      catalog: null,
      phoneNumber: '',
      members: [
        {
          phoneNumber: '',
          position: '',
          orgId: 'jnbH0000000000000000',
          email: 'vincent@c8.com',
          name: 'Vincent',
          surname: 'C',
          avatar: '1573117490159_Congrats.png',
          uid: 'MDnN0000000000000000000000000'
        },
        {
          avatar: '',
          uid: '1DI4000000000000000000000000',
          orgId: 'jnbH0000000000000000',
          email: 'max@c8.com',
          surname: 'F',
          name: 'Max'
        },
        {
          avatar: '',
          uid: '1M9D000000000000000000000000',
          orgId: 'jnbH0000000000000000',
          email: 'marie@c8.com',
          surname: 'A',
          name: 'Marie'
        }
      ],
      templateIds: [],
      officeAddress: '',
      updated: 1573116536848,
      wishlist: [],
      logo: 'logo/1573117231298_logoBF3.jpg',
      created: 1573116536848,
      address: '',
      userIds: ['1DI4000000000000000000000000', '1M9D000000000000000000000000'],
      status: 'accepted',
      movieIds: []
    }
  },
  // pc: with Gilles
  {
    docPath: 'orgs/e1VX0000000000000000',
    content: {
      email: 'sales@pc.com',
      fiscalNumber: '',
      name: 'PC',
      activity: 'International Sales, Production',
      id: 'e1VX0000000000000000',
      catalog: null,
      phoneNumber: '',
      members: [
        {
          orgId: 'e1VX0000000000000000',
          email: 'gs@pc.com',
          surname: 'S',
          name: 'Gilles',
          avatar: '',
          uid: 'NGKw000000000000000000000000'
        }
      ],
      templateIds: [],
      officeAddress: '',
      updated: 1573138248021,
      wishlist: [],
      logo: '/assets/logo/organisation_avatar_250.svg',
      created: 1573138248021,
      address: '',
      userIds: ['NGKw000000000000000000000000'],
      status: 'accepted',
      movieIds: []
    }
  },
  {
    docPath: `contracts/${contractAznavour.id}`,
    content: contractAznavour
  },
  // Permissions
  {
    docPath: `permissions/${userGilles.orgId}/documentPermissions/${contractAznavour.id}`,
    content: {
      canUpdate: true,
      id: contractAznavour.id,
      isAdmin: true,
      ownerId: userGilles.orgId,
      canCreate: true,
      canRead: true,
      canDelete: true
    }
  },
  {
    docPath: `permissions/${userMax.orgId}/documentPermissions/${contractAznavour.id}`,
    content: {
      canUpdate: false,
      id: contractAznavour.id,
      isAdmin: false,
      ownerId: userGilles.orgId,
      canCreate: false,
      canRead: true,
      canDelete: false
    }
  }
];
