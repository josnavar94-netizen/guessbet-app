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

-- Migración: sesión única por cuenta (ejecutar una vez en Vercel Storage → Query)
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 0;

-- Migración: resultados de partidos sincronizados desde football-data.org (agente de datos)
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  external_id INTEGER UNIQUE NOT NULL,
  competition_code VARCHAR(10) NOT NULL DEFAULT 'WC',
  match_date DATE NOT NULL,
  home_team VARCHAR(100) NOT NULL,
  away_team VARCHAR(100) NOT NULL,
  home_goals INTEGER,
  away_goals INTEGER,
  status VARCHAR(20) NOT NULL,
  stage VARCHAR(30),
  updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_matches_competition ON matches(competition_code);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);

-- Migración: consentimiento legal (Términos y Privacidad) al registrarse
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_version VARCHAR(20);

-- Migración: foto de perfil (guardada como data URL base64, sin necesitar storage externo)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Migración: recuperación de contraseña por correo
CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);

-- Migración: verificación de correo al registrarse
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
CREATE TABLE IF NOT EXISTS email_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);

-- Migración: hora real del partido y grupo/fase, para armar el selector "Elige el partido"
-- 100% desde la base de datos en vez de un fixture escrito a mano que se queda desactualizado.
ALTER TABLE matches ADD COLUMN IF NOT EXISTS kickoff_at TIMESTAMP;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS group_name VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_matches_kickoff ON matches(kickoff_at);

-- Migración: rate-limiting por IP en endpoints de autenticación (antifuerza bruta)
CREATE TABLE IF NOT EXISTS auth_attempts (
  id SERIAL PRIMARY KEY,
  ip VARCHAR(45) NOT NULL,
  endpoint VARCHAR(40) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_lookup ON auth_attempts(ip, endpoint, created_at);

-- Migración: fecha de nacimiento, para verificar mayoría de edad real (no solo autodeclarada)
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Migración: cuentas admin (las únicas que pueden borrar apuestas). Activar a mano con:
-- UPDATE users SET is_admin = TRUE WHERE email = 'tu_correo@ejemplo.com';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Migración: cuotas reales de Coolbet sincronizadas desde The Odds API
CREATE TABLE IF NOT EXISTS match_odds (
  id SERIAL PRIMARY KEY,
  home_team VARCHAR(100) NOT NULL,
  away_team VARCHAR(100) NOT NULL,
  bookmaker VARCHAR(30) NOT NULL DEFAULT 'coolbet',
  home_odds NUMERIC(6,2),
  draw_odds NUMERIC(6,2),
  away_odds NUMERIC(6,2),
  over_odds NUMERIC(6,2),
  under_odds NUMERIC(6,2),
  btts_odds NUMERIC(6,2),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(home_team, away_team, bookmaker)
);

-- Migración: línea de goles real que ofrece la casa (no siempre es 2.5)
ALTER TABLE match_odds ADD COLUMN IF NOT EXISTS total_line NUMERIC(4,1);

-- Migración: pagos de Premium via Mercado Pago
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMP;
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(20) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  mp_payment_id VARCHAR(50) UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);

-- Migración: estado en vivo (minuto y marcador) vía API-Football, plan gratis (100 req/día).
-- No incluye tarjetas rojas (costaría otra llamada por partido); esas siguen siendo manuales.
ALTER TABLE matches ADD COLUMN IF NOT EXISTS live_minute INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS live_home_goals INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS live_away_goals INTEGER;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS live_updated_at TIMESTAMP;

-- Migración: alineaciones titulares (vía API-Football, ~30-40 min antes del partido).
-- Se usa para comparar contra el partido anterior del mismo equipo en este Mundial y detectar rotación.
CREATE TABLE IF NOT EXISTS lineups (
  id SERIAL PRIMARY KEY,
  team VARCHAR(100) NOT NULL,
  kickoff_at TIMESTAMP NOT NULL,
  player_name VARCHAR(100) NOT NULL,
  position VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(team, kickoff_at, player_name)
);
CREATE INDEX IF NOT EXISTS idx_lineups_team_kickoff ON lineups(team, kickoff_at);

-- Migración: notificaciones push (Web Push) cuando se confirma una alineación titular
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

-- Migración: caché del ID de cada selección en API-Football, para no resolverlo cada vez (gasta cuota)
CREATE TABLE IF NOT EXISTS team_refs (
  team VARCHAR(100) PRIMARY KEY,
  api_football_id INTEGER NOT NULL
);
