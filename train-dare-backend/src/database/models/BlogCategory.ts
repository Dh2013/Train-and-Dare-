import { Model, Schema, model, models } from 'mongoose';
import { applyBaseSchema } from '../plugins/applyBaseSchema';
import { slugify } from '../utils/slug';

export type CategoryAudience = 'adult' | 'youth' | 'all';

export interface BlogCategory {
  legacyId?: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  audience: CategoryAudience;
  sortOrder: number;
  isActive: boolean;
}

type BlogCategoryModelType = Model<BlogCategory>;

const blogCategorySchema = new Schema<BlogCategory>(
  {
    legacyId: {
      type: String,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 280,
    },
    color: {
      type: String,
      trim: true,
      default: '#0E9F6E',
      match: /^#(?:[0-9a-fA-F]{3}){1,2}$/,
    },
    audience: {
      type: String,
      enum: ['adult', 'youth', 'all'],
      default: 'all',
      index: true,
    },
    sortOrder: {
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
    collection: 'blog_categories',
    timestamps: true,
  }
);

applyBaseSchema(blogCategorySchema);

blogCategorySchema.pre('validate', function normalizeCategory() {
  this.slug = slugify(this.slug || this.name);
});

const existingBlogCategoryModel = models.BlogCategory as BlogCategoryModelType | undefined;

export const BlogCategoryModel =
  existingBlogCategoryModel ?? model<BlogCategory>('BlogCategory', blogCategorySchema);
