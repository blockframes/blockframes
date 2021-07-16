import { BigQuery } from '@google-cloud/bigquery';
import { Request, Response } from "firebase-functions";

/** Return object with only the properties defined in fields parameter */
function copyFields<T>(from: T, fields: string[]): T {
  const result: Partial<T> = {};
  for (const key in from) {
    if (fields.includes(key)) result[key] = from[key];
  }
  return result as T;
}

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
      'status'
      // category (array of strings)
    ];
    const rows = body.map(event => copyFields(event, fields));

    table.insert(rows).catch(err => console.error('error while inserting in bigquery: ', JSON.stringify(err)));

  } catch (e) {
    console.error(JSON.stringify(e));
  }

  // in any case we return 200 OK to the sendgrid servers
  res.status(200).send();
  return;
}