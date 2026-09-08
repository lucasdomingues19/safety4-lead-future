export function LmsCourseView({ course }: any) {
  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 28px 72px" }}>
      <h1 style={{ fontSize: "38px", fontWeight: 700 }}>Course View (Coming Soon)</h1>
      <p style={{ color: "#69697B", marginTop: "12px" }}>{course?.title || "Select a course"}</p>
    </div>
  );
}
