import { BigQuery } from '@google-cloud/bigquery';
import { Request, Response } from "firebase-functions";
import { EventWebhook } from '@sendgrid/eventwebhook';

/** Return object with only the properties defined in fields parameter */
function copyFields<T>(from: T, fields: string[]): T {
  const result: Partial<T> = {};
  for (const key in from) {
    if (fields.includes(key)) result[key] = from[key];
  }
  return result as T;
}

const displayError = (e) => typeof e === 'object' ? JSON.stringify(e) : e;

/**
 * Listens to Events Webhook of Sengrid
 * 
 * Event Webhook Schema
 * email:string, timestamp:timestamp, event:string, asm_group_id:numeric, sg_event_id:string, sg_message_id:string, sg_template_id:string, sg_template_name:string, reason:string, status:string, projectId: string
 */
export const eventWebhook = async (req: Request, res: Response) => {

  const datasetId = 'sendgrid';
  const tableId = 'events';

  const signature = req.get('x-twilio-email-event-webhook-signature');
  const timestamp = req.get('x-twilio-email-event-webhook-timestamp');
  const publicKey = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEXSIvSlqV1okLs57Q0SgCSe8BNTztzDQIrvSwd91YL6gKAenGm8ih2NlSOcI4Yozj+DQhODWEz62x609zS1ZyRw==';

  try {
    const webhook = new EventWebhook();
    const ecdsa = webhook.convertPublicKeyToECDSA(publicKey);
    const rawBody = req['rawBody'].toString()

    const verified = webhook.verifySignature(ecdsa, rawBody, signature, timestamp);

    if (!verified) {
      console.error('request not from SendGrid');
      res.status(200).send('No permission! 🤨');
      return
    }

    const bigquery = new BigQuery();
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(tableId);
    const body = req.body as Array<unknown>;

    const fields = [
      'email',
      'timestamp',
      'event',
      'asm_group_id',
      'sg_event_id',
      'sg_message_id',
      'sg_template_id',
      'sg_template_name',
      'reason',
      'status',
      'projectId'
    ];
    const rows = body.map(event => copyFields(event, fields));

    table.insert(rows).catch(err => console.error('error while inserting: ', displayError(err)));

  } catch (e) {
    console.error(displayError(e));
  }

  // in any case we return 200 OK to the sendgrid servers
  res.status(200).send();
  return;
}