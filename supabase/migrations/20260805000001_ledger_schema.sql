-- ============================================================
-- CompX Orbit — Ledger Book & Finance Dashboard Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ledger_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    account TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'Website',
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    description TEXT,
    orders_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for date queries
CREATE INDEX IF NOT EXISTS ledger_transactions_date_idx ON public.ledger_transactions (date DESC);
CREATE INDEX IF NOT EXISTS ledger_transactions_type_idx ON public.ledger_transactions (type);

-- RLS Policies
ALTER TABLE public.ledger_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all ledger transactions"
    ON public.ledger_transactions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
