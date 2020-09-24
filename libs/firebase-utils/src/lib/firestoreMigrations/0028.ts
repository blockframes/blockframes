// @ts-nocheck
import { Firestore, Storage } from '../types';
import { Credit } from '@blockframes/utils/common-interfaces';
import { sanitizeFileName } from '@blockframes/utils/file-sanitizer';
import { InvitationDocument, NotificationDocument } from 'apps/backend-functions/src/data/types';  // @TODO (#3471) remove this call to backend-functions
import { upsertWatermark, } from '../watermark';
import { runChunks } from '../firebase-utils';
import { OldImgRef, OldPublicOrganization, OldPublicUser, OldMovieImgRefDocument } from './old-types';
import { firebase } from '@env';
export const { storageBucket } = firebase;

import {
  createOldHostedMedia as createHostedMedia,
  OldNewPromotionalElement as PromotionalElement
} from './old-types';

const EMPTY_REF: OldImgRef = {
  ref: '',
  urls: { original: '' }
};

/**
 * Migrate old ImgRef objects to new one.
 */
export async function upgrade(db: Firestore, storage: Storage) {
  console.log('//////////////');
  console.log('// Processing users');
  console.log('//////////////');
  await db
    .collection('users')
    .get()
    .then(async users => await updateUsers(users, storage));

  console.log('//////////////');
  console.log('// Processing orgs');
  console.log('//////////////');
  await db
    .collection('orgs')
    .get()
    .then(async orgs => await updateOrganizations(orgs, storage));

  console.log('//////////////');
  console.log('// Processing movies');
  console.log('//////////////');
  await db
    .collection('movies')
    .get()
    .then(async movies => await updateMovies(movies, storage));

  console.log('//////////////');
  console.log('// Processing notifications');
  console.log('//////////////');
  await db
    .collection('notifications')
    .get()
    .then(async notifs => await updateNotifications(notifs));

  console.log('//////////////');
  console.log('// Processing invitations');
  console.log('//////////////');
  await db
    .collection('invitations')
    .get()
    .then(async invits => await updateInvitations(invits));

  console.log('Updating ImgRef in users, organizations, movies, notifications and invitations done.');
}

async function updateUsers(
  users: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  storage: Storage
) {
  return runChunks(users.docs, async (doc) => {
    const updatedUser = await updateUserAvatarAndWaterMark(doc.data() as OldPublicUser, storage);
    await doc.ref.set(updatedUser);
  });
}

async function updateNotifications(notifications: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>) {
  return runChunks(notifications.docs, async (doc) => {
    const notification = doc.data() as NotificationDocument;

    if (notification.organization) {
      (notification.organization.logo as any) = createHostedMedia();
    } else if (notification.user) {
      (notification.user.avatar as any) = createHostedMedia();
    }
    await doc.ref.update(notification);
  });
}

async function updateInvitations(invitations: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>) {
  return runChunks(invitations.docs, async (doc) => {
    const invitation = doc.data() as InvitationDocument;

    if (invitation.fromOrg) {
      (invitation.fromOrg.logo as any) = createHostedMedia();
    }
    if (invitation.toOrg) {
      (invitation.toOrg.logo as any) = createHostedMedia();
    }
    if (invitation.fromUser) {
      (invitation.fromUser.avatar as any) = createHostedMedia();
    }
    if (invitation.toUser) {
      (invitation.toUser.avatar as any) = createHostedMedia();
    }
    await doc.ref.update(invitation);

  });
}

async function updateOrganizations(
  organizations: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  storage: Storage
) {
  return runChunks(organizations.docs, async (doc) => {
    const updatedOrg = await updateOrgLogo(doc.data() as OldPublicOrganization, storage);
    await doc.ref.set(updatedOrg);
  });
}

async function updateMovies(
  movies: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  storage: Storage
) {
  return runChunks(movies.docs, async (doc) => {
    const movie = doc.data() as OldMovieImgRefDocument;

    const keys = ['banner', 'poster', 'still_photo'];

    for (const key of keys) {
      if (!!movie.promotionalElements[key]) {
        const value: PromotionalElement | PromotionalElement[] = movie.promotionalElements[key];
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            movie.promotionalElements[key][i] = await updateMovieField(value[i], 'media', storage);
          }
        } else {
          movie.promotionalElements[key] = await updateMovieField(value, 'media', storage);
        }
      }
    }

    for (const key in movie.salesCast) {
      const value: Credit[] = movie.salesCast[key];
      for (let i = 0; i < value.length; i++) {
        movie.salesCast[key][i] = await updateMovieField(value[i], 'avatar', storage);
      }
    }

    for (const key in movie.main.stakeholders) {
      const value: Credit[] = movie.main.stakeholders[key];
      for (let i = 0; i < value.length; i++) {
        movie.main.stakeholders[key][i] = await updateMovieField(value[i], 'logo', storage);
      }
    }

    for (let i = 0; i < movie.main.directors.length; i++) {
      movie.main.directors[i] = await updateMovieField(movie.main.directors[i], 'avatar', storage);
    }
    await doc.ref.set(movie);

  });

}

const updateMovieField = async <T extends Credit | PromotionalElement>(
  value: T,
  imgRefFieldName: 'avatar' | 'logo' | 'media',
  storage: Storage
): Promise<T> => {
  const newImageRef = await updateImgRef(value, imgRefFieldName, storage);
  value[imgRefFieldName] = newImageRef;
  return value;
}

const updateUserAvatarAndWaterMark = async (user: OldPublicUser, storage: Storage) => {
  try {
    const newImageRef = await updateImgRef(user, 'avatar', storage);
    user.avatar = newImageRef;
    await upsertWatermark(user as any, storageBucket); // upsertWatermark only require uid, email, firstName, lastName, witch are also present in OldPublicUser
  } catch (e) {
    console.log(`Error while updating user ${user.uid}. Reason: ${e.message}`);
  }

  return user;
};

const updateOrgLogo = async (org: OldPublicOrganization, storage: Storage) => {
  const newImageRef = await updateImgRef(org, 'logo', storage);
  org.logo = newImageRef;
  return org;
};

const updateImgRef = async (
  element: OldPublicUser | OldPublicOrganization | Credit | PromotionalElement,
  key: 'logo' | 'avatar' | 'media' | 'watermark',
  storage: Storage
): Promise<OldImgRef> => {

  // get the current ref
  const media = element[key]; // get old ImgRef format

  // ## if it's empty:
  if (!media || !media.ref || typeof media === 'string') {
    // just put an empty ref
    return EMPTY_REF;
  }

  // ### get the old file
  const { ref } = media as OldImgRef;

  // ### copy it to a new location
  const bucket = storage.bucket(storageBucket);

  try {
    const from = bucket.file(ref);

    const [exists] = await from.exists();
    const fileName = ref.split('/').pop();
    const to = bucket.file(ref.replace(fileName, sanitizeFileName(ref)));

    if (exists) {
      console.log(`copying ${ref}`);
      await from.copy(to);
      console.log('copy OK');

      const [signedUrl] = await to.getSignedUrl({ action: 'read', expires: '01-01-3000', version: 'v2' });

      // delete previous image
      await from.delete();
      console.log('Removed previous');

      media.urls.original = signedUrl;
      return media;
    } else {
      console.log('Empty ref');
      return EMPTY_REF;
    }

  } catch (e) {
    console.log('Empty ref');
    return EMPTY_REF;
  }
}
