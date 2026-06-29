import {
  listUserConcerns,
  markUserConcernReplyRead,
  submitUserConcern,
} from "./api.service";

export const helpService = {
  submitConcern(payload: {
    concernType: string;
    category: string;
    subject: string;
    message: string;
    email?: string;
    rating?: number;
  }) {
    return submitUserConcern(payload);
  },

  listTickets(userId?: number) {
    return listUserConcerns(userId);
  },

  markReplyRead(concernId: number) {
    return markUserConcernReplyRead(concernId);
  },
};
