import { getPrivateVideoUrl, ReadVideoParams, deleteFromJWPlayer, uploadToJWPlayer } from './player';
import { CallableContextOptions } from 'firebase-functions-test/lib/main';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { getTestingProjectId, initFunctionsTestMock, populate } from '@blockframes/testing/unit-tests';
import { clearFirestoreData } from 'firebase-functions-test/lib/providers/firestore';
import { StorageVideo } from '@blockframes/model';
import type * as admin from 'firebase-admin';
import { jwplayerApiV2Secret, jwplayerKey, testVideoId } from './environments/environment';
import { getStorage, jwplayerApiV2, sleep } from '@blockframes/firebase-utils';

const testInvitations = [
  {
    id: 'invit-A',
    type: 'attendEvent',
    eventId: 'eventTestPrivate',
    status: 'accepted',
    mode: 'invitation',
    toUser: { uid: 'uidUserA' },
  },
  {
    id: 'invit-B',
    type: 'attendEvent',
    eventId: 'eventTestInvitOnly',
    status: 'accepted',
    mode: 'invitation',
    toUser: { email: 'marc@hamill.com' },
  }
];
const testEvents = [
  {
    id: 'eventTestPrivate',
    type: 'screening',
    start: new Date(),
    meta: {
      titleId: 'movieA'
    },
    end: new Date(),
    ownerOrgId: 'idOrgTest',
    accessibility: 'private'
  },
  {
    id: 'eventTestInvitOnly',
    type: 'screening',
    start: new Date(),
    meta: {
      titleId: 'movieA'
    },
    end: new Date(),
    ownerOrgId: 'idOrgTest',
    accessibility: 'protected'
  },
  {
    id: 'eventTestPublic',
    type: 'screening',
    start: new Date(),
    meta: {
      titleId: 'movieA'
    },
    end: new Date(),
    ownerOrgId: 'idOrgTest',
    accessibility: 'public'
  }
];

const userA = {
  uid: 'uidUserA',
  email: 'A@fake.com',
  orgId: 'fakeOrgId',
  firstName: 'foo',
  lastName: 'bar'
};

const userB = {
  uid: 'uidUserB',
  email: 'B@fake.com',
  orgId: 'orgIdA',
  firstName: 'foo',
  lastName: 'bar'
};

const userC = {
  uid: 'uidUserC',
  email: 'B@fake.com',
  orgId: 'orgIdC',
  firstName: 'foo',
  lastName: 'bar'
};

const testUsers = [userA, userB, userC];

const screener = {
  jwPlayerId: testVideoId,
  privacy: 'protected',
  docId: 'movieA',
  field: 'promotional.videos.screener',
  storagePath: 'movies/movieA/promotional.videos.screener/default.mp4',
  collection: 'movies',
} as StorageVideo;

const testMovies = [
  {
    id: 'movieA',
    promotional: { videos: { screener } },
    orgIds: ['orgIdA']
  }
];

const videoParams: ReadVideoParams = { video: screener, eventId: 'eventTestPrivate', email: userA.email };

let storage: admin.storage.Storage;

describe('JwPlayer test script', () => {
  beforeAll(async () => {
    initFunctionsTestMock();
    storage = getStorage();
  });

  afterEach(async () => {
    // After each test, db is reseted
    await clearFirestoreData({ projectId: getTestingProjectId() });
  });

  it('should retreive jwPlayerId, check status is processing and delete video', async () => {
    const fileName = `unit-tests/${Math.random().toString(36).substr(2)}.avi`;
    const [file] = await storage.bucket().upload('apps/festival/festival-e2e/src/fixtures/default-video.avi', { destination: fileName });
    const fileObject = storage.bucket().file(fileName);

    const [exists] = await fileObject.exists();
    expect(exists).toBeTruthy();

    const output = await uploadToJWPlayer(file);

    expect(output.success).toBe(true);
    expect(output.key).toBeDefined();
    expect(output.key).not.toEqual(testVideoId);

    const videoInfos = await jwplayerApiV2(jwplayerKey, jwplayerApiV2Secret).getVideoInfo(output.key);

    expect(videoInfos.status).toEqual('processing');

    await deleteFromJWPlayer(output.key);

    const videoInfosAfter: any = await jwplayerApiV2(jwplayerKey, jwplayerApiV2Secret).getVideoInfo(output.key);

    expect(videoInfosAfter.errors[0].code).toEqual('not_found');

    await file.delete();

    const [existsAfterDelete] = await fileObject.exists();
    expect(existsAfterDelete).toBeFalsy();
  });

  it('should throw error when auth is null', async () => {
    // Load our test set
    try {
      await populateAndGetPrivateVideoUrl(null, null);
    } catch (e) {
      expect(e).toMatchObject(new Error('Unauthorized call !'));
    }
  });

  it('should return error when video is not defined', async () => {
    testEvents[0].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const output = await populateAndGetPrivateVideoUrl({ ...videoParams, video: undefined });
    expect(output.error).toEqual('UNKNOWN_VIDEO');
  });

  it('private event - should return error when user is not invited', async () => {
    testEvents[0].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const output = await populateAndGetPrivateVideoUrl(null, { uid: 'uidUserTestNotInvited' });
    expect(output.error).toEqual('UNAUTHORIZED');
  });

  it('private event - should be successful when user is invited', async () => {
    testEvents[0].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const output = await populateAndGetPrivateVideoUrl();
    expect(output.error).toEqual('');
  });

  it('private event - should be successful when user is not invited but in good org', async () => {
    testEvents[0].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const output = await populateAndGetPrivateVideoUrl({ ...videoParams, eventId: 'eventTestPrivate', email: undefined }, { uid: 'uidUserB' });
    expect(output.error).toEqual('');
  });

  it('protected event - should return error when user is not invited', async () => {
    testEvents[1].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const output = await populateAndGetPrivateVideoUrl(null, { uid: 'uidUserTestNotInvited' });
    expect(output.error).toEqual('UNAUTHORIZED');
  });

  it('protected event - should be successful when user is invited', async () => {
    testEvents[1].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const output = await populateAndGetPrivateVideoUrl({ ...videoParams, eventId: 'eventTestInvitOnly', email: 'marc@hamill.com' }, { uid: 'uidMarcHamill' });
    expect(output.error).toEqual('');
  });

  it('protected event - should be successful when user is not invited but in good org', async () => {
    testEvents[1].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const output = await populateAndGetPrivateVideoUrl({ ...videoParams, eventId: 'eventTestInvitOnly', email: undefined }, { uid: 'uidUserB' });
    expect(output.error).toEqual('');
  });

  it('public event - should be successful if user is connected (anonymous)', async () => {
    testEvents[2].end.setHours(new Date().getHours() + 4);
    // Load our test set
    const output = await populateAndGetPrivateVideoUrl({ ...videoParams, eventId: 'eventTestPublic', email: undefined }, { uid: 'uidNotInvited' });
    expect(output.error).toEqual('');
  });

  it('public event - should return error if user is not connected', async () => {
    testEvents[2].end.setHours(new Date().getHours() + 4);
    // Load our test set
    try {
      await populateAndGetPrivateVideoUrl({ ...videoParams, eventId: 'eventTestPublic', email: undefined }, null);
    } catch (e) {
      expect(e).toMatchObject(new Error('Unauthorized call !'));
    }
  });

  it('should be successful if user is in good org', async () => {
    // Load our test set
    const output = await populateAndGetPrivateVideoUrl({ ...videoParams, eventId: undefined, email: undefined }, { uid: 'uidUserB' });
    expect(output.error).toEqual('');
  });

  it('should return error if user is not in good org', async () => {
    // Load our test set
    const output = await populateAndGetPrivateVideoUrl({ ...videoParams, eventId: undefined, email: undefined }, { uid: 'uidUserC' });
    expect(output.error).toEqual('UNAUTHORIZED');
  });
})

async function populateAndGetPrivateVideoUrl(videoParamsTest = null, uid = { uid: 'uidUserA' }) {
  const invitation = populate('invitations', testInvitations);
  const events = populate('events', testEvents);
  const users = populate('users', testUsers);
  const movies = populate('movies', testMovies);
  await Promise.all([invitation, events, users, movies]);
  const testCallbackContext: CallableContextOptions = { auth: uid };
  return await getPrivateVideoUrl(videoParamsTest || videoParams, testCallbackContext as CallableContext);
}
