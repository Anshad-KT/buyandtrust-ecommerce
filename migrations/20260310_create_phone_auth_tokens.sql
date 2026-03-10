-- Create tables to store phone OTPs and phone verification tokens in Postgres
-- Replaces Redis-based storage with 10-minute expiry windows.

BEGIN;

CREATE TABLE IF NOT EXISTS phone_otp_tokens (
  id bigserial PRIMARY KEY,
  phone_number text NOT NULL,
  otp_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes')
);

CREATE UNIQUE INDEX IF NOT EXISTS phone_otp_tokens_phone_number_idx
  ON phone_otp_tokens (phone_number);

CREATE INDEX IF NOT EXISTS phone_otp_tokens_expires_at_idx
  ON phone_otp_tokens (expires_at);

CREATE TABLE IF NOT EXISTS phone_verification_tokens (
  id bigserial PRIMARY KEY,
  phone_number text NOT NULL,
  token_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes')
);

CREATE UNIQUE INDEX IF NOT EXISTS phone_verification_tokens_phone_number_idx
  ON phone_verification_tokens (phone_number);

CREATE INDEX IF NOT EXISTS phone_verification_tokens_expires_at_idx
  ON phone_verification_tokens (expires_at);

-- Optional: auto-cleanup expired rows every minute (requires pg_cron extension).
-- If your environment does not allow pg_cron, run the DELETE statements from a scheduler instead.
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'cleanup_phone_auth_tokens'
  ) THEN
    PERFORM cron.schedule(
      'cleanup_phone_auth_tokens',
      '*/1 * * * *',
      $$DELETE FROM phone_otp_tokens WHERE expires_at < now();
        DELETE FROM phone_verification_tokens WHERE expires_at < now();$$
    );
  END IF;
END$$;

COMMIT;
