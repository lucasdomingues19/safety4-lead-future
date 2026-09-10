import { AlertCircle } from "lucide-react";
import { useState } from "react";

export function LmsAdminEmails() {
  const [automations, setAutomations] = useState([
    { id: 1, title: "Course purchased", description: "Sent the moment checkout completes, with login details and a link to start.", enabled: true, template: '"YOU\'RE IN — WELCOME TO "' },
    { id: 2, title: "Community subscription started", description: "Welcomes a new Community member and links to the discussion boards.", enabled: true, template: '"WELCOME TO THE COMMUNITY"' },
    { id: 3, title: "Offer or access granted", description: "Fires for both manual grants and purchase-triggered grants, listing what was unlocked.", enabled: true, template: '"YOU\'VE BEEN GRANTED ACCESS TO "' },
    { id: 4, title: "Course idle too long", description: "Reminder for learners who haven't engaged in a while. Turn off if you prefer not to send.", enabled: true, template: undefined },
  ]);

  const toggleAutomation = (id: number) => {
    setAutomations(automations.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <div style={{ marginTop: "28px", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Alert: No provider connected */}
      <div style={{ marginBottom: "28px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <AlertCircle size={24} color="#c93636" style={{ flex: "none" }} />
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0b2c" }}>No email provider connected</div>
            <div style={{ fontSize: "13px", color: "#69697b", marginTop: "2px" }}>Connect a sending address (SMTP, Postmark, Resend, SendGrid...) before turning any automation on.</div>
          </div>
        </div>
        <button
          style={{
            border: "none",
            background: "#3434ff",
            color: "#ffffff",
            fontFamily: "inherit",
            fontSize: "12px",
            fontWeight: 700,
            borderRadius: "8px",
            padding: "10px 16px",
            cursor: "pointer",
            flex: "none",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#2a2ad6"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#3434ff"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          CONNECT EMAIL
        </button>
      </div>

      {/* Automated Emails */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
        <div style={{ padding: "28px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#0b0b2c" }}>Automated emails</div>
          <div style={{ fontSize: "13px", color: "#69697b", marginTop: "8px" }}>Sent automatically when each event happens. Turn any off if you'd rather handle it yourself.</div>
        </div>
        {automations.map((automation, idx) => (
          <div
            key={automation.id}
            style={{
              padding: "24px 28px",
              borderBottom: idx < automations.length - 1 ? "1px solid #f1f4f8" : "none",
              display: "flex",
              alignItems: "flex-start",
              gap: "20px",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0b2c" }}>{automation.title}</div>
              <div style={{ fontSize: "13px", color: "#69697b", marginTop: "6px" }}>{automation.description}</div>
              {automation.template && (
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#3434ff", fontWeight: 600 }}>
                  E.G. {automation.template}
                  <button
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#3434ff",
                      fontFamily: "inherit",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      marginLeft: "12px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#2a2ad6"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#3434ff"; }}
                  >
                    Edit template
                  </button>
                </div>
              )}
            </div>
            <div
              style={{
                width: "48px",
                height: "28px",
                borderRadius: "14px",
                background: automation.enabled ? "#3434ff" : "#e2e8f0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "2px",
                transition: "all 0.2s ease",
                flex: "none",
              }}
              onClick={() => toggleAutomation(automation.id)}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  transition: "all 0.2s ease",
                  marginLeft: automation.enabled ? "22px" : "2px",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
