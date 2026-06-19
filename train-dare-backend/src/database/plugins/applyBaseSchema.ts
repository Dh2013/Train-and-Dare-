import { Schema } from 'mongoose';

type PlainRecord = Record<string, unknown>;

function transformDocument(_doc: unknown, ret: PlainRecord): PlainRecord {
  if (ret._id !== undefined) {
    ret.id =
      typeof ret._id === 'object' && ret._id && 'toString' in ret._id
        ? (ret._id as { toString(): string }).toString()
        : String(ret._id);
    delete ret._id;
  }

  delete ret.__v;
  return ret;
}

export function applyBaseSchema(schema: Schema): void {
  schema.set('versionKey', false);
  schema.set('toJSON', {
    virtuals: true,
    getters: true,
    transform: transformDocument,
  });
  schema.set('toObject', {
    virtuals: true,
    getters: true,
    transform: transformDocument,
  });

  schema.virtual('id').get(function getId(this: { _id?: { toString(): string } }) {
    return this._id?.toString();
  });
}

