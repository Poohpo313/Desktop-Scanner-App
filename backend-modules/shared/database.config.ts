import { DataSource, DataSourceOptions } from 'typeorm';

import { ActivityLogEntity } from './entities/activity-log.entity';
import { BackupEntity } from './entities/backup.entity';
import { CloudSyncEntity } from './entities/cloud-sync.entity';
import { DeviceEntity } from './entities/device.entity';
import { DocumentEntity } from './entities/document.entity';
import { FolderEntity } from './entities/folder.entity';
import { RoleEntity } from './entities/role.entity';
import { ScanHistoryEntity } from './entities/scan-history.entity';
import { SerialKeyEntity } from './entities/serial-key.entity';
import { UserEntity } from './entities/user.entity';

const sharedEntities = [
  UserEntity,
  RoleEntity,
  SerialKeyEntity,
  DocumentEntity,
  FolderEntity,
  DeviceEntity,
  ScanHistoryEntity,
  ActivityLogEntity,
  CloudSyncEntity,
  BackupEntity,
];

/** Online PostgreSQL database — managed by NestJS backend via TypeORM. */
export const onlineDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: sharedEntities,
};

/** Offline local database — PostgreSQL (managed by Electron desktop app via pg). */
export const offlineDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.OFFLINE_DATABASE_URL,
  host: process.env.OFFLINE_DB_HOST ?? 'localhost',
  port: process.env.OFFLINE_DB_PORT ? Number(process.env.OFFLINE_DB_PORT) : 5432,
  username: process.env.OFFLINE_DB_USER ?? 'postgres',
  password: process.env.OFFLINE_DB_PASSWORD,
  database: process.env.OFFLINE_DB_NAME ?? 'bukolabs_offline',
  synchronize: false,
  logging: false,
  entities: sharedEntities,
};

export const onlineDataSource = new DataSource(onlineDataSourceOptions);
export const offlineDataSource = new DataSource(offlineDataSourceOptions);

// Migration files:
// - Online (PostgreSQL):  shared/migrations/online/001_initial_schema.postgres.sql
// - Offline (PostgreSQL): shared/migrations/offline/001_initial_schema.postgres.sql
//
// Both databases run on PostgreSQL.
// Online = bukolabs_online (Admin/SuperAdmin + User sync target).
// Offline = bukolabs_offline (User desktop only).
// Cloud storage (e.g. Google Bucket) is a separate planned extension — not this database.
