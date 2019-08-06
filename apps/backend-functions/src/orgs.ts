/**
 * Organization-related code,
 *
 * Right now this is solely used to update our algolia index (full-text search on org names).
 */
import { functions, db } from './internals/firebase';
import { deleteSearchableOrg, storeSearchableOrg } from './internals/algolia';
import { sendMail } from './internals/email';
import { organizationCreated } from './assets/mail-templates';
import { Organization, OrganizationStatus } from './data/types';
import { precomputeAddress, emailToEnsDomain, RelayerConfig, relayerDeployOrganizationLogic, relayerRegisterENSLogic, isENSNameRegistred } from './relayer';
import { mnemonic, relayer } from './environments/environment';

export function onOrganizationCreate(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
): Promise<any> {
  const org = snap.data();
  const orgID = context.params.orgID;

  if (!org || !org.name) {
    console.error('Invalid org data:', org);
    throw new Error('organization update function got invalid org data');
  }

  return Promise.all([
    // Send a mail to c8 admin to accept the organization
    sendMail(organizationCreated(org.id)),
    // Update algolia's index
    storeSearchableOrg(orgID, org.name)
  ]);
}

const RELAYER_CONFIG: RelayerConfig = {
  ...relayer,
  mnemonic
};
export async function onOrganizationUpdate(
  change: functions.Change<FirebaseFirestore.DocumentSnapshot>,
  context: functions.EventContext
): Promise<any> {
  const before = change.before.data() as Organization;
  const after = change.after.data() as Organization;

  if (!before || !after || !after.name) {
    console.error('Invalid org data, before:', before, 'after:', after);
    throw new Error('organization update function got invalid org data');
  }

  // Update algolia's index
  if (before.name !== after.name) {
    throw new Error('Organization name cannot be changed !'); // this will require to change the org ENS name, for now we throw to prevent silent bug
    // const orgID = context.params.orgID;
    // await storeSearchableOrg(orgID, after.name); // update org name on algolia
  }

  // console.log(before, '****************************' ,after);
  // Deploy org's smart-contract
  if (before.status === OrganizationStatus.pending && after.status === OrganizationStatus.accepted) {
    const { userIds } = before as Organization;
    const admin = await db.collection('users').doc(userIds[0]).get().then(adminSnapShot => adminSnapShot.data()!); // TODO use laurent's code after the merge of PR #698

    const adminENS = emailToEnsDomain(admin.email, RELAYER_CONFIG.baseEnsDomain);
    const orgENS = emailToEnsDomain(before.name.replace(' ', '-'), RELAYER_CONFIG.baseEnsDomain);
    const isOrgRegistred = await isENSNameRegistred(adminENS, RELAYER_CONFIG);
    if (isOrgRegistred) {
      throw new Error(`This organization has already an ENS name : ${adminENS}`);
    }
    const adminAddress = await precomputeAddress(emailToEnsDomain(admin.email, RELAYER_CONFIG.baseEnsDomain), RELAYER_CONFIG);
    const orgAddress =  await relayerDeployOrganizationLogic(adminAddress, RELAYER_CONFIG); // TODO promise all
    console.log(`org ${orgENS} deployed @ ${orgAddress} !`);
    const res = await relayerRegisterENSLogic({name: orgENS, address: orgAddress}, RELAYER_CONFIG);
    console.log('Org deployed and registred !', orgAddress, res['link'].transactionHash);
  }

  return Promise.resolve(true); // no-op by default
}

export function onOrganizationDelete(
  snap: FirebaseFirestore.DocumentSnapshot,
  context: functions.EventContext
): Promise<any> {
  // Update algolia's index
  return deleteSearchableOrg(context.params.orgID);
}
