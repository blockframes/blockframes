import { Bucket, Organization, bucketsToCrmBuckets, crmBucketsToExport } from '@blockframes/model';
import { airtable } from './internals/airtable';
import { tables } from '@env';

export async function updateAirtableBuckets(buckets: Bucket[], orgs: Organization[]) {
  console.log('===== Updating buckets =====');

  const crmBuckets = bucketsToCrmBuckets(buckets, orgs);

  const rows = crmBucketsToExport(crmBuckets, 'airtable');

  const synchronization = await airtable.synchronize(tables.buckets, rows, 'bucket reference');
  console.log(synchronization);
}
