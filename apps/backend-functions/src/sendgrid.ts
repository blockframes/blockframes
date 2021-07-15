import { BigQuery } from '@google-cloud/bigquery';
import { Request, Response } from "firebase-functions";

/**
 * Listens to Events Webhook of Sengrid
 * 
 * Event Webhook Schema
 * email:string, timestamp:timestamp, event:string, asm_group_id:numeric, sg_event_id:string, sg_message_id:string, sg_template_id:string, sg_template_name:string, reason:string, status:string 
 */
export const eventWebhook = async (req: Request, res: Response) => {

  const datasetId = 'sendgrid';
  const tableId = 'events';

  try {
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

    table.insert(cleaned).catch(err => console.error('error while inserting in bigquery: ', JSON.stringify(err)));

  } catch (e) {
    console.error(JSON.stringify(e));
  }

  // in any case we return 200 OK to the sendgrid servers
  res.status(200).send();
  return;
}