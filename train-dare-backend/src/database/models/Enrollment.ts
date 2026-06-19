import { Model, Schema, Types, model, models } from 'mongoose';
import { applyBaseSchema } from '../plugins/applyBaseSchema';
import { normalizeEmail } from '../utils/text';

export type EnrollmentStatus =
  | 'submitted'
  | 'contacted'
  | 'qualified'
  | 'enrolled'
  | 'archived';
export type PreferredContact = 'email' | 'phone' | 'whatsapp';

export interface Enrollment {
  legacyId?: string;
  program?: Types.ObjectId;
  programLegacyId?: string;
  programSlugSnapshot: string;
  programTitleSnapshot?: string;
  spaceSlugSnapshot?: string;
  fullName: string;
  email: string;
  phone?: string;
  ageBand?: string;
  message?: string;
  status: EnrollmentStatus;
  source?: string;
  consentAccepted: boolean;
  tags: string[];
  notes?: string;
  preferredContact?: PreferredContact;
  receivedAt?: Date;
}

type EnrollmentModelType = Model<Enrollment>;

const enrollmentSchema = new Schema<Enrollment>(
  {
    legacyId: {
      type: String,
      trim: true,
      index: true,
    },
    program: {
      type: Schema.Types.ObjectId,
      ref: 'ProgramOffering',
      index: true,
    },
    programLegacyId: {
      type: String,
      trim: true,
      index: true,
    },
    programSlugSnapshot: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
      index: true,
    },
    programTitleSnapshot: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    spaceSlugSnapshot: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 140,
      index: true,
    },
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
    ageBand: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['submitted', 'contacted', 'qualified', 'enrolled', 'archived'],
      default: 'submitted',
      index: true,
    },
    source: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    consentAccepted: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 4000,
    },
    preferredContact: {
      type: String,
      enum: ['email', 'phone', 'whatsapp'],
    },
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: 'enrollments',
    timestamps: true,
  }
);

applyBaseSchema(enrollmentSchema);

enrollmentSchema.index({ status: 1, createdAt: -1 });
enrollmentSchema.index({ program: 1, createdAt: -1 });
enrollmentSchema.index({ email: 1, createdAt: -1 });

enrollmentSchema.pre('validate', function normalizeEnrollment() {
  this.email = normalizeEmail(this.email);
  this.programSlugSnapshot = this.programSlugSnapshot.trim().toLowerCase();
  this.spaceSlugSnapshot = this.spaceSlugSnapshot?.trim().toLowerCase();
  this.tags = Array.from(new Set(this.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)));
});

const existingEnrollmentModel = models.Enrollment as EnrollmentModelType | undefined;

export const EnrollmentModel =
  existingEnrollmentModel ?? model<Enrollment>('Enrollment', enrollmentSchema);
