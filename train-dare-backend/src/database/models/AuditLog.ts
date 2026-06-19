import { Model, Schema, Types, model, models } from 'mongoose';
import { applyBaseSchema } from '../plugins/applyBaseSchema';

export interface AuditLog {
  actorUser?: Types.ObjectId;
  actorDisplayName?: string;
  action: string;
  entityType: string;
  entityId: string;
  entityLabel?: string;
  metadata?: Record<string, unknown>;
  ipHash?: string;
}

type AuditLogModelType = Model<AuditLog>;

const auditLogSchema = new Schema<AuditLog>(
  {
    actorUser: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
      index: true,
    },
    actorDisplayName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
      index: true,
    },
    entityLabel: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipHash: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  {
    collection: 'audit_logs',
    timestamps: true,
  }
);

applyBaseSchema(auditLogSchema);

auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ actorUser: 1, createdAt: -1 });

const existingAuditLogModel = models.AuditLog as AuditLogModelType | undefined;

export const AuditLogModel =
  existingAuditLogModel ?? model<AuditLog>('AuditLog', auditLogSchema);
