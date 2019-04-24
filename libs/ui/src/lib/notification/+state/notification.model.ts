// tslint:disable-next-line: interface-over-type-literal
export type Notification = {
  id: string;
  app: string;
  message: string;
  orgId: string[];
  isRead: boolean;
  date: number;
};

/**
 * A factory function that creates a Notification
 */
export function createNotification(params?: Partial<Notification>): Notification {
  return params ? {
    id: params.id || '',
    app: params.app || 'Delivery', //! Delivery only here to mock the data
    message: params.message,
    orgId: params.orgId,
    isRead: params.isRead || false,
    date: params.date || Date.now(),
  } : {} as Notification;
}
