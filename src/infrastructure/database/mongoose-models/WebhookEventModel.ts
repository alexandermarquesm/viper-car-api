import mongoose, { Schema, Document } from "mongoose";

export interface IWebhookEventDocument extends Document<string> {
  eventId: string;
  processedAt: Date;
}

const webhookEventSchema = new Schema<IWebhookEventDocument>({
  eventId: { type: String, required: true, unique: true, index: true },
  processedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IWebhookEventDocument>("WebhookEvent", webhookEventSchema);
