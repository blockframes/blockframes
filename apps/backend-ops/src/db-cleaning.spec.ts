import {
  initFunctionsTestMock,
  getTestingProjectId,
  populate,
  AdminAuthMocked
} from '@blockframes/testing/unit-tests';
import {
  cleanMovies,
  cleanOrganizations,
  cleanPermissions,
  cleanDocsIndex,
  cleanNotifications,
  numberOfDaysToKeepNotifications,
  cleanUsers,
  cleanInvitations,
  cleanDeprecatedData,
  auditUsers,
} from './db-cleaning';
import { every } from 'lodash';
import { loadAdminServices } from '@blockframes/firebase-utils';
import { removeUnexpectedUsers } from './users';
import { getCollectionRef } from '@blockframes/firebase-utils';
import { clearFirestoreData } from 'firebase-functions-test/lib/providers/firestore';
import { createPermissions, PermissionsDocument, PublicUser, getAllAppsExcept } from '@blockframes/model';
import { addDays, subDays, subMonths, subYears } from 'date-fns';

type Snapshot = FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>;
let db: FirebaseFirestore.Firestore;
let adminAuth;

describe('DB cleaning script', () => {
  beforeAll(async () => {
    initFunctionsTestMock();
    const adminServices = loadAdminServices();
    db = adminServices.db;
    adminAuth = new AdminAuthMocked();
  });

  afterEach(async () => {
    // After each test, db is reseted
    await clearFirestoreData({ projectId: getTestingProjectId() });
  });

  it('should return true when cleanDeprecatedData is called', async () => {
    const output = await cleanDeprecatedData(db, adminAuth, { verbose: false });
    expect(output).toBeTruthy();
  });

  it('should remove incorrect attributes from users', async () => {
    // User with good org
    const testUser1 = { uid: 'A', email: 'johndoe@fake.com', firstName: 'john', lastName: 'doe', orgId: 'org-A' };

    // User with fake orgId
    const testUser2 = { uid: 'B', email: 'johnmcclain@fake.com', firstName: 'john', lastName: 'mcclain', orgId: 'org-B' };

    const testOrg1 = { id: 'org-A' };

    await Promise.all([
      populate('users', [testUser1, testUser2]),
      populate('orgs', [testOrg1])
    ]);

    adminAuth.users = [
      {
        uid: 'A',
        email: 'johndoe@fake.com',
        providerData: [{ uid: 'A', email: 'johndoe@fake.com', providerId: 'password' }],
        metadata: { creationTime: new Date().toUTCString() }
      },
      {
        uid: 'B',
        email: 'johnmcclain@fake.com',
        providerData: [{ uid: 'B', email: 'johnmcclain@fake.com', providerId: 'password' }],
        metadata: { creationTime: new Date().toUTCString() }
      }
    ];

    const [organizations, usersBefore, permissions] = await Promise.all([
      getCollectionRef('orgs'),
      getCollectionRef('users'),
      getCollectionRef('permissions'),
    ]);

    // Check if data have been correctly added
    expect(usersBefore.docs.length).toEqual(2);
    expect(organizations.docs.length).toEqual(1);
    expect(permissions.docs.length).toEqual(0);

    const organizationIds = organizations.docs.map(ref => ref.id);

    await cleanUsers(usersBefore, organizationIds, permissions, adminAuth);

    const usersAfter: Snapshot = await getCollectionRef('users');
    const cleanedUsers = usersAfter.docs.filter(u => isUserClean(u, organizationIds)).length;

    expect(cleanedUsers).toEqual(2);
  });

  it('should remove inactive users', async () => {
    const now = new Date();
    // User without org created 1 month ago, should be kept
    const oneMonthsAgo = subMonths(now, 1);
    const testUser1 = { uid: 'A', email: 'johndoe@fake.com', firstName: 'john', lastName: 'doe' };

    // User without org created 4 months ago, should be deleted
    const fourMonthsAgo = subMonths(now, 4);
    const testUser2 = { uid: 'B', email: 'johndoe@fake2.com', firstName: 'mickey', lastName: 'mouse' };

    // User that was created more than 3 years ago (3 years and two months) and that never connected within 3 years, should be deleted
    const threeYearsAgo = subYears(now, 3);
    const threeYearsAgoAndTwoMonths = subMonths(threeYearsAgo, 2);
    const testUser3 = { uid: 'C', email: 'johnmcclain@fake.com', firstName: 'john', lastName: 'mcclain', orgId: 'org-A' };

    // User that was created more than 3 years ago (3 years and two months) but connected 3 years ago and 29 days, should be kept
    const threeYearsAgoAnd29Days = subDays(threeYearsAgo, 29);
    const testUser4 = { uid: 'D', email: 'marchammil@fake.com', firstName: 'marc', lastName: 'hammil', orgId: 'org-A' };

    // User that was created more than 5 years ago and connected 3 years ago and 31 days, should be removed
    const fiveYearsAgo = subYears(now, 5);
    const threeYearsAgoAnd31Days = subDays(threeYearsAgo, 31);
    const testUser5 = { uid: 'E', email: 'indianajhones@fake.com', firstName: 'indiana', lastName: 'jhones', orgId: 'org-A' };

    // User without org created 4 months ago, but have logged in last week, should be kept
    const oneWeekAgo = subDays(now, 7);
    const testUser6 = { uid: 'F', email: 'johndoe@fake3.com', firstName: 'winnie', lastName: 'pooh' };

    const testOrg1 = { id: 'org-A' };

    await Promise.all([
      populate('users', [testUser1, testUser2, testUser3, testUser4, testUser5, testUser6]),
      populate('orgs', [testOrg1])
    ]);

    adminAuth.users = [
      {
        uid: 'A',
        email: 'johndoe@fake.com',
        providerData: [{ uid: 'A', email: 'johndoe@fake.com', providerId: 'password' }],
        metadata: { creationTime: oneMonthsAgo.toUTCString() }
      },
      {
        uid: 'B',
        email: 'johndoe@fake2.com',
        providerData: [{ uid: 'B', email: 'johndoe@fake2.com', providerId: 'password' }],
        metadata: { creationTime: fourMonthsAgo.toUTCString() }
      },
      {
        uid: 'C',
        email: 'johnmcclain@fake.com',
        providerData: [{ uid: 'C', email: 'johnmcclain@fake.com', providerId: 'password' }],
        metadata: { creationTime: threeYearsAgoAndTwoMonths.toUTCString() }
      },
      {
        uid: 'D',
        email: 'marchammil@fake.com',
        providerData: [{ uid: 'D', email: 'marchammil@fake.com', providerId: 'password' }],
        metadata: {
          creationTime: threeYearsAgoAndTwoMonths.toUTCString(),
          lastSignInTime: threeYearsAgoAnd29Days.toUTCString(),
        }
      },
      {
        uid: 'E',
        email: 'indianajhones@fake.com',
        providerData: [{ uid: 'E', email: 'indianajhones@fake.com', providerId: 'password' }],
        metadata: {
          creationTime: fiveYearsAgo.toUTCString(),
          lastSignInTime: threeYearsAgoAnd31Days.toUTCString(),
        }
      },
      {
        uid: 'F',
        email: 'johndoe@fake3.com',
        providerData: [{ uid: 'F', email: 'johndoe@fake3.com', providerId: 'password' }],
        metadata: {
          creationTime: fourMonthsAgo.toUTCString(),
          lastSignInTime: oneWeekAgo.toUTCString(),
        }
      }
    ];

    const [organizations, usersBefore, permissions] = await Promise.all([
      getCollectionRef('orgs'),
      getCollectionRef('users'),
      getCollectionRef('permissions')
    ]);

    // Check if data have been correctly added
    expect(usersBefore.docs.length).toEqual(6);
    expect(organizations.docs.length).toEqual(1);
    expect(permissions.docs.length).toEqual(0);

    const organizationIds = organizations.docs.map(ref => ref.id);

    await cleanUsers(usersBefore, organizationIds, permissions, adminAuth);

    const usersAfter: Snapshot = await getCollectionRef('users');
    const cleanedDbUsers = usersAfter.docs.filter(u => isUserClean(u, organizationIds));
    const cleanedAuthUsers = await adminAuth.listUsers();

    expect(cleanedDbUsers.length).toEqual(3);

    // Auth should have same size
    expect(cleanedAuthUsers.users.length).toEqual(cleanedDbUsers.length);

    // Users A, D & F should be kept
    expect(cleanedDbUsers.find(o => o.data().uid === 'A')).toBeTruthy();
    expect(cleanedDbUsers.find(o => o.data().uid === 'D')).toBeTruthy();
    expect(cleanedDbUsers.find(o => o.data().uid === 'F')).toBeTruthy();

    expect(cleanedAuthUsers.users.find(o => o.uid === 'A')).toBeTruthy();
    expect(cleanedAuthUsers.users.find(o => o.uid === 'D')).toBeTruthy();
    expect(cleanedAuthUsers.users.find(o => o.uid === 'F')).toBeTruthy();

  });

  it('should not remove inactive user if superAdmin of his org', async () => {
    const now = new Date();
    const fiveYearsAgo = subYears(now, 5);
    const threeYearsAgo = subYears(now, 3);
    const threeYearsAgoAnd31Days = subDays(threeYearsAgo, 31);

    // User that was created more than 5 years ago and connected 3 years ago and 31 days
    // should be kept because he is superAdmin of his org
    const testUser1 = { uid: 'A', email: 'indianajhones@fake.com', firstName: 'indiana', lastName: 'jhones', orgId: 'org-A' };

    // User that was created more than 5 years ago and connected 3 years ago and 31 days
    // should be removed because he is not superAdmin of his org
    const testUser2 = { uid: 'B', email: 'marchammil@fake.com', firstName: 'marc', lastName: 'hammil', orgId: 'org-A' };

    const testOrg1 = { id: 'org-A' };

    const testPermissions1 = createPermissions({ ...testOrg1, roles: { A: 'superAdmin', B: 'member' } });

    adminAuth.users = [
      {
        uid: 'A',
        email: 'indianajhones@fake.com',
        providerData: [{ uid: 'A', email: 'indianajhones@fake.com', providerId: 'password' }],
        metadata: {
          creationTime: fiveYearsAgo.toUTCString(),
          lastSignInTime: threeYearsAgoAnd31Days.toUTCString(),
        }
      },
      {
        uid: 'B',
        email: 'marchammil@fake.com',
        providerData: [{ uid: 'B', email: 'marchammil@fake.com', providerId: 'password' }],
        metadata: {
          creationTime: fiveYearsAgo.toUTCString(),
          lastSignInTime: threeYearsAgoAnd31Days.toUTCString(),
        }
      }
    ];

    await Promise.all([
      populate('users', [testUser1, testUser2]),
      populate('orgs', [testOrg1]),
      populate('permissions', [testPermissions1])
    ]);

    const [organizations, usersBefore, permissions] = await Promise.all([
      getCollectionRef('orgs'),
      getCollectionRef('users'),
      getCollectionRef('permissions'),
    ]);

    // Check if data have been correctly added
    expect(usersBefore.docs.length).toEqual(2);
    expect(organizations.docs.length).toEqual(1);
    expect(permissions.docs.length).toEqual(1);

    const organizationIds = organizations.docs.map(ref => ref.id);

    await cleanUsers(usersBefore, organizationIds, permissions, adminAuth);

    const usersAfter: Snapshot = await getCollectionRef('users');
    const cleanedDbUsers = usersAfter.docs.filter(u => isUserClean(u, organizationIds));
    const cleanedAuthUsers = await adminAuth.listUsers();

    expect(cleanedDbUsers.length).toEqual(1);

    // Auth should have same size
    expect(cleanedAuthUsers.users.length).toEqual(cleanedDbUsers.length);

    // Users A should be kept
    expect(cleanedDbUsers.find(o => o.data().uid === 'A')).toBeTruthy();
    expect(cleanedAuthUsers.users.find(o => o.uid === 'A')).toBeTruthy();
  });

  it('should remove unexpected users from auth', async () => {
    const now = new Date();

    const users = [
      { uid: 'A', email: 'A@fake.com' },
      { uid: 'B', email: 'B@fake.com' },
      { uid: 'C', email: 'C@fake.com' },
    ];

    // Load our test set
    await populate('users', users);

    // Check if data have been correctly added
    const usersBefore = await getCollectionRef('users');
    expect(usersBefore.docs.length).toEqual(3);

    // See auth users
    adminAuth.users = [
      { uid: 'A', email: 'A@fake.com', providerData: [{ uid: 'A', email: 'A@fake.com', providerId: 'password' }] },
      { uid: 'B', email: 'B@fake.com', providerData: [{ uid: 'B', email: 'B@fake.com', providerId: 'password' }] },
      { uid: 'C', email: 'C@fake.com', providerData: [{ uid: 'C', email: 'C@fake.com', providerId: 'password' }] },
    ];

    // Add a new auth user that is not on db
    const fakeAuthUser = { uid: 'D', email: 'D@fake.com', providerData: [{ uid: 'D', email: 'D@fake.com', providerId: 'password' }] };
    adminAuth.users.push(fakeAuthUser);

    // Add an anonymous user that should not be deleted even if not on DB (created 3 months ago minus a day)
    const threeMonthsAgo = subMonths(now, 3);
    const threeMonthsAgoMinusADay = addDays(threeMonthsAgo, 1);
    const anonymousUser = { uid: 'anonymous', providerData: [], metadata: { creationTime: new Date(threeMonthsAgoMinusADay).toUTCString() } };
    adminAuth.users.push(anonymousUser);

    // Add an anonymous user that should not be deleted because account was created 5 months ago and last connexion is 2 months ago
    const fiveMonthsAgo = subMonths(now, 5);
    const twoMonthsAgo = subMonths(now, 2);
    const anonymousUser2 = {
      uid: 'anonymous2',
      providerData: [],
      metadata: {
        creationTime: fiveMonthsAgo.toUTCString(),
        lastSignInTime: twoMonthsAgo.toUTCString(),
      }
    };
    adminAuth.users.push(anonymousUser2);

    // Add an anonymous user that should be deleted because account was created 5 months ago and last connexion is 3 months and a day ago
    const threeMonthsAgoAndADay = subDays(threeMonthsAgo, 1);
    const anonymousUser3 = {
      uid: 'anonymous3',
      providerData: [],
      metadata: {
        creationTime: fiveMonthsAgo.toUTCString(),
        lastSignInTime: threeMonthsAgoAndADay.toUTCString(),
      }
    };
    adminAuth.users.push(anonymousUser3);

    const authBefore = await adminAuth.listUsers();
    expect(authBefore.users.length).toEqual(7);

    await removeUnexpectedUsers(usersBefore.docs.map(u => u.data() as PublicUser), adminAuth);

    // An user should have been removed from auth because it is not in DB.
    const authAfter = await adminAuth.listUsers();
    expect(authAfter.users.length).toEqual(5);

    // Check if the good user (uid: 'D') have been removed.
    const deletedUser1 = await adminAuth.getUserByEmail(fakeAuthUser.email);
    expect(deletedUser1).toEqual(undefined);

    // Check if the good user (uid: 'anonymousUser3') have been removed.
    const deletedUser2 = await adminAuth.getUser(anonymousUser3.uid);
    expect(deletedUser2).toEqual(undefined);

  });

  it('should smoothly delete users that are not in auth', async () => {

    // User with no orgId
    const testUser1 = { uid: 'A', email: 'johndoe@fake.com' };
    // User with fake orgId
    const testUser2 = { uid: 'B', email: 'johnmcclain@fake.com', orgId: 'fake-org-id' };

    // Set empty auth
    adminAuth.users = [];

    // Load our test set : only one user
    await populate('users', [testUser1, testUser2]);

    // Check if users have been correctly added
    const [usersBefore, permissions] = await Promise.all([
      getCollectionRef('users'),
      getCollectionRef('permissions')
    ]);

    expect(usersBefore.docs.length).toEqual(2);
    expect(permissions.docs.length).toEqual(0);

    await cleanUsers(usersBefore, [], permissions, adminAuth);

    // Check if user have been correctly removed
    const usersAfter = await getCollectionRef('users');
    expect(usersAfter.docs.length).toEqual(0);

  });

  it('should clean organizations', async () => {
    const testUsers = [{ uid: 'A', email: 'A@fake.com' }, { uid: 'B', email: 'B@fake.com' }, { uid: 'C', email: 'C@fake.com' }, { uid: 'D', email: 'D@fake.com' }];
    const testMovies = [
      {
        id: 'mov-A', app: {
          catalog: { status: 'accepted', access: true },
          festival: { status: 'draft', access: false },
          financiers: { status: 'draft', access: false }
        }
      },
      {
        id: 'mov-B', app: {
          catalog: { status: 'draft', access: true },
          festival: { status: 'draft', access: false },
          financiers: { status: 'draft', access: false }
        }
      },
      {
        id: 'mov-C', app: {
          catalog: { status: 'refused', access: false },
          festival: { status: 'draft', access: false },
          financiers: { status: 'draft', access: false }
        }
      }
    ];

    const testOrgs = [
      { id: 'org-A', email: 'org-A@fake.com', members: [testUsers[0]], userIds: [testUsers[0].uid] },
      { id: 'org-B', email: 'org-B@fake.com', members: [testUsers[1]], userIds: [testUsers[1].uid, 'fakeUid'], wishlist: [] },
      { id: 'org-C', email: 'org-C@fake.com', userIds: [testUsers[2].uid], wishlist: ['mov-C', 'mov-D', 'mov-A'] },
      { id: 'org-D', email: 'org-D@fake.com', userIds: [testUsers[3].uid], wishlist: ['mov-B'] }
    ];

    // Load our test set
    await Promise.all([
      populate('users', testUsers),
      populate('orgs', testOrgs),
      populate('movies', testMovies)
    ]);

    const [users, organizationsBefore, movies] = await Promise.all([
      getCollectionRef('users'),
      getCollectionRef('orgs'),
      getCollectionRef('movies')
    ]);

    // Check if data have been correctly added
    expect(users.docs.length).toEqual(4);
    expect(organizationsBefore.docs.length).toEqual(4);
    expect(movies.docs.length).toEqual(3);

    const userIds = users.docs.map(ref => ref.id);

    await cleanOrganizations(organizationsBefore, userIds, movies);

    const organizationsAfter: Snapshot = await getCollectionRef('orgs');
    const cleanedOrgs = organizationsAfter.docs.filter(m => isOrgClean(m, userIds, movies));
    expect(cleanedOrgs.length).toEqual(testOrgs.length);

    const orgA = cleanedOrgs.find(o => o.data().id === 'org-A');
    expect(orgA.data().userIds.length).toEqual(1);

    const orgB = cleanedOrgs.find(o => o.data().id === 'org-B');
    expect(orgB.data().wishlist.length).toEqual(0);
    expect(orgB.data().userIds.length).toEqual(1);

    const orgC = cleanedOrgs.find(o => o.data().id === 'org-C');
    expect(orgC.data().wishlist.length).toEqual(1);
    expect(orgC.data().wishlist[0]).toEqual('mov-A');

    const orgD = cleanedOrgs.find(o => o.data().id === 'org-D');
    expect(orgD.data().wishlist.length).toEqual(0);
  });

  it('should remove orgs with no users', async () => {
    const testUsers = [
      { uid: 'A', email: 'A@fake.com' },
      { uid: 'B', email: 'B@fake.com' },
      { uid: 'C', email: 'C@fake.com' }
    ];

    const testOrgs = [
      { id: 'org-A', email: 'org-A@fake.com', userIds: [testUsers[0].uid, testUsers[1].uid], wishlist: [] },
      { id: 'org-B', email: 'org-B@fake.com', userIds: [], wishlist: [] },
      { id: 'org-C', email: 'org-C@fake.com', userIds: [testUsers[2].uid], wishlist: [] },
    ];

    // Load our test set
    await Promise.all([
      populate('users', testUsers),
      populate('orgs', testOrgs)
    ]);

    const [users, organizationsBefore, movies] = await Promise.all([
      getCollectionRef('users'),
      getCollectionRef('orgs'),
      getCollectionRef('movies')
    ]);

    // Check if data have been correctly added
    expect(users.docs.length).toEqual(3);
    expect(organizationsBefore.docs.length).toEqual(3);

    const userIds = users.docs.map(ref => ref.id);

    await cleanOrganizations(organizationsBefore, userIds, movies);

    const organizationsAfter: Snapshot = await getCollectionRef('orgs');
    const cleanedOrgs = organizationsAfter.docs.filter(m => isOrgClean(m, userIds, movies));
    expect(cleanedOrgs.length).toEqual(2);

    const orgsWithNoUsers = organizationsAfter.docs.filter(o => o.data().userIds.length === 0);
    expect(orgsWithNoUsers.length).toEqual(0);
  });

  it('should remove permissions not belonging to existing org', async () => {

    const testPermissions = [{ id: 'org-A', roles: {} }, { id: 'org-B', roles: {} }];
    const testOrgs = [{ id: 'org-A' }];

    // Load our test set
    await Promise.all([
      populate('permissions', testPermissions),
      populate('orgs', testOrgs)
    ]);

    const [permissionsBefore, organizations] = await Promise.all([
      getCollectionRef('permissions'),
      getCollectionRef('orgs'),
    ]);

    // Check if data have been correctly added
    expect(permissionsBefore.docs.length).toEqual(2);
    expect(organizations.docs.length).toEqual(1);

    const organizationIds = organizations.docs.map(ref => ref.id);

    await cleanPermissions(permissionsBefore, organizationIds, [], db);
    const permissionsAfter: Snapshot = await getCollectionRef('permissions');
    expect(permissionsAfter.docs.length).toEqual(1);
    expect(permissionsAfter.docs[0].data().id).toEqual('org-A');
  });

  it('should clean permissions documents from un-existing users', async () => {

    const testPermissions = [{ id: 'org-A', roles: { A: {}, B: {} } }];
    const testOrgs = [{ id: 'org-A' }];
    const testUsers = [{ uid: 'A', email: 'A@fake.com' }];

    // Load our test set
    await Promise.all([
      populate('permissions', testPermissions),
      populate('orgs', testOrgs),
      populate('users', testUsers)
    ]);

    const [permissionsBefore, organizations, users] = await Promise.all([
      getCollectionRef('permissions'),
      getCollectionRef('orgs'),
      getCollectionRef('users'),
    ]);

    // Check if data have been correctly added
    expect(permissionsBefore.docs.length).toEqual(1);
    expect(organizations.docs.length).toEqual(1);
    expect(users.docs.length).toEqual(1);

    const organizationIds = organizations.docs.map(ref => ref.id);
    const userIds = users.docs.map(ref => ref.id);

    await cleanPermissions(permissionsBefore, organizationIds, userIds, db);
    const permissionsAfter: Snapshot = await getCollectionRef('permissions');
    const permissionDoc = permissionsAfter.docs[0].data() as PermissionsDocument;
    expect(Object.keys(permissionDoc.roles).length).toEqual(1);
    expect(permissionDoc.roles.A).toEqual({});
  });

  it('should remove documents undefined or not linked to existing document from docsIndex (movies, events, orgs)', async () => {

    const testDocsIndex = [
      // Valid ones
      { id: 'mov-A', authorOrgId: 'org-A' },
      { id: 'event-A', authorOrgId: 'org-A' },

      // Invalid ones
      { id: 'undefined', authorOrgId: 'org-A' },
      { id: 'mov-B', authorOrgId: 'org-B' },
      { id: 'mov-C', authorOrgId: 'org-A' },
      { id: 'event-B', authorOrgId: 'org-B' },
      { id: 'event-C', authorOrgId: 'org-A' },
    ];

    const testMovies = [{ id: 'mov-A' }, { id: 'mov-B' }];
    const testEvents = [{ id: 'event-A' }, { id: 'event-B' }];
    const testOrgs = [{ id: 'org-A' }];

    // Load our test set
    await Promise.all([
      populate('movies', testMovies),
      populate('events', testEvents),
      populate('orgs', testOrgs),
      populate('docsIndex', testDocsIndex)
    ]);

    const [docsIndexBefore, movies, events, orgs] = await Promise.all([
      getCollectionRef('docsIndex'),
      getCollectionRef('movies'),
      getCollectionRef('events'),
      getCollectionRef('orgs')
    ]);

    // Check if data have been correctly added
    expect(docsIndexBefore.docs.length).toEqual(7);
    expect(movies.docs.length).toEqual(2);
    expect(events.docs.length).toEqual(2);
    expect(orgs.docs.length).toEqual(1);

    const moviesAndEventsIds = movies.docs.map(m => m.id).concat(events.docs.map(e => e.id));
    const organizationIds = orgs.docs.map(o => o.id);

    await cleanDocsIndex(docsIndexBefore, moviesAndEventsIds, organizationIds);
    const docsIndexAfter: Snapshot = await getCollectionRef('docsIndex');
    expect(docsIndexAfter.docs.length).toEqual(2);
  });

  it('should delete notifications that are too old', async () => {
    const now = new Date();
    const testNotifications = [
      {
        id: 'notif-A',
        toUserId: 'A',
        // Should be kept
        _meta: { createdAt: { _seconds: now.getTime() / 1000 } },
        type: 'requestToAttendEventSent',
        docId: 'A',
        user: { uid: 'A' }
      },
      {
        id: 'notif-B',
        toUserId: 'A',
        // Just to the limit, should be kept
        _meta: { createdAt: { _seconds: 30 + subDays(now, numberOfDaysToKeepNotifications).getTime() / 1000 } },
        type: 'requestToAttendEventSent',
        docId: 'A',
        user: { uid: 'A' }
      },
      {
        id: 'notif-C',
        toUserId: 'A',
        // Should be removed
        _meta: { createdAt: { _seconds: subDays(now, numberOfDaysToKeepNotifications + 1).getTime() / 1000 } },
        type: 'requestToAttendEventSent',
        docId: 'A',
        user: { uid: 'A' }
      },
    ];

    const testUsers = [{ uid: 'A', email: 'A@fake.com' }];

    // Load our test set
    await Promise.all([
      populate('notifications', testNotifications),
      populate('users', testUsers),
    ]);

    const [notificationsBefore, users] = await Promise.all([
      getCollectionRef('notifications'),
      getCollectionRef('users')
    ]);

    // Check if data have been correctly added
    expect(notificationsBefore.docs.length).toEqual(3);
    expect(users.docs.length).toEqual(1);

    const documentIds = users.docs.map(d => d.id);

    await cleanNotifications(notificationsBefore, documentIds);
    const notificationsAfter: Snapshot = await getCollectionRef('notifications');

    expect(notificationsAfter.docs.length).toEqual(2);
  });

  it('should keep notifications related to existing users, invitations, events, offers, movies and orgs ', async () => {
    const currentTimestamp = new Date().getTime() / 1000;

    const _meta = { createdAt: { _seconds: currentTimestamp } };

    const testNotifications = [
      // Valid ones
      { id: 'notif-A', toUserId: 'A', _meta },
      { id: 'notif-B', toUserId: 'A', _meta, user: { uid: 'A' } },
      { id: 'notif-C', toUserId: 'A', _meta, invitation: { id: 'invit-A' } },
      { id: 'notif-D', toUserId: 'A', _meta, docId: 'event-A' },
      { id: 'notif-E', toUserId: 'A', _meta, docId: 'offer-A' },
      { id: 'notif-F', toUserId: 'A', _meta, docId: 'movie-A' },
      { id: 'notif-G', toUserId: 'A', _meta, organization: { id: 'org-A' } },
      { id: 'notif-H', toUserId: 'A', _meta, docId: 'org-A' },
      { id: 'notif-I', toUserId: 'A', _meta, bucket: { id: 'org-A' } }, // Bucket Ids are org Ids
      { id: 'notif-J', toUserId: 'A', _meta, invitation: { id: 'invit-A' }, organization: { id: 'org-A' } },
      { id: 'notif-V', toUserId: 'A', _meta, offerId: 'offer-A' },
      { id: 'notif-X', toUserId: 'A', _meta, docId: 'contract-A' },

      // Invalids ones
      { id: 'notif-K', toUserId: 'B', _meta },
      { id: 'notif-L', toUserId: 'A', _meta, user: { uid: 'B' } },
      { id: 'notif-M', toUserId: 'A', _meta, invitation: { id: 'invit-B' } },
      { id: 'notif-N', toUserId: 'A', _meta, docId: 'event-B' },
      { id: 'notif-O', toUserId: 'A', _meta, docId: 'offer-B' },
      { id: 'notif-P', toUserId: 'A', _meta, docId: 'movie-B' },
      { id: 'notif-Q', toUserId: 'A', _meta, organization: { id: 'org-B' } },
      { id: 'notif-R', toUserId: 'A', _meta, docId: 'org-B' },
      { id: 'notif-S', toUserId: 'A', _meta, bucket: { id: 'org-B' } },
      { id: 'notif-T', toUserId: 'A', _meta, invitation: { id: 'invit-B' }, organization: { id: 'org-A' } },
      { id: 'notif-U', toUserId: 'A', _meta, invitation: { id: 'invit-A' }, organization: { id: 'org-B' } },
      { id: 'notif-W', toUserId: 'A', _meta, offerId: 'offer-B' },
      { id: 'notif-Y', toUserId: 'A', _meta, docId: 'contract-B' },
    ];

    const testUsers = [{ uid: 'A' }];
    const testInvitations = [{ id: 'invit-A' }];
    const testEvents = [{ id: 'event-A' }];
    const testOffers = [{ id: 'offer-A' }];
    const testMovies = [{ id: 'movie-A' }];
    const testOrgs = [{ id: 'org-A' }];
    const testContracts = [{ id: 'contract-A' }];

    // Load our test set
    await Promise.all([
      populate('notifications', testNotifications),
      populate('users', testUsers),
      populate('invitations', testInvitations),
      populate('events', testEvents),
      populate('offers', testOffers),
      populate('movies', testMovies),
      populate('orgs', testOrgs),
      populate('buckets', testOrgs),
      populate('contracts', testContracts),
    ]);

    const [notificationsBefore, users, invitations, events, offers, movies, orgs, buckets, contracts] = await Promise.all([
      getCollectionRef('notifications'),
      getCollectionRef('users'),
      getCollectionRef('invitations'),
      getCollectionRef('events'),
      getCollectionRef('offers'),
      getCollectionRef('movies'),
      getCollectionRef('orgs'),
      getCollectionRef('buckets'),
      getCollectionRef('contracts'),
    ]);

    // Check if data have been correctly added
    expect(notificationsBefore.docs.length).toEqual(25);
    expect(users.docs.length).toEqual(1);
    expect(invitations.docs.length).toEqual(1);
    expect(events.docs.length).toEqual(1);
    expect(offers.docs.length).toEqual(1);
    expect(movies.docs.length).toEqual(1);
    expect(orgs.docs.length).toEqual(1);
    expect(buckets.docs.length).toEqual(1);
    expect(contracts.docs.length).toEqual(1);

    const documentIds = users.docs.map(d => d.id)
      .concat(invitations.docs.map(d => d.id))
      .concat(events.docs.map(d => d.id))
      .concat(offers.docs.map(d => d.id))
      .concat(movies.docs.map(d => d.id))
      .concat(orgs.docs.map(d => d.id))
      .concat(contracts.docs.map(d => d.id));

    await cleanNotifications(notificationsBefore, documentIds);
    const notificationsAfter: Snapshot = await getCollectionRef('notifications');

    expect(notificationsAfter.docs.length).toEqual(12);
  });

  it('should update notifications with related documents data', async () => {
    const currentTimestamp = new Date().getTime() / 1000;
    const testNotifications = [
      {
        id: 'notif-A',
        toUserId: 'A',
        _meta: { createdAt: { _seconds: currentTimestamp } },
        type: 'requestToAttendEventSent',
        docId: 'A',
        user: { uid: 'A' }
      },
      {
        id: 'notif-B',
        toUserId: 'B',
        _meta: { createdAt: { _seconds: currentTimestamp } },
        type: 'requestToAttendEventSent',
        docId: 'A',
        user: { uid: 'B' }
      },
      {
        id: 'notif-C',
        toUserId: 'B',
        _meta: { createdAt: { _seconds: currentTimestamp } },
        type: 'organizationAcceptedByArchipelContent',
        organization: { id: 'org-A' }
      },
    ];

    const testUsers = [
      { uid: 'A', email: 'A@fake.com', avatar: 'A.png' },
      { uid: 'B', email: 'B@fake.com', avatar: 'B.png' }
    ];

    const testOrgs = [{ id: 'org-A', email: 'org-A@fake.com', logo: 'org-A.svg' }];

    // Load our test set
    await Promise.all([
      populate('notifications', testNotifications),
      populate('users', testUsers),
      populate('orgs', testOrgs),
    ]);

    const [notificationsBefore, users, orgs] = await Promise.all([
      getCollectionRef('notifications'),
      getCollectionRef('users'),
      getCollectionRef('orgs')
    ]);

    // Check if data have been correctly added
    expect(notificationsBefore.docs.length).toEqual(3);
    expect(users.docs.length).toEqual(2);
    expect(orgs.docs.length).toEqual(1);

    const documentIds = users.docs.map(d => d.id).concat(orgs.docs.map(d => d.id));

    await cleanNotifications(notificationsBefore, documentIds);
    const notificationsAfter: Snapshot = await getCollectionRef('notifications');

    const cleanOutput = notificationsAfter.docs.map(d => isNotificationClean(d));
    expect(every(cleanOutput)).toEqual(true);
  });

  it('should delete invitations to a deleted event and keep outdated but valid events', async () => {
    const currentTimestamp = new Date().getTime() / 1000;
    const testInvitations = [
      {
        id: 'invit-A',
        type: 'attendEvent',
        eventId: 'event-C', // event-C does not exists, should be removed
        fromOrg: { id: 'org-A' },
        toUser: { uid: 'A' },
      },
      {
        id: 'invit-B',
        type: 'attendEvent',
        eventId: 'event-B',
        toOrg: { id: 'org-A' },
        fromUser: { uid: 'A' },
      },
      {
        id: 'invit-C',
        type: 'attendEvent',
        eventId: 'event-B',
        toOrg: { id: 'org-B' }, // org-B doest not exists, should be removed
        fromUser: { uid: 'A' },
      },
      {
        id: 'invit-D',
        type: 'attendEvent',
        eventId: 'event-B',
        toOrg: { id: 'org-A' },
        fromUser: { uid: 'B' }, // B doest not exists, should be removed
      }
    ];

    const testEvents = [
      {
        id: 'event-B',
        // Outdated by 30 seconds, but should be kept since we keep old invitations to make some stats
        end: { _seconds: currentTimestamp - 30 },
      }
    ];

    const testUsers = [{ uid: 'A', email: 'A@fake.com' }];
    const testOrgs = [{ id: 'org-A', email: 'org-A@fake.com' }];

    // Load our test set
    await Promise.all([
      populate('invitations', testInvitations),
      populate('events', testEvents),
      populate('users', testUsers),
      populate('orgs', testOrgs),
    ]);

    const [invitationsBefore, events, users, orgs] = await Promise.all([
      getCollectionRef('invitations'),
      getCollectionRef('events'),
      getCollectionRef('users'),
      getCollectionRef('orgs')
    ]);

    // Check if data have been correctly added
    expect(invitationsBefore.docs.length).toEqual(4);
    expect(events.docs.length).toEqual(1);
    expect(users.docs.length).toEqual(1);
    expect(orgs.docs.length).toEqual(1);

    const documentIds = users.docs.map(d => d.id)
      .concat(events.docs.map(d => d.id))
      .concat(orgs.docs.map(d => d.id));


    await cleanInvitations(invitationsBefore, documentIds);
    const invitationsAfter: Snapshot = await getCollectionRef('invitations');

    expect(invitationsAfter.docs.length).toEqual(1);
    expect(invitationsAfter.docs[0].id).toEqual('invit-B');
  });

  it('should delete not pending joinOrganization invitations older than n days', async () => {
    const now = new Date();
    const testInvitations = [
      {
        id: 'invit-A',
        status: 'pending',
        // Should be kept even if date is passed because of the pending status
        date: { _seconds: subDays(now, numberOfDaysToKeepNotifications + 1).getTime() / 1000 },
        type: 'joinOrganization',
        fromOrg: { id: 'org-A' },
        toUser: { uid: 'A' },
      },
      {
        id: 'invit-B',
        status: 'accepted',
        // Should be removed
        date: { _seconds: subDays(now, numberOfDaysToKeepNotifications + 1).getTime() / 1000 },
        type: 'joinOrganization',
        toOrg: { id: 'org-A' },
        fromUser: { uid: 'A' },
      },
      {
        id: 'invit-C',
        status: 'accepted',
        // Just to the limit, should be kept
        date: { _seconds: 30 + subDays(now, numberOfDaysToKeepNotifications).getTime() / 1000 },
        type: 'joinOrganization',
        toOrg: { id: 'org-A' },
        fromUser: { uid: 'A' },
      }
    ];

    const testUsers = [{ uid: 'A', email: 'A@fake.com' }];
    const testOrgs = [{ id: 'org-A', email: 'org-A@fake.com' }];

    // Load our test set
    await Promise.all([
      populate('invitations', testInvitations),
      populate('users', testUsers),
      populate('orgs', testOrgs)
    ]);

    const [invitationsBefore, users, orgs] = await Promise.all([
      getCollectionRef('invitations'),
      getCollectionRef('users'),
      getCollectionRef('orgs')
    ]);

    // Check if data have been correctly added
    expect(invitationsBefore.docs.length).toEqual(3);
    expect(users.docs.length).toEqual(1);
    expect(orgs.docs.length).toEqual(1);

    const documentIds = users.docs.map(d => d.id).concat(orgs.docs.map(d => d.id));

    await cleanInvitations(invitationsBefore, documentIds);
    const invitationsAfter: Snapshot = await getCollectionRef('invitations');

    expect(invitationsAfter.docs.length).toEqual(2);
  });

  it('should update invitations with related documents data', async () => {
    const currentTimestamp = new Date().getTime() / 1000;

    const testInvitations = [
      {
        id: 'invit-A',
        status: 'pending',
        date: { _seconds: currentTimestamp },
        type: 'joinOrganization',
        fromOrg: { id: 'org-A', watermark: 'test' },
        toUser: { uid: 'A' },
      },
      {
        id: 'invit-B',
        status: 'accepted',
        date: { _seconds: currentTimestamp },
        type: 'joinOrganization',
        toOrg: { id: 'org-A' },
        fromUser: { uid: 'A', watermark: 'test' },
      },
      {
        id: 'invit-C',
        status: 'accepted',
        date: { _seconds: currentTimestamp },
        type: 'joinOrganization',
        toOrg: { id: 'org-A' },
        fromUser: { uid: 'B' },
      }
    ];

    const testUsers = [
      { uid: 'A', email: 'A@fake.com', avatar: 'A.png' },
      { uid: 'B', email: 'B@fake.com', avatar: 'B.png' }
    ];

    const testOrgs = [{ id: 'org-A', email: 'org-A@fake.com', logo: 'org-A.svg' }];

    // Load our test set
    await Promise.all([
      populate('invitations', testInvitations),
      populate('users', testUsers),
      populate('orgs', testOrgs),
    ]);

    const [invitationsBefore, users, orgs] = await Promise.all([
      getCollectionRef('invitations'),
      getCollectionRef('users'),
      getCollectionRef('orgs')
    ]);

    // Check if data have been correctly added
    expect(invitationsBefore.docs.length).toEqual(3);
    expect(users.docs.length).toEqual(2);
    expect(orgs.docs.length).toEqual(1);

    const documentIds = users.docs.map(d => d.id).concat(orgs.docs.map(d => d.id));

    await cleanInvitations(invitationsBefore, documentIds);
    const invitationsAfter: Snapshot = await getCollectionRef('invitations');

    const cleanOutput = invitationsAfter.docs.map(d => isInvitationClean(d));
    expect(every(cleanOutput)).toEqual(true);
  });

  it('should remove duplicates in org.userIds', async () => {
    const testUsers = [{ uid: 'A', email: 'A@fake.com' }, { uid: 'B', email: 'B@fake.com' }, { uid: 'C', email: 'C@fake.com' }, { uid: 'D', email: 'D@fake.com' }];
    const testOrgs = [
      { id: 'org-A', email: 'org-A@fake.com', userIds: [testUsers[0].uid, testUsers[1].uid, testUsers[0].uid, testUsers[2].uid] },
      { id: 'org-B', email: 'org-B@fake.com', userIds: [testUsers[1].uid, testUsers[3].uid] },
      { id: 'org-C', email: 'org-C@fake.com', userIds: [testUsers[1].uid, testUsers[2].uid, testUsers[2].uid, testUsers[3].uid, testUsers[2].uid] },
    ];

    // Load our test set
    await Promise.all([
      populate('users', testUsers),
      populate('orgs', testOrgs)
    ]);

    const [users, organizationsBefore, movies] = await Promise.all([
      getCollectionRef('users'),
      getCollectionRef('orgs'),
      getCollectionRef('movies')
    ]);

    // Check if data have been correctly added
    expect(users.docs.length).toEqual(4);
    expect(organizationsBefore.docs.length).toEqual(3);
    expect(movies.docs.length).toEqual(0);

    const userIds = users.docs.map(ref => ref.id);

    await cleanOrganizations(organizationsBefore, userIds, movies);

    const organizationsAfter: Snapshot = await getCollectionRef('orgs');

    const orgA = organizationsAfter.docs.find(o => o.data().id === 'org-A');
    expect(orgA.data().userIds.length).toEqual(3);

    const orgB = organizationsAfter.docs.find(o => o.data().id === 'org-B');
    expect(orgB.data().userIds.length).toEqual(2);

    const orgC = organizationsAfter.docs.find(o => o.data().id === 'org-C');
    expect(orgC.data().userIds.length).toEqual(3);
  });

  it('should remove duplicates in org.wishlist', async () => {

    const testUsers = [
      { uid: 'A', email: 'A@fake.com' },
      { uid: 'B', email: 'B@fake.com' },
      { uid: 'C', email: 'C@fake.com' }
    ];

    const testOrgs = [
      { id: 'org-A', email: 'org-A@fake.com', userIds: [testUsers[0].uid], wishlist: ['mov-A', 'mov-A', 'mov-C'] },
      { id: 'org-B', email: 'org-B@fake.com', userIds: [testUsers[1].uid], wishlist: ['mov-B', 'mov-B'] },
      { id: 'org-C', email: 'org-C@fake.com', userIds: [testUsers[2].uid], wishlist: ['mov-B', 'mov-A', 'mov-C'] },
    ];
    const testMovies = [
      {
        id: 'mov-A', app: {
          catalog: { status: 'accepted', access: true },
          festival: { status: 'accepted', access: true },
          financiers: { status: 'accepted', access: true }
        }
      },
      {
        id: 'mov-B', app: {
          catalog: { status: 'accepted', access: true },
          festival: { status: 'accepted', access: true },
          financiers: { status: 'accepted', access: true }
        }
      },
      {
        id: 'mov-C', app: {
          catalog: { status: 'accepted', access: true },
          festival: { status: 'accepted', access: true },
          financiers: { status: 'accepted', access: true }
        }
      }
    ];
    // Load our test set
    await Promise.all([
      populate('orgs', testOrgs),
      populate('movies', testMovies),
      populate('users', testUsers)
    ]);

    const [organizationsBefore, movies, users] = await Promise.all([
      getCollectionRef('orgs'),
      getCollectionRef('movies'),
      getCollectionRef('users'),
    ]);

    // Check if data have been correctly added
    expect(organizationsBefore.docs.length).toEqual(3);
    expect(movies.docs.length).toEqual(3);
    expect(users.docs.length).toEqual(3);

    const userIds = users.docs.map(ref => ref.id);

    await cleanOrganizations(organizationsBefore, userIds, movies);

    const organizationsAfter: Snapshot = await getCollectionRef('orgs');

    const orgA = organizationsAfter.docs.find(o => o.data().id === 'org-A');
    expect(orgA.data().wishlist.length).toEqual(2);

    const orgB = organizationsAfter.docs.find(o => o.data().id === 'org-B');
    expect(orgB.data().wishlist.length).toEqual(1);
    expect(orgB.data().wishlist[0]).toEqual('mov-B');

    const orgC = organizationsAfter.docs.find(o => o.data().id === 'org-C');
    expect(orgC.data().wishlist.length).toEqual(3);
  });

  it('should remove duplicates in movie.orgIds', async () => {
    const testMovies = [
      { id: 'mov-A', orgIds: ['org-A', 'org-B', 'org-A'] },
      { id: 'mov-B', orgIds: ['org-A', 'org-B', 'org-C'] },
      { id: 'mov-C', orgIds: ['org-B', 'org-B', 'org-B'] },
    ];

    const testOrgs = [
      { id: 'org-A', email: 'org-A@fake.com', userIds: [], wishlist: [] },
      { id: 'org-B', email: 'org-B@fake.com', userIds: [], wishlist: [] },
      { id: 'org-C', email: 'org-C@fake.com', userIds: [], wishlist: [] },
    ];

    await Promise.all([
      populate('movies', testMovies),
      populate('orgs', testOrgs)
    ]);

    const [moviesBefore, orgs] = await Promise.all([
      getCollectionRef('movies'),
      getCollectionRef('orgs'),
    ]);

    expect(moviesBefore.docs.length).toEqual(3);
    expect(orgs.docs.length).toEqual(3);

    await cleanMovies(moviesBefore, orgs.docs.map(o => o.id));
    const moviesAfter: Snapshot = await getCollectionRef('movies');

    const movA = moviesAfter.docs.find(o => o.data().id === 'mov-A');
    expect(movA.data().orgIds.length).toEqual(2);

    const movB = moviesAfter.docs.find(o => o.data().id === 'mov-B');
    expect(movB.data().orgIds.length).toEqual(3);

    const movC = moviesAfter.docs.find(o => o.data().id === 'mov-C');
    expect(movC.data().orgIds.length).toEqual(1);
  });

  it('should remove un-existing orgs in movie.orgIds', async () => {
    const testMovies = [
      { id: 'mov-A', orgIds: ['org-A', 'org-B'] },
      { id: 'mov-B', orgIds: ['org-A', 'org-B', 'org-C'] },
      { id: 'mov-C', orgIds: ['org-C'] },
    ];

    const testOrgs = [
      { id: 'org-A', email: 'org-A@fake.com', userIds: [], wishlist: [] },
      { id: 'org-B', email: 'org-B@fake.com', userIds: [], wishlist: [] },
    ];

    await Promise.all([
      populate('movies', testMovies),
      populate('orgs', testOrgs)
    ]);

    const [moviesBefore, orgs] = await Promise.all([
      getCollectionRef('movies'),
      getCollectionRef('orgs'),
    ]);

    expect(moviesBefore.docs.length).toEqual(3);
    expect(orgs.docs.length).toEqual(2);

    await cleanMovies(moviesBefore, orgs.docs.map(o => o.id));
    const moviesAfter: Snapshot = await getCollectionRef('movies');

    const movA = moviesAfter.docs.find(o => o.data().id === 'mov-A');
    expect(movA.data().orgIds.length).toEqual(2);

    const movB = moviesAfter.docs.find(o => o.data().id === 'mov-B');
    expect(movB.data().orgIds.length).toEqual(2);

    const movC = moviesAfter.docs.find(o => o.data().id === 'mov-C');
    expect(movC.data().orgIds.length).toEqual(0);
  });

  it('should return true when auditUsers is called', async () => {
    const output = await auditUsers(db, adminAuth);
    expect(output).toBeTruthy();
  });

  it('Auditing users should not update AUTH nor DB', async () => {
    const now = new Date();

    const oneMonthsAgo = subMonths(now, 1);
    const testUser1 = { uid: 'A', email: 'johndoe@fake.com', firstName: 'john', lastName: 'doe' };

    const fourMonthsAgo = subMonths(now, 4);
    const testUser2 = { uid: 'B', email: 'johndoe@fake2.com', firstName: 'mickey', lastName: 'mouse' };

    const threeYearsAgo = subYears(now, 3);
    const threeYearsAgoAndTwoMonths = subMonths(threeYearsAgo, 2);
    const testUser3 = { uid: 'C', email: 'johnmcclain@fake.com', firstName: 'john', lastName: 'mcclain', orgId: 'org-A' };

    const threeYearsAgoAnd29Days = subDays(threeYearsAgo, 29);
    const testUser4 = { uid: 'D', email: 'marchammil@fake.com', firstName: 'marc', lastName: 'hammil', orgId: 'org-fake' };

    const fiveYearsAgo = subYears(now, 5);
    const threeYearsAgoAnd31Days = subDays(threeYearsAgo, 31);
    const testUser5 = { uid: 'E', email: 'indianajhones@fake.com', firstName: 'indiana', lastName: 'jhones', orgId: 'org-A' };

    await populate('users', [testUser1, testUser2, testUser3, testUser4, testUser5]);

    const testOrg1 = { id: 'org-A' };
    await populate('orgs', [testOrg1]);

    adminAuth.users = [
      {
        uid: 'A',
        email: 'johndoe@fake.com',
        providerData: [{ uid: 'A', email: 'johndoe@fake.com', providerId: 'password' }],
        metadata: { creationTime: oneMonthsAgo.toUTCString() }
      },
      {
        uid: 'B',
        email: 'johndoe@fake2.com',
        providerData: [{ uid: 'B', email: 'johndoe@fake2.com', providerId: 'password' }],
        metadata: { creationTime: fourMonthsAgo.toUTCString() }
      },
      {
        uid: 'C',
        email: 'johnmcclain@fake.com',
        providerData: [{ uid: 'C', email: 'johnmcclain@fake.com', providerId: 'password' }],
        metadata: { creationTime: threeYearsAgoAndTwoMonths.toUTCString() }
      },
      {
        uid: 'D',
        email: 'marchammil@fake.com',
        providerData: [{ uid: 'D', email: 'marchammil@fake.com', providerId: 'password' }],
        metadata: {
          creationTime: threeYearsAgoAndTwoMonths.toUTCString(),
          lastSignInTime: threeYearsAgoAnd29Days.toUTCString(),
        }
      },
      {
        uid: 'E',
        email: 'indianajhones@fake.com',
        providerData: [{ uid: 'E', email: 'indianajhones@fake.com', providerId: 'password' }],
        metadata: {
          creationTime: fiveYearsAgo.toUTCString(),
          lastSignInTime: threeYearsAgoAnd31Days.toUTCString(),
        }
      }
    ];

    const [organizations, usersBefore] = await Promise.all([
      getCollectionRef('orgs'),
      getCollectionRef('users')
    ]);

    // Check if data have been correctly added
    expect(usersBefore.docs.length).toEqual(5);
    expect(organizations.docs.length).toEqual(1);

    await auditUsers(db, adminAuth);

    const usersAfter: Snapshot = await getCollectionRef('users');
    const authUsersAfter = await adminAuth.listUsers();

    expect(usersAfter.docs.length).toEqual(5);

    // Auth should have same size
    expect(authUsersAfter.users.length).toEqual(usersAfter.docs.length);

    // OrgId should not have been removed
    expect(usersAfter.docs.filter(u => u.data().orgId).length).toEqual(3);
  });

});

function isOrgClean(
  doc: FirebaseFirestore.DocumentSnapshot,
  existingUserIds: string[],
  existingMovies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
) {
  const o = doc.data();
  if (o.members !== undefined) {
    return false;
  }

  const existingAndValidMovieIds = existingMovies.docs.filter(m => {
    const movie = m.data();
    return getAllAppsExcept(['crm']).some(appli => movie.app[appli].status === 'accepted');
  }).map(m => m.id);

  const { userIds = [], wishlist = [] } = o;

  const validUserIds = userIds.filter(userId => existingUserIds.includes(userId));
  const validMovieIds = wishlist.filter(movieId => existingAndValidMovieIds.includes(movieId));

  if (userIds.length === 0) {
    // Org must have at least one user (admin)
    return false;
  }

  if (validUserIds.length !== userIds.length) {
    return false;
  }

  if (validMovieIds.length !== wishlist.length) {
    return false;
  }

  return true;
}

function isNotificationClean(doc: FirebaseFirestore.DocumentSnapshot) {
  const d = doc.data();
  if (d.user && !d.user.avatar) {
    return false;
  }

  if (d.organization && !d.organization.logo) {
    return false;
  }

  const notificationTimestamp = d._meta.createdAt.toMillis();
  if (notificationTimestamp < subDays(Date.now(), numberOfDaysToKeepNotifications)) {
    return false;
  }

  return true;
}

function isInvitationClean(doc: FirebaseFirestore.DocumentSnapshot) {
  const d = doc.data();
  if (d.fromOrg?.id && (!d.fromOrg.logo)) {
    return false;
  }

  if (d.toOrg?.id && (!d.toOrg.logo)) {
    return false;
  }

  if (d.fromUser?.uid && (!d.fromUser.avatar || d.fromUser.watermark)) {
    return false;
  }

  if (d.toUser?.uid && (!d.toUser.avatar || d.toUser.watermark)) {
    return false;
  }

  return true;
}

function isUserClean(doc: FirebaseFirestore.DocumentSnapshot, organizationIds: string[]) {
  const d = doc.data();

  if (d.orgId && !organizationIds.includes(d.orgId)) {
    return false;
  }

  return true;
}