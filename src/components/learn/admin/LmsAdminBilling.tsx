import { Check } from "lucide-react";

export function LmsAdminBilling() {
  const invoices = [
    { name: "Marcus Reid", course: "Microsoft Copilot for EHS", date: "4 Sep 2026", amount: "£497.00", status: "PAID" },
    { name: "Sofia Almeida", course: "AI Fundamentals for Safety Leaders", date: "2 Sep 2026", amount: "£297.00", status: "PAID" },
    { name: "Tom Okafor", course: "AI Fundamentals for Safety Leaders", date: "30 Aug 2026", amount: "£297.00", status: "REFUNDED" },
    { name: "Priya Nandakumar", course: "Microsoft Copilot for EHS", date: "28 Aug 2026", amount: "£497.00", status: "PAID" },
  ];

  const coupons = [
    { code: "LAUNCH20", description: "20% off Microsoft Copilot for EHS", uses: 34 },
  ];

  return (
    <div style={{ marginTop: "28px", fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Stripe Connection */}
      <div style={{ marginBottom: "28px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#f4fbe4", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Check size={20} color="#8ab815" />
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0b0b2c" }}>Stripe</div>
            <div style={{ fontSize: "13px", color: "#69697b", marginTop: "2px" }}>Connected. Coupons and invoices sync to Stripe checkout automatically.</div>
          </div>
        </div>
        <button
          style={{
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: "#0b0b2c",
            fontFamily: "inherit",
            fontSize: "12px",
            fontWeight: 700,
            borderRadius: "8px",
            padding: "10px 16px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3434ff"; e.currentTarget.style.color = "#3434ff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#0b0b2c"; }}
        >
          DISCONNECT
        </button>
      </div>

      {/* Invoices */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)", marginBottom: "28px" }}>
        <div style={{ padding: "28px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#0b0b2c" }}>Invoices</div>
          <div style={{ fontSize: "13px", color: "#69697b", marginTop: "8px" }}>Invoices are issued automatically the moment a purchase completes.</div>
        </div>
        <div>
          {invoices.map((invoice, idx) => (
            <div
              key={idx}
              style={{
                padding: "20px 28px",
                borderBottom: idx < invoices.length - 1 ? "1px solid #f1f4f8" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0b0b2c" }}>{invoice.name}</div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>{invoice.course} · {invoice.date}</div>
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#0b0b2c", flex: "none" }}>{invoice.amount}</div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: invoice.status === "PAID" ? "#8ab815" : "#c93636", background: invoice.status === "PAID" ? "#f4fbe4" : "#fff5f5", padding: "6px 10px", borderRadius: "4px", flex: "none" }}>
                {invoice.status}
              </div>
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#3434ff",
                  fontFamily: "inherit",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  flex: "none",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#2a2ad6"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#3434ff"; }}
              >
                PDF
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Discount Coupons */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 8px rgba(11,11,44,0.06)" }}>
        <div style={{ padding: "28px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#0b0b2c" }}>Discount coupons</div>
        </div>
        <div>
          {coupons.map((coupon, idx) => (
            <div
              key={idx}
              style={{
                padding: "20px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#3434ff" }}>{coupon.code}</div>
                <div style={{ fontSize: "12px", color: "#69697b", marginTop: "2px" }}>{coupon.description}</div>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", flex: "none" }}>{coupon.uses} uses</div>
              <button
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#c93636",
                  fontFamily: "inherit",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  flex: "none",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#a82e2e"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#c93636"; }}
              >
                Disable
              </button>
            </div>
          ))}
        </div>
        <div style={{ padding: "20px 28px", borderTop: "1px solid #f1f4f8" }}>
          <button
            style={{
              border: "2px dashed #e2e8f0",
              background: "transparent",
              color: "#0b0b2c",
              fontFamily: "inherit",
              fontSize: "13px",
              fontWeight: 700,
              borderRadius: "8px",
              padding: "12px 20px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3434ff"; e.currentTarget.style.color = "#3434ff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#0b0b2c"; }}
          >
            + New coupon
          </button>
        </div>
      </div>
    </div>
  );
}
