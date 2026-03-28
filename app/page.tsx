"use client";

import { useState } from "react";

const WA_NUMBER = "2250503681588";
const WEBHOOK_URL = "https://hook.eu2.make.com/f87hedxh9899wk9jlx8xuot1um510nvw";

/** Génère un code unique ex: menlyla-220326-A3F9K2 */
function generateLeadCode(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rand = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `menlyla-${dd}${mm}${yy}-${rand}`;
}

export default function LeadMagnet() {
  const [form, setForm] = useState({ name: "", restaurant: "", whatsapp: "", email: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const now = new Date();
    const leadCode = generateLeadCode();
    const sentAt = now.toLocaleString("fr-FR", { timeZone: "Africa/Abidjan", hour12: false });

    // 1️⃣ Envoi au webhook Make.com
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_code: leadCode,
          sent_at: sentAt,
          name: form.name,
          restaurant: form.restaurant,
          whatsapp: form.whatsapp,
          email: form.email || null,
          source: "lead-magnet",
        }),
      });
    } catch (_) {
      // Silencieux — ne bloque pas l'expérience utilisateur
    }

    // 2️⃣ Ouverture WhatsApp avec toutes les infos + code
    const msg = encodeURIComponent(
      ` Bonjour Menlyla !\n\n` +
      `Je veux mon menu digital GRATUIT :\n\n` +
      ` Code : ${leadCode}\n` +
      ` Date : ${sentAt}\n` +
      ` Prénom : ${form.name}\n` +
      ` Restaurant : ${form.restaurant}\n` +
      ` Mon numéro : ${form.whatsapp}\n` +
      ` Email : ${form.email || "Non renseigné"}`
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, "_blank");

    setLoading(false);
    setSent(true);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #0f172a; color: #fff; overscroll-behavior: none; }

        .page { 
          min-height: 100vh; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          padding: 40px 24px;
          background: linear-gradient(135deg, #0f172a 0%, #1e3358 60%, #0f172a 100%);
          position: relative;
          overflow: hidden;
        }
        .page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        .container {
          position: relative;
          z-index: 10;
          max-width: 1100px;
          width: 100%;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 60px;
        }

        /* ── LEFT SIDE : CONTENT ── */
        .content-side {
          flex: 1;
          text-align: left;
        }

        .badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(234,88,12,0.25); border: 1px solid #f97316;
          color: #fff; font-size: 11px; font-weight: 800;
          padding: 8px 18px; border-radius: 100px; letter-spacing: 0.1em;
          text-transform: uppercase; margin-bottom: 28px;
          box-shadow: 0 0 15px rgba(249,115,22,0.5), inset 0 0 8px rgba(249,115,22,0.3);
          animation: blink-strong 1.2s infinite ease-in-out, glow-burn 1.5s infinite alternate;
          text-shadow: 0 0 5px rgba(255,255,255,0.4);
        }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; box-shadow: 0 0 8px #fff; }

        @keyframes blink-strong { 
          0%, 100% { opacity: 1; transform: scale(1); } 
          50% { opacity: 0.8; transform: scale(1.02); } 
        }
        @keyframes glow-burn {
          0% { box-shadow: 0 0 10px rgba(249,115,22,0.5), inset 0 0 5px rgba(249,115,22,0.2); border-color: #f97316; }
          100% { box-shadow: 0 0 25px rgba(249,115,22,0.8), inset 0 0 15px rgba(249,115,22,0.4); border-color: #fb923c; }
        }

        .content-side h1 {
          font-size: clamp(36px, 5vw, 54px); font-weight: 900;
          line-height: 1.1; letter-spacing: -0.04em; color: #fff;
          margin-bottom: 24px;
        }
        .content-side h1 span { color: #f97316; }

        .content-side p.hero-desc {
          font-size: 18px; color: rgba(255,255,255,0.6);
          line-height: 1.6; max-width: 500px; margin-bottom: 40px;
        }

        /* ── RIGHT SIDE : FORM ── */
        .form-side {
          flex: 0 0 440px;
        }
        .form-card {
          background: #fff; border-radius: 28px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.3);
          padding: 40px; width: 100%;
        }
        .form-tag {
          display: inline-block; background: #fff7ed; color: #ea580c;
          font-size: 12px; font-weight: 700; padding: 5px 14px;
          border-radius: 100px; letter-spacing: 0.06em; text-transform: uppercase;
          margin-bottom: 16px;
        }
        .form-card h2 { font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.03em; margin-bottom: 6px; }
        .form-card p.form-subtitle { font-size: 14px; color: #64748b; margin-bottom: 32px; }

        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 6px; }
        .field input {
          width: 100%; padding: 12px 16px;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          font-size: 15px; font-family: 'Inter', sans-serif; color: #0f172a;
          outline: none; transition: border-color 0.2s;
          background: #f8fafc;
        }
        .field input:focus { border-color: #ea580c; background: #fff; }
        .field input::placeholder { color: #cbd5e1; }

        .cta-btn {
          width: 100%; padding: 16px; margin-top: 8px;
          background: linear-gradient(135deg, #ea580c, #f97316);
          color: #fff; font-size: 16px; font-weight: 800;
          border: none; border-radius: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          box-shadow: 0 10px 30px rgba(234,88,12,0.3);
          font-family: 'Inter', sans-serif; letter-spacing: -0.02em;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(234,88,12,0.4); }
        .cta-btn:active { transform: translateY(0); }
        .cta-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .trust { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 20px; font-weight: 500; }

        /* ── CONFIRMATION ── */
        .confirm {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .confirm-card {
          text-align: center; max-width: 440px; width: 100%;
          background: #fff; border-radius: 28px; padding: 60px 40px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.3);
        }
        .confirm-icon {
          width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 28px;
          background: linear-gradient(135deg, #25D366, #128C7E);
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; box-shadow: 0 15px 35px rgba(37,211,102,0.3);
        }
        .confirm-card h2 { font-size: 26px; font-weight: 900; color: #0f172a; margin-bottom: 12px; }
        .confirm-card p { color: #64748b; font-size: 16px; line-height: 1.65; }

        @media (max-width: 1024px) {
          .container { flex-direction: column; gap: 40px; text-align: center; }
          .content-side { text-align: center; }
          .content-side p.hero-desc { margin: 0 auto 40px; }
          .benefits { max-width: 440px; margin: 0 auto; text-align: left; }
          .form-side { width: 100%; max-width: 440px; }
        }

        @media (max-width: 480px) {
          .page { padding: 40px 16px; }
          .form-card { padding: 32px 24px; }
          .content-side h1 { font-size: 36px; }
        }

        .header {
          position: absolute;
          top: 0; left: 0; right: 0;
          padding: 24px 40px;
          display: flex; justify-content: flex-end;
          z-index: 100;
        }
        .login-link {
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 100px;
          transition: all 0.2s;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
        }
        .login-link:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.2);
        }
      `}</style>

      {sent ? (
        <div className="confirm">
          <div className="confirm-card">
            <div className="confirm-icon">✓</div>
            <h2>C'est envoyé {form.name.split(" ")[0]} ! 🎉</h2>
            <p>Notre équipe vous contacte sur WhatsApp sous <strong>1 heure</strong> pour créer votre menu digital gratuitement.</p>
          </div>
        </div>
      ) : (
        <div className="page">
          <header className="header">
            <a href="/login" className="login-link">Se connecter</a>
          </header>

          <div className="container">
            
            {/* ── GAUCHE : TEXTE & AVANTAGES ── */}
            <div className="content-side">
              <div className="badge">
                <span className="badge-dot" />
                Offre Gratuite · Limitée
              </div>

              <h1>
                Votre Menu Digital<br />
                <span>Prêt en 5 Minutes.</span>
              </h1>

              <p className="hero-desc">
                Arrêtez de perdre des clients avec un menu papier. Obtenez un <strong>menu QR code professionnel</strong> gratuitement, sans carte bancaire.
              </p>
            </div>

            {/* ── DROITE : FORMULAIRE ── */}
            <div className="form-side">
              <div className="form-card">
                <span className="form-tag">🎁 100% Gratuit</span>
                <h2>Créez votre menu maintenant</h2>
                <p className="form-subtitle">Réponse garantie sous 1h · Sans engagement</p>

                <form onSubmit={handleSubmit}>
                  <div className="field">
                    <label>Votre prénom *</label>
                    <input
                      type="text"
                      placeholder="Ex : Koné Sidoine"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Nom du restaurant *</label>
                    <input
                      type="text"
                      placeholder="Ex : Le Savoureux"
                      value={form.restaurant}
                      onChange={e => setForm(f => ({ ...f, restaurant: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Votre WhatsApp *</label>
                    <input
                      type="tel"
                      placeholder="+225 07 00 00 00 00"
                      value={form.whatsapp}
                      onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="field">
                    <label>Adresse Gmail</label>
                    <input
                      type="email"
                      placeholder="exemple@gmail.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>

                  <button type="submit" className="cta-btn" disabled={loading}>
                    {loading ? " Envoi en cours..." : " Obtenir mon Menu Gratuit"}
                  </button>
                </form>

                <p className="trust"> Vos données sont protégées · 0 spam</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </>

  );
}
