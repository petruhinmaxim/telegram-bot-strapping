CREATE TABLE IF NOT EXISTS telegram_user_data (
  telegram_user_id BIGSERIAL NOT NULL PRIMARY KEY,
  user_name TEXT,
  first_name TEXT,
  last_name TEXT,
  language_code TEXT
);
CREATE INDEX IF NOT EXISTS telegram_user_data_telegram_user_id_idx ON telegram_user_data(telegram_user_id);

CREATE TABLE IF NOT EXISTS vpn_server (
  server_id BIGSERIAL NOT NULL PRIMARY KEY,
  server_name TEXT NOT NULL,
  subscriptionDate DATE NOT NULL,
  ip TEXT NOT NULL,
  vnsIp TEXT NOT NULL,
  userName TEXT NOT NULL,
  password TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS vpn_server_server_id_idx ON vpn_server(server_id);

CREATE TABLE IF NOT EXISTS vpn_config (
  config_id BIGSERIAL NOT NULL PRIMARY KEY,
  server_id BIGSERIAL NOT NULL REFERENCES vpn_server(server_id),
  config_data TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS vpn_config_config_id_idx ON vpn_config(config_id);

CREATE TABLE IF NOT EXISTS vpn_user (
  telegram_user_id BIGSERIAL NOT NULL REFERENCES telegram_user_data(telegram_user_id),
  current_scene TEXT NOT NULL DEFAULT 'Start',
  config_pc_id BIGSERIAL REFERENCES vpn_config(config_id),
  config_mobile_id BIGSERIAL REFERENCES vpn_config(config_id)
);
