import { Model, Schema, Types, model, models } from 'mongoose';
import { applyBaseSchema } from '../plugins/applyBaseSchema';
import { slugify } from '../utils/slug';
import { estimateReadingTime, stripHtml, truncateText } from '../utils/text';

export type BlogStatus = 'draft' | 'scheduled' | 'published' | 'archived';

interface BlogContent {
  html: string;
  text: string;
}

interface BlogImage {
  url: string;
  alt?: string;
}

interface BlogSeo {
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  openGraphImage?: string;
}

export interface BlogPost {
  legacyId?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: BlogContent;
  featuredImage?: BlogImage;
  authorName: string;
  authorUserId?: Types.ObjectId;
  category: Types.ObjectId;
  tags: string[];
  status: BlogStatus;
  scheduledFor?: Date;
  publishedAt?: Date;
  readingTimeMinutes: number;
  seo: BlogSeo;
  relatedPosts: Types.ObjectId[];
  isFeatured: boolean;
}

type BlogPostModelType = Model<BlogPost>;

const blogContentSchema = new Schema<BlogContent>(
  {
    html: {
      type: String,
      required: true,
      maxlength: 120000,
    },
    text: {
      type: String,
      required: true,
      maxlength: 120000,
      default: '',
    },
  },
  {
    _id: false,
  }
);

const blogImageSchema = new Schema<BlogImage>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    alt: {
      type: String,
      trim: true,
      maxlength: 180,
    },
  },
  {
    _id: false,
  }
);

const blogSeoSchema = new Schema<BlogSeo>(
  {
    metaTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 70,
    },
    metaDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 170,
    },
    canonicalUrl: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    openGraphImage: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    _id: false,
  }
);

const blogPostSchema = new Schema<BlogPost>(
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
      maxlength: 200,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 320,
    },
    content: {
      type: blogContentSchema,
      required: true,
    },
    featuredImage: blogImageSchema,
    authorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    authorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'BlogCategory',
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    scheduledFor: {
      type: Date,
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    readingTimeMinutes: {
      type: Number,
      default: 1,
      min: 1,
    },
    seo: {
      type: blogSeoSchema,
      required: true,
    },
    relatedPosts: {
      type: [Schema.Types.ObjectId],
      ref: 'BlogPost',
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    collection: 'blog_posts',
    timestamps: true,
  }
);

applyBaseSchema(blogPostSchema);

blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ category: 1, status: 1, publishedAt: -1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ scheduledFor: 1 }, { partialFilterExpression: { status: 'scheduled' } });
blogPostSchema.index({
  title: 'text',
  excerpt: 'text',
  'content.text': 'text',
  tags: 'text',
});

blogPostSchema.pre('validate', function normalizePost() {
  this.slug = slugify(this.slug || this.title);
  this.content.text = stripHtml(this.content.html);
  this.excerpt = truncateText(this.excerpt || this.content.text, 320);
  this.tags = Array.from(
    new Set(
      this.tags
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 20)
    )
  );
  this.readingTimeMinutes = estimateReadingTime(this.content.html);

  if (!this.seo.metaTitle) {
    this.seo.metaTitle = truncateText(this.title, 70);
  }
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = truncateText(this.excerpt || this.content.text, 170);
  }
  if (this.featuredImage && !this.featuredImage.alt?.trim()) {
    this.featuredImage.alt = this.title;
  }
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  if (this.status !== 'scheduled') {
    this.scheduledFor = undefined;
  }
  if (this.status === 'draft') {
    this.publishedAt = undefined;
  }
});

const existingBlogPostModel = models.BlogPost as BlogPostModelType | undefined;

export const BlogPostModel =
  existingBlogPostModel ?? model<BlogPost>('BlogPost', blogPostSchema);
