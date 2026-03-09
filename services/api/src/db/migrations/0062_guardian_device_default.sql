-- Migration 0062: guardian_devices에 disease_item_id, is_default 추가
-- pet_health_measurement_logs에 guardian_device_id 추가

ALTER TABLE guardian_devices ADD COLUMN disease_item_id TEXT REFERENCES master_items(id);
ALTER TABLE guardian_devices ADD COLUMN is_default INTEGER NOT NULL DEFAULT 0;
ALTER TABLE pet_health_measurement_logs ADD COLUMN guardian_device_id TEXT REFERENCES guardian_devices(id);
