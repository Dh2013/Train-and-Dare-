import { Model, Schema, model, models } from 'mongoose';
import { applyBaseSchema } from '../plugins/applyBaseSchema';
import { normalizeEmail } from '../utils/text';

export type NewsletterStatus = 'pending' | 'active' | 'unsubscribed' | 'bounced';

export interface NewsletterSubscriber {
  email: string;
  fullName?: string;
  status: NewsletterStatus;
  segments: string[];
  source?: string;
  tags: string[];
  subscribedAt?: Date;
  unsubscribedAt?: Date;
}

type NewsletterSubscriberModelType = Model<NewsletterSubscriber>;

const newsletterSubscriberSchema = new Schema<NewsletterSubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'unsubscribed', 'bounced'],
      default: 'pending',
      index: true,
    },
    segments: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    tags: {
      type: [String],
      default: [],
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: Date,
  },
  {
    collection: 'newsletter_subscribers',
    timestamps: true,
  }
);

applyBaseSchema(newsletterSubscriberSchema);

newsletterSubscriberSchema.index({ status: 1, source: 1 });

newsletterSubscriberSchema.pre('validate', function normalizeSubscriber() {
  this.email = normalizeEmail(this.email);
  this.segments = Array.from(
    new Set(this.segments.map((segment) => segment.trim().toLowerCase()).filter(Boolean))
  );
  this.tags = Array.from(new Set(this.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)));
});

const existingNewsletterSubscriberModel =
  models.NewsletterSubscriber as NewsletterSubscriberModelType | undefined;

export const NewsletterSubscriberModel =
  existingNewsletterSubscriberModel ??
  model<NewsletterSubscriber>('NewsletterSubscriber', newsletterSubscriberSchema);
