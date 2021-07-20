import { BigQuery } from '@google-cloud/bigquery';
import { Request, Response } from "firebase-functions";
import { EventWebhook } from '@sendgrid/eventwebhook';


/**
 * Listens to Events Webhook of Sengrid
 * 
 * Event Webhook Schema
 * email:string, timestamp:timestamp, event:string, asm_group_id:numeric, sg_event_id:string, sg_message_id:string, sg_template_id:string, sg_template_name:string, reason:string, status:string 
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
    const body = req.body as Array<any>;

    const cleaned = body.map(({ 
      email,
      timestamp,
      event,
      asm_group_id,
      sg_event_id,
      sg_message_id,
      sg_template_id,
      sg_template_name,
      reason,
      status,
      // category (array of strings)
    }) => ({ 
      email,
      timestamp,
      event,
      asm_group_id,
      sg_event_id,
      sg_message_id,
      sg_template_id,
      sg_template_name,
      reason,
      status
    }));

    table.insert(cleaned).catch(err => console.error('error while inserting: ', typeof err === 'object' ? JSON.stringify(err) : err));

  } catch (e) {
    console.error(typeof e === 'object' ? JSON.stringify(e) : e);
  }

  // in any case we return 200 OK to the sendgrid servers
  res.status(200).send();
  return;
}