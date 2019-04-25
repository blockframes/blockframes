// tslint:disable-next-line: interface-over-type-literal
export type Notification = {
  id: string;
  app: string;
  message: string;
  userId: string[];
  path: string;
  isRead: boolean;
  date: number;
};

/**
 * A factory function that creates a Notification
 */
export function createNotification(params?: Partial<Notification>): Notification {
  return {
    id: params.id || '',
    app: params.app,
    message: params.message,
    userId: params.userId,
    path: params.path,
    isRead: params.isRead,
    date: params.date,
  } as Notification;
}
