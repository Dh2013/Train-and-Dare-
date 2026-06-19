import { Model, Schema, model, models } from 'mongoose';
import { applyBaseSchema } from '../plugins/applyBaseSchema';
import { slugify } from '../utils/slug';

export type ProgramAudience = 'youth' | 'parents' | 'teachers' | 'adults' | 'mixed';

export interface ProgramSpace {
  legacyId?: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  audience: ProgramAudience;
  themeColor: string;
  accentColor: string;
  displayOrder: number;
  isActive: boolean;
}

type ProgramSpaceModelType = Model<ProgramSpace>;

const programSpaceSchema = new Schema<ProgramSpace>(
  {
    legacyId: {
      type: String,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 140,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    subtitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 220,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
    audience: {
      type: String,
      enum: ['youth', 'parents', 'teachers', 'adults', 'mixed'],
      default: 'mixed',
      index: true,
    },
    themeColor: {
      type: String,
      trim: true,
      default: '#0E9F6E',
      match: /^#(?:[0-9a-fA-F]{3}){1,2}$/,
    },
    accentColor: {
      type: String,
      trim: true,
      default: '#F97316',
      match: /^#(?:[0-9a-fA-F]{3}){1,2}$/,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    collection: 'program_spaces',
    timestamps: true,
  }
);

applyBaseSchema(programSpaceSchema);

programSpaceSchema.pre('validate', function normalizeSpace() {
  this.slug = slugify(this.slug || this.title);
});

const existingProgramSpaceModel = models.ProgramSpace as ProgramSpaceModelType | undefined;

export const ProgramSpaceModel =
  existingProgramSpaceModel ?? model<ProgramSpace>('ProgramSpace', programSpaceSchema);
