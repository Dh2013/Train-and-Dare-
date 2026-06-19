import { Model, Schema, Types, model, models } from 'mongoose';
import { applyBaseSchema } from '../plugins/applyBaseSchema';
import { slugify } from '../utils/slug';

export type ProgramStatus = 'draft' | 'published' | 'archived';
export type DeliveryMode = 'cohort' | 'bootcamp' | 'workshop' | 'custom';

export interface ProgramOffering {
  legacyId?: string;
  space: Types.ObjectId;
  spaceSlugSnapshot: string;
  slug: string;
  title: string;
  audience: string;
  duration: string;
  summary?: string;
  objectives: string[];
  registrationPath: string;
  deliveryMode: DeliveryMode;
  status: ProgramStatus;
  isFeatured: boolean;
  displayOrder: number;
}

type ProgramOfferingModelType = Model<ProgramOffering>;

const programOfferingSchema = new Schema<ProgramOffering>(
  {
    legacyId: {
      type: String,
      trim: true,
      index: true,
    },
    space: {
      type: Schema.Types.ObjectId,
      ref: 'ProgramSpace',
      required: true,
      index: true,
    },
    spaceSlugSnapshot: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 140,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    audience: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    duration: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    objectives: {
      type: [String],
      default: [],
    },
    registrationPath: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    deliveryMode: {
      type: String,
      enum: ['cohort', 'bootcamp', 'workshop', 'custom'],
      default: 'cohort',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    collection: 'program_offerings',
    timestamps: true,
  }
);

applyBaseSchema(programOfferingSchema);

programOfferingSchema.index({ space: 1, displayOrder: 1 });
programOfferingSchema.index({
  title: 'text',
  summary: 'text',
  objectives: 'text',
});

programOfferingSchema.pre('validate', function normalizeOffering() {
  this.slug = slugify(this.slug || this.title);
  this.spaceSlugSnapshot = slugify(this.spaceSlugSnapshot);
  this.registrationPath = this.registrationPath.trim() || this.slug;
  this.objectives = this.objectives.map((objective) => objective.trim()).filter(Boolean);
});

const existingProgramOfferingModel = models.ProgramOffering as ProgramOfferingModelType | undefined;

export const ProgramOfferingModel =
  existingProgramOfferingModel ??
  model<ProgramOffering>('ProgramOffering', programOfferingSchema);
