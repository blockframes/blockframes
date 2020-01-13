import { CallableContext } from "firebase-functions/lib/providers/https";


export const request = async (
  data: any,
  context: CallableContext
): Promise<any> => {
  const rows = await query(data);
  if (rows !== undefined && rows.length >= 0){
    console.log('Analytics/BigQuery query ended');
    return rows;
  } else {
    const msg = 'Unexepected error';
    console.log(msg);
    return { status: false, msg };
  }
};
