import { Model, Schema, Types, model, models } from 'mongoose';
import { applyBaseSchema } from '../plugins/applyBaseSchema';
import { normalizeEmail } from '../utils/text';

export type ContactAudience = 'youth' | 'adult' | 'parent' | 'teacher' | 'all';
export type ContactStatus = 'new' | 'in_progress' | 'resolved' | 'archived' | 'spam';

interface ContactMetadata {
  ipHash?: string;
  locale?: string;
  userAgent?: string;
  referral?: string;
}

export interface ContactMessage {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
  sourcePage?: string;
  audienceSegment: ContactAudience;
  status: ContactStatus;
  tags: string[];
  newsletterOptIn: boolean;
  consentAccepted: boolean;
  assignedTo?: Types.ObjectId;
  notes?: string;
  metadata?: ContactMetadata;
  receivedAt?: Date;
}

type ContactMessageModelType = Model<ContactMessage>;

const contactMetadataSchema = new Schema<ContactMetadata>(
  {
    ipHash: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    locale: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    referral: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    _id: false,
  }
);

const contactMessageSchema = new Schema<ContactMessage>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    company: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    sourcePage: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    audienceSegment: {
      type: String,
      enum: ['youth', 'adult', 'parent', 'teacher', 'all'],
      default: 'all',
      index: true,
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved', 'archived', 'spam'],
      default: 'new',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    newsletterOptIn: {
      type: Boolean,
      default: false,
    },
    consentAccepted: {
      type: Boolean,
      default: false,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 4000,
    },
    metadata: contactMetadataSchema,
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: 'contact_messages',
    timestamps: true,
  }
);

applyBaseSchema(contactMessageSchema);

contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ email: 1, createdAt: -1 });

contactMessageSchema.pre('validate', function normalizeContact() {
  this.email = normalizeEmail(this.email);
  this.tags = Array.from(new Set(this.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)));
});

const existingContactMessageModel = models.ContactMessage as ContactMessageModelType | undefined;

export const ContactMessageModel =
  existingContactMessageModel ??
  model<ContactMessage>('ContactMessage', contactMessageSchema);
