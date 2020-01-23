export const userMax = {
  uid: '1DI4VrSsitRD29BGPowRPmRkVud2',
  orgId: 'jnbHKBP5YLvRQGcyQ8In'
};

export const userMarie = {
  uid: '1M9DUDBATqayXXaXMYThZGtE9up1',
  orgId: 'jnbHKBP5YLvRQGcyQ8In'
};

export const userGilles = {
  uid: 'NGKwG6VtYXVbAv1xP1O979Y4vtB2',
  orgId: 'e1VXeusNJK6pb8kmVnUn'
};

export const mockData = [
  {
    docPath: 'users/1DI4VrSsitRD29BGPowRPmRkVud2',
    content: {
      email: 'max@c8.com',
      surname: 'F',
      name: 'Max',
      avatar: '',
      uid: '1DI4VrSsitRD29BGPowRPmRkVud2',
      orgId: 'jnbHKBP5YLvRQGcyQ8In'
    }
  },
  {
    docPath: 'users/1M9DUDBATqayXXaXMYThZGtE9up1',
    content: {
      orgId: 'jnbHKBP5YLvRQGcyQ8In',
      email: 'marie@c8.com',
      surname: 'A',
      name: 'Marie',
      avatar: '',
      uid: '1M9DUDBATqayXXaXMYThZGtE9up1'
    }
  },
  {
    docPath: 'orgs/jnbHKBP5YLvRQGcyQ8In',
    content: {
      email: 'team@c8.com',
      fiscalNumber: '',
      name: 'C8',
      activity: 'Dapps Programming',
      id: 'jnbHKBP5YLvRQGcyQ8In',
      catalog: null,
      phoneNumber: '',
      members: [
        {
          avatar: '',
          uid: '1DI4VrSsitRD29BGPowRPmRkVud2',
          orgId: 'jnbHKBP5YLvRQGcyQ8In',
          email: 'max@c8.com',
          surname: 'F',
          name: 'Max'
        },
        {
          avatar: '',
          uid: '1M9DUDBATqayXXaXMYThZGtE9up1',
          orgId: 'jnbHKBP5YLvRQGcyQ8In',
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
      userIds: ['1DI4VrSsitRD29BGPowRPmRkVud2', '1M9DUDBATqayXXaXMYThZGtE9up1'],
      status: 'accepted',
      movieIds: []
    }
  },
  {
    docPath: 'users/NGKwG6VtYXVbAv1xP1O979Y4vtB2',
    content: {
      orgId: 'e1VXeusNJK6pb8kmVnUn',
      email: 'gs@pc.com',
      surname: 'S',
      name: 'Gilles',
      avatar: '',
      uid: 'NGKwG6VtYXVbAv1xP1O979Y4vtB2'
    }
  },
  {
    docPath: 'orgs/e1VXeusNJK6pb8kmVnUn',
    content: {
      email: 'sales@pc.com',
      fiscalNumber: '',
      name: 'PC',
      activity: 'International Sales, Production',
      id: 'e1VXeusNJK6pb8kmVnUn',
      catalog: null,
      phoneNumber: '',
      members: [
        {
          orgId: 'e1VXeusNJK6pb8kmVnUn',
          email: 'gs@pc.com',
          surname: 'S',
          name: 'Gilles',
          avatar: '',
          uid: 'NGKwG6VtYXVbAv1xP1O979Y4vtB2'
        }
      ],
      templateIds: [],
      officeAddress: '',
      updated: 1573138248021,
      wishlist: [],
      logo: '/assets/logo/organisation_avatar_250.svg',
      created: 1573138248021,
      address: '',
      userIds: ['NGKwG6VtYXVbAv1xP1O979Y4vtB2'],
      status: 'accepted',
      movieIds: []
    }
  }
];
