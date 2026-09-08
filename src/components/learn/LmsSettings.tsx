import { useState } from "react";
import { Upload } from "lucide-react";

export function LmsSettings() {
  const [learnerName, setLearnerName] = useState("Sarah Chen");
  const [jobTitle, setJobTitle] = useState("HSE Manager");
  const [organisation, setOrganisation] = useState("LEGO Group");
  const [email, setEmail] = useState("ana.coutinho@example.com");
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [captionsDefault, setCaptionsDefault] = useState(true);
  const [emailReminders, setEmailReminders] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#eef1f6", color: "#0b0b2c", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "40px 28px 72px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#8ab815", marginBottom: "12px" }}>ACCOUNT</div>
        <h1 style={{ margin: "12px 0 0", fontSize: "38px", lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.01em" }}>Settings</h1>

        <div style={{ marginTop: "32px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "28px" }}>
          <div style={{ fontSize: "18px", fontWeight: 700 }}>Profile</div>
          <div style={{ marginTop: "18px", display: "flex", alignItems: "center", gap: "18px" }}>
            <div style={{ width: "76px", height: "76px", borderRadius: "50%", overflow: "hidden", flex: "none", border: "1px solid #e2e8f0", background: "#f1f4ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Upload size={24} color="#3434ff" /></div>
            <div><div style={{ fontSize: "14px", fontWeight: 600 }}>Profile photo</div><div style={{ marginTop: "4px", fontSize: "12.5px", color: "#94a3b8" }}>JPG or PNG, shown on your profile and in Community posts. Click the circle to upload.</div></div>
          </div>
          <div style={{ marginTop: "22px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "18px" }}>
            <div><div style={{ fontSize: "13px", fontWeight: 700, color: "#69697b", marginBottom: "8px" }}>Full name</div><input type="text" value={learnerName} onChange={(e) => setLearnerName(e.target.value)} style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "13px 15px", fontSize: "15px", fontFamily: "inherit", color: "#0b0b2c", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: "13px", fontWeight: 700, color: "#69697b", marginBottom: "8px" }}>Job title</div><input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "13px 15px", fontSize: "15px", fontFamily: "inherit", color: "#0b0b2c", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: "13px", fontWeight: 700, color: "#69697b", marginBottom: "8px" }}>Organisation</div><input type="text" value={organisation} onChange={(e) => setOrganisation(e.target.value)} style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "13px 15px", fontSize: "15px", fontFamily: "inherit", color: "#0b0b2c", boxSizing: "border-box" }} /></div>
            <div><div style={{ fontSize: "13px", fontWeight: 700, color: "#69697b", marginBottom: "8px" }}>Email</div><div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "13px 15px", fontSize: "15px", color: "#69697b" }}>{email}</div></div>
          </div>
        </div>

        <div style={{ marginTop: "20px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "20px", overflow: "hidden" }}>
          <div style={{ padding: "24px 28px", borderBottom: "1px solid #e2e8f0", fontSize: "18px", fontWeight: 700 }}>Playback & accessibility</div>
          <div style={{ padding: "22px 28px", borderBottom: "1px solid #f1f4f8", display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: "15px", fontWeight: 600 }}>Auto-advance slides</div><div style={{ marginTop: "4px", fontSize: "13px", color: "#94a3b8" }}>Modules play through without clicking</div></div>
            <button onClick={() => setAutoAdvance(!autoAdvance)} style={{ width: "46px", height: "26px", borderRadius: "999px", background: autoAdvance ? "#3434ff" : "#e2e8f0", border: "0", flex: "none", position: "relative", cursor: "pointer" }}><div style={{ position: "absolute", top: "3px", right: autoAdvance ? "3px" : "auto", left: autoAdvance ? "auto" : "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "all 0.2s" }}></div></button>
          </div>
          <div style={{ padding: "22px 28px", borderBottom: "1px solid #f1f4f8", display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: "15px", fontWeight: 600 }}>Captions on by default</div><div style={{ marginTop: "4px", fontSize: "13px", color: "#94a3b8" }}>Show narration captions in every module</div></div>
            <button onClick={() => setCaptionsDefault(!captionsDefault)} style={{ width: "46px", height: "26px", borderRadius: "999px", background: captionsDefault ? "#3434ff" : "#e2e8f0", border: "0", flex: "none", position: "relative", cursor: "pointer" }}><div style={{ position: "absolute", top: "3px", right: captionsDefault ? "3px" : "auto", left: captionsDefault ? "auto" : "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "all 0.2s" }}></div></button>
          </div>
          <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: "15px", fontWeight: 600 }}>Email reminders</div><div style={{ marginTop: "4px", fontSize: "13px", color: "#94a3b8" }}>A weekly nudge while the course is in progress</div></div>
            <button onClick={() => setEmailReminders(!emailReminders)} style={{ width: "46px", height: "26px", borderRadius: "999px", background: emailReminders ? "#3434ff" : "#e2e8f0", border: "0", flex: "none", position: "relative", cursor: "pointer" }}><div style={{ position: "absolute", top: "3px", right: emailReminders ? "3px" : "auto", left: emailReminders ? "auto" : "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transition: "all 0.2s" }}></div></button>
          </div>
        </div>

        <button style={{ marginTop: "24px", border: "0", borderRadius: "8px", background: "#3434ff", color: "#fff", fontFamily: "inherit", fontSize: "14px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "14px 30px", cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2ad6")} onMouseLeave={(e) => (e.currentTarget.style.background = "#3434ff")}>Save settings</button>
      </div>
    </div>
  );
}
