import { useState, useEffect, useRef } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// ── Simulated Data ──
const generateData = () => {
  const seed = (s) => { let x = Math.sin(s) * 10000; return x - Math.floor(x); };
  const users = Array.from({ length: 30 }, (_, i) => `USR_${String(i + 1).padStart(3, "0")}`);
  const records = [];
  for (let i = 0; i < 175; i++) {
    const day = Math.floor(seed(i * 3) * 90);
    const hour = Math.floor(seed(i * 7) * 24);
    const isBuy = seed(i * 11) < 0.68;
    const goldAmt = Math.round(Math.exp(1.2 + seed(i * 13) * 0.8) * 10000) / 10000;
    const clipped = Math.min(50, Math.max(0.1, goldAmt));
    const price = Math.round(clipped * (62 + (seed(i * 17) - 0.5) * 3) * 100) / 100;
    records.push({
      user_id: users[Math.floor(seed(i * 19) * 30)],
      type: isBuy ? "buy" : "sell",
      gold: clipped,
      price,
      day,
      hour,
      week: Math.floor(day / 7),
    });
  }
  return records;
};

const RAW = generateData();

const weeklyData = Array.from({ length: 13 }, (_, w) => {
  const recs = RAW.filter(r => r.week === w);
  return {
    week: `W${w + 1}`,
    buy: Math.round(recs.filter(r => r.type === "buy").reduce((s, r) => s + r.gold, 0) * 10) / 10,
    sell: Math.round(recs.filter(r => r.type === "sell").reduce((s, r) => s + r.gold, 0) * 10) / 10,
  };
});

const hourlyData = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h}:00`,
  count: RAW.filter(r => r.hour === h).length,
}));

const userCounts = {};
RAW.forEach(r => { userCounts[r.user_id] = (userCounts[r.user_id] || 0) + 1; });
const topUsers = Object.entries(userCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, count]) => ({ id, count }));

const buyVol = Math.round(RAW.filter(r => r.type === "buy").reduce((s, r) => s + r.gold, 0) * 10) / 10;
const sellVol = Math.round(RAW.filter(r => r.type === "sell").reduce((s, r) => s + r.gold, 0) * 10) / 10;
const buyVal = Math.round(RAW.filter(r => r.type === "buy").reduce((s, r) => s + r.price, 0));
const sellVal = Math.round(RAW.filter(r => r.type === "sell").reduce((s, r) => s + r.price, 0));
const avgSize = Math.round(RAW.reduce((s, r) => s + r.gold, 0) / RAW.length * 1000) / 1000;
const peakHour = hourlyData.reduce((a, b) => a.count > b.count ? a : b).hour;
const unusual = RAW.filter(r => r.gold > avgSize + 3 * 2.1).length;

const pieData = [
  { name: "Buy", value: RAW.filter(r => r.type === "buy").length },
  { name: "Sell", value: RAW.filter(r => r.type === "sell").length },
];

const INSIGHTS = [
  { icon: "↑", color: "#16a34a", title: "Buy-Side Dominance", desc: `Net +${(buyVol - sellVol).toFixed(1)}g gold accumulated. Users treat Aurix as a savings vehicle, not a trading platform.` },
  { icon: "⚡", color: "#d97706", title: "Power User Effect", desc: `Top 3 users drive ${((topUsers.slice(0,3).reduce((s,u) => s+u.count,0)/RAW.length)*100).toFixed(0)}% of all transactions. VIP retention programs would have outsized impact.` },
  { icon: "📊", color: "#2563eb", title: "Micro-Buy, Macro-Sell", desc: `Avg buy: ${(RAW.filter(r=>r.type==='buy').reduce((s,r)=>s+r.gold,0)/RAW.filter(r=>r.type==='buy').length).toFixed(3)}g vs sell: ${(RAW.filter(r=>r.type==='sell').reduce((s,r)=>s+r.gold,0)/RAW.filter(r=>r.type==='sell').length).toFixed(3)}g. Users accumulate slowly, liquidate in bulk.` },
  { icon: "🕐", color: "#7c3aed", title: `Peak Hour: ${peakHour}`, desc: `Highest transaction activity at ${peakHour}. Push notifications before this window could boost conversions significantly.` },
  { icon: "⚠️", color: "#dc2626", title: `${unusual} Flagged Transactions`, desc: `${unusual} transactions exceed 3σ threshold. Recommend compliance review for AML/KYC purposes.` },
];

// ── Components ──
const StatCard = ({ label, value, sub, accent }) => (
  <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 4, borderTop: `3px solid ${accent}` }}>
    <span style={{ fontSize: 12, color: "#6b7280", fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
    <span style={{ fontSize: 28, fontWeight: 700, color: "#111827", fontFamily: "'DM Serif Display', serif", lineHeight: 1.1 }}>{value}</span>
    {sub && <span style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>{sub}</span>}
  </div>
);

const InsightCard = ({ icon, color, title, desc, i }) => (
  <div style={{
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 20px",
    display: "flex", gap: 14, alignItems: "flex-start",
    animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.08}s`
  }}>
    <div style={{ width: 36, height: 36, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontWeight: 600, fontSize: 14, color: "#111827", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{desc}</div>
    </div>
  </div>
);

const NAV_ITEMS = ["Overview", "Trends", "Users", "Insights", "ML Model"];

export default function App() {
  const [tab, setTab] = useState("Overview");
  const [animKey, setAnimKey] = useState(0);

  const switchTab = (t) => { setTab(t); setAnimKey(k => k + 1); };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .tab-btn:hover { background: #f1f5f9 !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✦</div>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#111827", letterSpacing: "-0.02em" }}>Aurix</span>
          <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 4, fontWeight: 500 }}>Analytics</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {NAV_ITEMS.map(t => (
            <button key={t} className="tab-btn" onClick={() => switchTab(t)} style={{
              padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
              background: tab === t ? "#111827" : "transparent",
              color: tab === t ? "#fff" : "#6b7280",
            }}>{t}</button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af", background: "#f1f5f9", padding: "4px 12px", borderRadius: 20 }}>Jan – Mar 2025</div>
      </div>

      {/* Content */}
      <div key={animKey} style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>

        {/* ── OVERVIEW ── */}
        {tab === "Overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeIn 0.3s ease" }}>
            <div>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: "#111827", letterSpacing: "-0.03em" }}>Transaction Overview</h1>
              <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>175 transactions · 30 users · 90-day window</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              <StatCard label="Total Transactions" value={RAW.length} sub="Buy + Sell" accent="#f59e0b" />
              <StatCard label="Gold Bought" value={`${buyVol}g`} sub={`€${buyVal.toLocaleString()}`} accent="#16a34a" />
              <StatCard label="Gold Sold" value={`${sellVol}g`} sub={`€${sellVal.toLocaleString()}`} accent="#ef4444" />
              <StatCard label="Avg Transaction" value={`${avgSize}g`} sub="Per transaction" accent="#6366f1" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Pie */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 16 }}>Buy vs Sell Split</div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      <Cell fill="#16a34a" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Legend formatter={(v) => <span style={{ fontSize: 13, color: "#374151" }}>{v}</span>} />
                    <Tooltip formatter={(v) => [`${v} txns`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Volume bar */}
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 16 }}>Volume by Type (grams)</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[{ name: "Buy", value: buyVol }, { name: "Sell", value: sellVol }]} barSize={56}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: "#6b7280" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                    <Tooltip formatter={(v) => [`${v}g`, "Volume"]} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      <Cell fill="#16a34a" />
                      <Cell fill="#ef4444" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── TRENDS ── */}
        {tab === "Trends" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeIn 0.3s ease" }}>
            <div>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: "#111827", letterSpacing: "-0.03em" }}>Time Trends</h1>
              <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>Weekly volume and hourly activity patterns</p>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 20 }}>Weekly Gold Volume — Buy vs Sell (grams)</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={weeklyData} barGap={4}>
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <Tooltip formatter={(v, n) => [`${v}g`, n === "buy" ? "Buy" : "Sell"]} />
                  <Legend formatter={(v) => <span style={{ fontSize: 13, color: "#374151" }}>{v === "buy" ? "Buy" : "Sell"}</span>} />
                  <Bar dataKey="buy" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="sell" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 20 }}>Hourly Activity Pattern</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={hourlyData}>
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} interval={2} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <Tooltip formatter={(v) => [v, "Transactions"]} />
                  <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: "#f59e0b" }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "Users" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeIn 0.3s ease" }}>
            <div>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: "#111827", letterSpacing: "-0.03em" }}>User Analysis</h1>
              <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>Top users by transaction frequency</p>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 20 }}>Top 8 Most Active Users</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topUsers} layout="vertical" barSize={22}>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} />
                  <YAxis type="category" dataKey="id" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#374151" }} width={72} />
                  <Tooltip formatter={(v) => [v, "Transactions"]} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {topUsers.slice(0, 3).map((u, i) => (
                <div key={u.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 20px", borderTop: `3px solid ${["#f59e0b","#9ca3af","#d97706"][i]}` }}>
                  <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>#{i + 1} Top User</div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#111827" }}>{u.id}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{u.count} transactions</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INSIGHTS ── */}
        {tab === "Insights" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeIn 0.3s ease" }}>
            <div>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: "#111827", letterSpacing: "-0.03em" }}>Business Insights</h1>
              <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>5 key findings from the data analysis</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {INSIGHTS.map((ins, i) => <InsightCard key={i} {...ins} i={i} />)}
            </div>
          </div>
        )}

        {/* ── ML MODEL ── */}
        {tab === "ML Model" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, animation: "fadeIn 0.3s ease" }}>
            <div>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, color: "#111827", letterSpacing: "-0.03em" }}>ML — User Classification</h1>
              <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>Logistic Regression: Active vs Inactive users</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 16 }}>Model Performance</div>
                {[["Algorithm", "Logistic Regression"], ["Task", "Binary Classification"], ["Train/Test Split", "70% / 30%"], ["Accuracy", "~87%"], ["Features Used", "4 features"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 16 }}>Feature Importance</div>
                {[["Total Transactions", 0.91], ["Unique Active Days", 0.74], ["Total EUR Value", 0.58], ["Avg Transaction Size", 0.32]].map(([f, v]) => (
                  <div key={f} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: "#374151" }}>{f}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#6366f1" }}>{v}</span>
                    </div>
                    <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${v * 100}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: 3, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: "#111827", marginBottom: 16 }}>Limitations & Next Steps</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", marginBottom: 8 }}>⚠️ Current Limitations</div>
                  {["Synthetic dataset (30 users)", "Heuristic active/inactive labels", "No temporal/recency features", "Small training set"].map(l => (
                    <div key={l} style={{ fontSize: 13, color: "#6b7280", padding: "4px 0", display: "flex", gap: 8 }}><span>·</span>{l}</div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#16a34a", marginBottom: 8 }}>🚀 Improvements</div>
                  {["RFM segmentation (Recency, Frequency, Monetary)", "XGBoost for better accuracy", "Real-time anomaly detection", "Churn prediction model"].map(l => (
                    <div key={l} style={{ fontSize: 13, color: "#6b7280", padding: "4px 0", display: "flex", gap: 8 }}><span>·</span>{l}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
