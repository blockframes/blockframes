// tslint:disable-next-line: interface-over-type-literal
export type Notification = {
  id: string;
  content: string;
  app: string;
};

export function createDelivery(params: Partial<Notification>) {
  return {
    ...params
  } as Notification;
}
