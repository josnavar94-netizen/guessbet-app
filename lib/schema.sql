-- Ejecuta esto UNA VEZ desde Vercel → Storage → tu base de datos → pestaña Query

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  plan VARCHAR(20) DEFAULT 'free',  -- 'free' | 'premium' (para el futuro)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_name VARCHAR(255) NOT NULL,
  pick_label TEXT NOT NULL,
  odds NUMERIC(6,2) NOT NULL,
  stake NUMERIC(8,2) NOT NULL,
  ev NUMERIC(6,2),
  bookie VARCHAR(50),
  competition VARCHAR(100) DEFAULT 'Mundial 2026',
  match_date DATE,
  result VARCHAR(10) NOT NULL DEFAULT 'open',
  pl NUMERIC(8,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);

-- Migración: antiabuso multi-cuenta (ejecutar una vez en Vercel Storage → Query)
ALTER TABLE bets ADD COLUMN IF NOT EXISTS device_id VARCHAR(64);
ALTER TABLE bets ADD COLUMN IF NOT EXISTS ip VARCHAR(45);
CREATE INDEX IF NOT EXISTS idx_bets_device_id ON bets(device_id);

-- Migración: registro de uso diario Free, independiente de bets (no se borra si el usuario elimina su apuesta)
CREATE TABLE IF NOT EXISTS bet_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(64),
  ip VARCHAR(45),
  used_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bet_usage_user_date ON bet_usage(user_id, used_date);
CREATE INDEX IF NOT EXISTS idx_bet_usage_device_date ON bet_usage(device_id, used_date);
