export type NotificationType =
  | "booking"
  | "confirmed"
  | "rescheduled"
  | "cancelled"
  | "reminder"
  | "missed"
  | "completed"
  | "prescription"
  | "payment_success"
  | "payment_failed";

export type AppNotification = {
  id: string;

  recipientUserId?: string;

  recipientEmail?: string;

  type: NotificationType;

  title: string;

  message: string;

  appointmentId?: string;

  read: boolean;

  createdAt: string;
};
