export const FEEDBACK_TYPES = [
  { id: "general", label: "General Feedback" },
  { id: "bug", label: "Bug Report" },
  { id: "feature", label: "Feature Request" },
  { id: "performance", label: "Performance Issue" },
] as const;

export type FeedbackTypeId = (typeof FEEDBACK_TYPES)[number]["id"];

export type SendFeedbackPayload = {
  feedbackType: FeedbackTypeId;
  rating: number;
  message: string;
  email: string;
};
