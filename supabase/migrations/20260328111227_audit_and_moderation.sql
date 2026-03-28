-- Création de la table pour les Journaux d'Audit (Audit Logs)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES public.app_admins(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- ex: 'SUSPEND_RESTAURANT', 'CREATED_ADMIN'
    entity_type TEXT NOT NULL, -- ex: 'restaurant', 'profile', 'admin'
    entity_id TEXT, -- Use TEXT to support UUID but also string IDs if needed
    details JSONB, -- Store old/new values, IPs, or specific context
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sécurité RLS et Politiques pour admin_audit_logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can read all audit logs" 
    ON public.admin_audit_logs 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.app_admins 
            WHERE id = auth.uid() AND is_super_admin = TRUE
        )
    );

-- Création de la table pour l'historique de modération des restaurants
CREATE TABLE IF NOT EXISTS public.moderation_history (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.app_admins(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- ex: 'active', 'pending', 'cancelled'
    reason TEXT, -- Facultatif: pourquoi la décision a été prise
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sécurité RLS et Politiques pour moderation_history
ALTER TABLE public.moderation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read moderation history" 
    ON public.moderation_history 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.app_admins WHERE id = auth.uid()
        )
    );
