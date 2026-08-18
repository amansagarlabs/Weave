ALTER TABLE edit_requests ADD COLUMN preview_asset_public_id VARCHAR(500);
ALTER TABLE edit_requests ADD COLUMN preview_asset_resource_type VARCHAR(30);
ALTER TABLE edit_requests ADD COLUMN preview_asset_format VARCHAR(30);
ALTER TABLE edit_requests ADD COLUMN preview_asset_version BIGINT;
ALTER TABLE edit_requests ADD COLUMN final_asset_public_id VARCHAR(500);
ALTER TABLE edit_requests ADD COLUMN final_asset_resource_type VARCHAR(30);
ALTER TABLE edit_requests ADD COLUMN final_asset_format VARCHAR(30);
ALTER TABLE edit_requests ADD COLUMN final_asset_version BIGINT;
