// tslint:disable-next-line: interface-over-type-literal
export type Notification = {
  id: string;
  app: string;
  message: string;
  userId: string[];
  isRead: boolean;
  date: number;
};

/**
 * A factory function that creates a Notification
 */
export function createNotification(params?: Partial<Notification>): Notification {
  return params ? {
    id: params.id || '',
    app: params.app,
    message: params.message,
    userId: params.userId,
    isRead: params.isRead || false,
    date: params.date,
  } : {} as Notification;
}
