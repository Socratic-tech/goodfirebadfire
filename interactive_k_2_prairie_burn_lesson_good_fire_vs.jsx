import React, { useEffect, useRef, useState } from "react";

/**
 * Interactive Prairie Burn Lesson (K–2 + 3–5)
 * - React-only build ready for GitHub Pages
 * - Grade-band toggle with distinct cards & quizzes
 * - Visualizer (panels or slider), Sorting Game, Quiz, Safety Meter, Certificate
 * - Developer tests removed from UI (clean classroom view)
 * - Hidden console-based checks added (no UI output)
 */

/********************
 * Style helpers
 ********************/
const S = {
  page: { background: "linear-gradient(to bottom, #fef3c7, #ecfdf5, #dbeafe)", minHeight: "100vh", color: "#111" },
  container: { maxWidth: 1000, margin: "0 auto", padding: 16 },
  section: { background: "#fff", borderRadius: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.1)", padding: 16, margin: "16px 0" },
  h1: { margin: 0, fontSize: 28, fontWeight: 800 },
  h2: { margin: "0 0 12px", fontSize: 22, fontWeight: 700 },
  h3: { margin: "0 0 8px", fontSize: 18, fontWeight: 700 },
  p: { margin: "8px 0" },
  btn: { padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer" },
  btnPrimary: { background: "#111827", color: "#fff", border: "1px solid #111827" },
  toolbar: { display: "flex", gap: 8, flexWrap: "wrap" },
  grid3: { display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" },
  card: { border: "2px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff" },
  img: { width: "100%", height: 180, objectFit: "cover", borderRadius: 8, display: "block", background: "#ddd" },
  label: { fontSize: 12, color: "#444", display: "block", marginBottom: 6 },
  input: { padding: 8, borderRadius: 10, border: "1px solid #ddd", width: "100%" },
  row: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  small: { fontSize: 12, color: "#555" },
};

/********************
 * Visualizers
 ********************/
function PanelVisualizer() {
  const fallback = "https://placehold.co/400x200?text=Prairie+Image";
  const Cell = ({ label, tone, desc, img, alt }) => (
    <div style={{ ...S.card, borderColor: tone === "good" ? "#16a34a" : tone === "bad" ? "#dc2626" : "#f59e0b", borderWidth: 3 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800 }}>
        <span aria-hidden>{tone === "good" ? "✅" : tone === "bad" ? "⛔" : "🔥"}</span>
        <span>{label}</span>
      </div>
      <img src={img} alt={alt} style={{ ...S.img, height: 160 }} onError={(e)=>{e.currentTarget.src=fallback;}} />
      <p style={S.p}><strong>Look for:</strong> {desc}</p>
    </div>
  );
  return (
    <div style={S.grid3} aria-label="Before, During, After panels">
      <Cell label="BEFORE" tone="bad" desc="Old, brown grass covering the ground." img="https://upload.wikimedia.org/wikipedia/commons/0/0f/Prairie_in_autumn.jpg" alt="Dry brown prairie" />
      <Cell label="DURING (Planned)" tone="neutral" desc="Small, careful flame with helpers nearby." img="https://upload.wikimedia.org/wikipedia/commons/4/4b/Prescribed_fire_example.jpg" alt="Planned prairie burn" />
      <Cell label="AFTER" tone="good" desc="New green shoots, flowers, and pollinators." img="https://upload.wikimedia.org/wikipedia/commons/1/15/Prairie_restored.jpg" alt="Green prairie after burn" />
    </div>
  );
}

function PhotoSliderVisualizer({ progress, setProgress, beforeUrl, afterUrl }) {
  const fallback = "https://placehold.co/600x300?text=Prairie+Photo";
  const beforeDemo = beforeUrl || "https://upload.wikimedia.org/wikipedia/commons/0/0f/Prairie_in_autumn.jpg";
  const afterDemo = afterUrl || "https://upload.wikimedia.org/wikipedia/commons/1/15/Prairie_restored.jpg";
  return (
    <>
      <div style={{ position: "relative", width: "100%", height: 260, borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb", background: "#fff" }}>
        <img src={beforeDemo} alt="Before burn" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} onError={(e)=>{e.currentTarget.src=fallback;}} />
        <img src={afterDemo} alt="After burn" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", clipPath: `inset(0 ${100 - progress}% 0 0)` }} onError={(e)=>{e.currentTarget.src=fallback;}} />
        <div style={{ position: "absolute", top: 8, left: 8, background: "#dc2626", color: "#fff", padding: "2px 6px", borderRadius: 6, fontSize: 12 }}>BEFORE</div>
        <div style={{ position: "absolute", top: 8, right: 8, background: "#16a34a", color: "#fff", padding: "2px 6px", borderRadius: 6, fontSize: 12 }}>AFTER</div>
        <div aria-hidden style={{ position: "absolute", top: 0, bottom: 0, left: `${progress}%`, width: 4, background: "#111" }} />
      </div>
      <label htmlFor="viz" style={{ ...S.label, marginTop: 8 }}>Move the slider to watch the prairie change:</label>
      <input id="viz" type="range" min={0} max={100} value={progress} onChange={(e) => setProgress(parseInt(e.target.value, 10))} style={{ width: "100%" }} />
      <div style={{ ...S.p, fontWeight: 700 }} aria-live="polite">
        {progress === 0 && "BEFORE — Old, brown grass covers the ground."}
        {progress > 0 && progress < 50 && "DURING — Small, planned flame: helpers keep it safe."}
        {progress >= 50 && progress < 100 && "AFTER — Green shoots appear and flowers return."}
        {progress === 100 && "AFTER — Prairie is open, sunny, and full of life!"}
      </div>
    </>
  );
}

/********************
 * Grade-band data
 ********************/
const CARDS_K2 = [
  { id: "s1", text: "Fire experts plan a small burn in spring.", good: true },
  { id: "s2", text: "A campfire is left burning at a park.", good: false },
  { id: "s3", text: "Prairie flowers bloom after last year’s burn.", good: true },
  { id: "s4", text: "Lightning starts a big fire in a drought.", good: false },
  { id: "s5", text: "Burn keeps trees from taking over the prairie.", good: true },
  { id: "s6", text: "Wind blows sparks toward houses.", good: false },
];
const CARDS_35 = [
  { id: "s1", text: "A prescribed burn reduces built‑up dry grass (fuel load).", good: true },
  { id: "s2", text: "People light fireworks near a prairie in high wind.", good: false },
  { id: "s3", text: "Burning helps sun‑loving flowers and grasses outcompete shrubs.", good: true },
  { id: "s4", text: "Smoke is blowing toward a neighborhood—burn proceeds anyway.", good: false },
  { id: "s5", text: "Trained crew checks wind, humidity, and has water on site.", good: true },
  { id: "s6", text: "Someone burns leaves without permission during a drought.", good: false },
];

const QUIZ_K2 = [
  { q: "What makes a fire a GOOD fire in a prairie?", options: ["It is planned and kept safe by experts.", "It is very big and very hot.", "It happens on the windiest day."], answer: 0 },
  { q: "How does a good fire help plants?", options: ["It covers flowers so they can’t grow.", "It clears old grass so new shoots can grow.", "It scares away bees forever."], answer: 1 },
  { q: "Which is a BAD fire?", options: ["A safe, planned burn in spring.", "A wildfire that races toward homes.", "A tiny campfire in a fire ring with water nearby."], answer: 1 },
];
const QUIZ_35 = [
  { q: "Which three things make up the fire triangle?", options: ["Heat, oxygen, fuel", "Wind, water, soil", "Sun, rain, snow"], answer: 0 },
  { q: "Why can prescribed fire help prairies stay prairies?", options: ["It adds more trees.", "It removes old thatch so grasses/forbs regrow.", "It pushes away sunlight."], answer: 1 },
  { q: "Which condition is MOST risky for a burn?", options: ["High wind and very dry grass", "Light wind and good humidity", "Wet grass and no wind"], answer: 0 },
  { q: "Where should smoke go on burn day?", options: ["Toward houses and roads", "Away from homes and roads as planned", "Straight down into the soil"], answer: 1 },
  { q: "Who decides if a burn is safe?", options: ["Anyone with matches", "Trained crew following a burn plan", "Students on the playground"], answer: 1 },
];

/********************
 * Sorting Game
 ********************/
function SortingGame({ cards }) {
  const [pool, setPool] = useState(cards);
  const [good, setGood] = useState([]);
  const [bad, setBad] = useState([]);
  const [message, setMessage] = useState("");
  const dragId = useRef(null);

  useEffect(() => { setPool(cards); setGood([]); setBad([]); setMessage(""); }, [cards]);

  const Card = ({ item }) => (
    <div draggable onDragStart={() => (dragId.current = item.id)} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
      <span>{item.text}</span>
      <div style={{ display: "flex", gap: 6 }}>
        <button style={{ ...S.btn, background: "#16a34a", color: "#fff", borderColor: "#16a34a" }} onClick={() => quickMove(item.id, "good")}>To Good</button>
        <button style={{ ...S.btn, background: "#dc2626", color: "#fff", borderColor: "#dc2626" }} onClick={() => quickMove(item.id, "bad")}>To Bad</button>
      </div>
    </div>
  );

  function removeFrom(list, id) { return list.filter((x) => x.id !== id); }
  function getById(id) { return pool.find((x) => x.id === id) || good.find((x) => x.id === id) || bad.find((x) => x.id === id); }

  function dropTo(target) {
    const id = dragId.current; if (!id) return;
    const item = getById(id); if (!item) return;
    setPool((p) => removeFrom(p, id));
    setGood((p) => removeFrom(p, id));
    setBad((p) => removeFrom(p, id));
    if (target === "good") setGood((p) => [...p, item]); else setBad((p) => [...p, item]);
    setMessage("");
  }
  function quickMove(id, target) { dragId.current = id; dropTo(target); }
  function checkAnswers() {
    const correct = pool.length === 0 && good.every((x) => x.good) && bad.every((x) => !x.good);
    setMessage(correct ? "Great sorting! You matched every card." : "Keep going—some cards need to be moved.");
  }

  const Drop = ({ label, list, target, color }) => (
    <div onDragOver={(e) => e.preventDefault()} onDrop={() => dropTo(target)} style={{ minHeight: 120, padding: 8, borderRadius: 14, border: `2px solid ${color}`, background: "#fff" }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "grid", gap: 8 }}>{list.length === 0 ? <div style={S.small}>(Drop cards here)</div> : list.map((it) => <Card key={it.id} item={it} />)}</div>
    </div>
  );

  return (
    <div>
      <p style={{ ...S.p, color: "#374151" }}>Drag each card into the correct box, or use the buttons on each card.</p>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div>
          <h3 style={S.h3}>Cards</h3>
          <div style={{ display: "grid", gap: 8 }}>{pool.length === 0 ? <div style={S.small}>(No more cards here)</div> : pool.map((it) => <Card key={it.id} item={it} />)}</div>
        </div>
        <Drop label="Good Fire (Helper)" list={good} target="good" color="#16a34a" />
        <Drop label="Bad Fire (Troublemaker)" list={bad} target="bad" color="#dc2626" />
      </div>
      <div style={{ ...S.row, marginTop: 10 }}>
        <button style={{ ...S.btn, background: "#4f46e5", color: "#fff", borderColor: "#4f46e5" }} onClick={checkAnswers}>Check My Sorting</button>
        <button style={S.btn} onClick={() => { setPool(cards); setGood([]); setBad([]); setMessage(""); }}>Reset</button>
        <div style={S.small} aria-live="polite">{message}</div>
      </div>
    </div>
  );
}

/********************
 * Quiz
 ********************/
function Quiz({ questions }) {
  const [answers, setAnswers] = useState(Array(questions.length).fill(-1));
  const [score, setScore] = useState(null);
  useEffect(() => { setAnswers(Array(questions.length).fill(-1)); setScore(null); }, [questions]);
  return (
    <div>
      <ol style={{ paddingLeft: 16 }}>
        {questions.map((q, i) => (
          <li key={i} style={{ marginBottom: 12 }}>
            <div style={{ ...S.p, fontWeight: 700 }}>{i + 1}. {q.q}</div>
            <div style={{ display: "grid", gap: 6 }}>
              {q.options.map((opt, j) => (
                <label key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, border: "1px solid #e5e7eb", borderRadius: 8 }}>
                  <input type="radio" name={`q${i}`} onChange={() => setAnswers((a) => Object.assign([...a], { [i]: j }))} checked={answers[i] === j} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <div style={{ ...S.row, marginTop: 8 }}>
        <button style={{ ...S.btn, background: "#4f46e5", color: "#fff", borderColor: "#4f46e5" }} onClick={() => { const s = answers.reduce((sum, a, i) => sum + (a === questions[i].answer ? 1 : 0), 0); setScore(s); }}>Check Answers</button>
        {score !== null && <div aria-live="polite" style={S.small}>Score: {score} / {questions.length} — {score === questions.length ? "Great job!" : "Try changing any that look tricky."}</div>}
      </div>
    </div>
  );
}

/********************
 * Safety Meter (demo only)
 ********************/
function SafetyMeter({ advanced=false }) {
  const [wind, setWind] = useState(5);
  const [humidity, setHumidity] = useState(45);
  const [dryness, setDryness] = useState(40);
  const isSafe = wind <= 12 && humidity >= 30 && dryness <= 60;
  const caution = !isSafe && wind <= 18 && humidity >= 20 && dryness <= 75;
  const status = isSafe ? "Likely OK for experts" : caution ? "Caution" : "Not safe";
  const color = isSafe ? "#16a34a" : caution ? "#f59e0b" : "#dc2626";

  // Opens a separate static page (data-collector.html) with query params
  function openDataCollector() {
    const params = new URLSearchParams({
      wind: String(wind),
      humidity: String(humidity),
      dryness: String(dryness),
    });
    window.open(`data-collector.html?${params.toString()}`, '_blank');
  }

  return (
    <div>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
        <label style={S.label}>Wind (mph): {wind}<input id="wind" type="range" min={0} max={30} value={wind} onChange={(e) => setWind(parseInt(e.target.value, 10))} style={{ width: "100%" }} /></label>
        <label style={S.label}>Humidity (%): {humidity}<input id="humidity" type="range" min={5} max={100} value={humidity} onChange={(e) => setHumidity(parseInt(e.target.value, 10))} style={{ width: "100%" }} /></label>
        <label style={S.label}>Dryness (0–100): {dryness}<input id="dryness" type="range" min={0} max={100} value={dryness} onChange={(e) => setDryness(parseInt(e.target.value, 10))} style={{ width: "100%" }} /></label>
      </div>
      <div role="status" aria-live="polite" style={{ marginTop: 10, display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
        <span style={{ display: "inline-block", padding: "6px 10px", borderRadius: 12, background: color, color: "#fff", fontWeight: 700 }}>Safety Meter: {status}</span>
        <button onClick={openDataCollector} style={{ ...S.btn, background:'#111827', color:'#fff', borderColor:'#111827' }}>Open Data Collector</button>
        <span style={S.small}>{advanced ? "This classroom model uses 3 inputs (wind, humidity, dryness) similar to parts of a burn plan. Real burn decisions consider many more factors." : "This is a kid‑friendly model for learning. Only trained experts decide when and how to do a burn."}</span>
      </div>
    </div>
  );
}

/********************
 * Step 5 (rich formatting)
 ********************/
function Step5({ is35 }) {
  const card = (title, children, tone = "neutral") => (
    <div style={{ ...S.card, borderColor: tone === "good" ? "#16a34a" : tone === "bad" ? "#dc2626" : "#e5e7eb" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span aria-hidden>{tone === "good" ? "✅" : tone === "bad" ? "⛔" : "📘"}</span>
        <h3 style={S.h3}>{title}</h3>
      </div>
      {children}
    </div>
  );

  if (!is35) {
    return (
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))" }}>
        {card("What you’ll see", (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li><strong>Helpers</strong> wearing yellow gear and helmets.</li>
            <li>Hoses, water backpacks, and special tools.</li>
            <li>A <strong>small, planned</strong> flame inside a safe area.</li>
            <li>Brown grass turns black; later it turns <strong>green</strong> again.</li>
          </ul>
        ), "neutral")}
        {card("How we stay safe (class rules)", (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>We stand in the <strong>watching zone</strong> with our class.</li>
            <li>We use <strong>fire‑respect voices</strong>: calm & quiet.</li>
            <li>We follow adult directions the <strong>first time</strong>.</li>
            <li>We keep hands and belongings away from the safe area.</li>
          </ul>
        ), "good")}
        {card("Do ✔ / Don’t ✖", (
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Do watch with your class.</li>
              <li>Do ask curious questions.</li>
              <li>Do notice new green shoots later.</li>
            </ul>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Don’t run toward the burn.</li>
              <li>Don’t touch tools or hoses.</li>
              <li>Don’t shout or push.</li>
            </ul>
          </div>
        ), "neutral")}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))" }}>
      {card("Crew & Roles", (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li><strong>Burn Boss</strong> leads the plan and safety checks.</li>
          <li><strong>Ignition crew</strong> lights the line in small sections.</li>
          <li><strong>Holding crew</strong> uses water/tools to keep fire inside lines.</li>
          <li><strong>Lookouts</strong> watch wind, smoke, and people.</li>
        </ul>
      ))}
      {card("Conditions & Boundaries", (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>Check <strong>wind</strong>, <strong>humidity</strong>, and <strong>fuel</strong> dryness.</li>
          <li>Stay inside <strong>firebreaks</strong> (mowed/black lines, paths).</li>
          <li>Smoke should drift <strong>away</strong> from homes/roads when possible.</li>
        </ul>
      ))}
      {card("Do ✔ / Don’t ✖", (
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Do observe cause/effect (thatch → nutrients → regrowth).</li>
            <li>Do notice fire triangle (heat, fuel, oxygen) in action.</li>
            <li>Do ask about the burn plan and safety roles.</li>
          </ul>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Don’t cross firebreaks or equipment lines.</li>
            <li>Don’t approach tools, tanks, or vehicles.</li>
            <li>Don’t distract crew during ignition/holding.</li>
          </ul>
        </div>
      ), "good")}
    </div>
  );
}

/********************
 * Certificate
 ********************/
function Certificate() {
  const [name, setName] = useState("");
  function printCert() {
    const html = `<!doctype html><html><head><meta charset='utf-8'/><title>Prairie Helper Certificate</title>
    <style>@page{size:letter;margin:20mm} body{font-family:system-ui,Segoe UI,Roboto,Arial;padding:24px}
    .card{border:4px solid #111;border-radius:18px;padding:32px;text-align:center}
    h1{font-size:28px;margin:0 0 8px} h2{font-size:22px;margin:4px 0 16px}
    .badge{display:inline-block;padding:8px 12px;border-radius:9999px;background:#16a34a;color:#fff;font-weight:700}
    </style></head><body>
    <div class='card'>
      <div class='badge'>Prairie Burn Prep</div>
      <h1>Prairie Helper Certificate</h1>
      <h2>${name ? name : "(Your Name)"}</h2>
      <p>understands the difference between <strong>Good Fire</strong> and <strong>Bad Fire</strong>, and knows how we watch safely from a distance while experts help the prairie grow.</p>
      <p style='margin-top:24px'>Date: ${new Date().toLocaleDateString()}</p>
    </div>
    <script>window.onload=()=>window.print()</script></body></html>`;
    const w = window.open("", "_blank"); if (!w) return; w.document.write(html); w.document.close();
  }
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "end", flexWrap: "wrap" }}>
      <label style={{ ...S.label, width: 280 }}>Student name
        <input style={S.input} placeholder="Type a name" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <button onClick={printCert} style={{ ...S.btn, background: "#16a34a", color: "#fff", borderColor: "#16a34a" }}>Print Certificate</button>
    </div>
  );
}

/********************
 * Main App
 ********************/
export default function PrairieLessonApp() {
  const [gradeBand, setGradeBand] = useState("K-2");
  const is35 = gradeBand === "3-5";
  const cards = is35 ? CARDS_35 : CARDS_K2;
  const questions = is35 ? QUIZ_35 : QUIZ_K2;

  const [simpleMode, setSimpleMode] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [progress, setProgress] = useState(50);
  const [autoplay, setAutoplay] = useState(false);
  const [beforeUrl, setBeforeUrl] = useState("");
  const [afterUrl, setAfterUrl] = useState("");

  // Autoplay for slider
  useEffect(() => {
    if (!autoplay) return; const id = setInterval(() => setProgress((p) => (p >= 100 ? 0 : p + 2)), 120); return () => clearInterval(id);
  }, [autoplay]);

  // Hidden developer checks (no UI)
  useEffect(() => {
    try {
      console.assert(typeof setProgress === 'function', 'setProgress should be a function');
    } catch {}
  }, []);

  return (
    <div style={S.page}>
      <main style={S.container}>
        <header style={{ ...S.section, display: "flex", flexDirection: "column", gap: 10 }}>
          <h1 style={S.h1}>{is35 ? "Prairie Burn Lesson — Grades 3–5" : "Good Fire vs. Bad Fire — Prairie Burn Prep (K–2)"}</h1>
          <p style={S.small}>{is35 ? "Use vocabulary (fuel, humidity, prescribed burn). Discuss cause/effect and safety tradeoffs." : "K–2 interactive lesson using story prompts, a prairie visualizer, a sorting game, and a quick quiz."}</p>
          <div style={S.toolbar}>
            <label style={S.label}>Grade band
              <select value={gradeBand} onChange={(e)=>setGradeBand(e.target.value)} style={{ ...S.input, width: 140 }}>
                <option value="K-2">K–2</option>
                <option value="3-5">3–5</option>
              </select>
            </label>
            <button style={{ ...S.btn, ...S.btnPrimary }} onClick={() => setShowTips((v) => !v)}>{showTips ? "Hide" : "Show"} Teacher Tips</button>
            <button style={S.btn} onClick={() => setAutoplay((v) => !v)} aria-pressed={autoplay}>{autoplay ? "Stop" : "Auto‑play"} Visualizer</button>
            <button style={S.btn} onClick={() => setSimpleMode((v) => !v)} aria-pressed={simpleMode}>{simpleMode ? "Detailed Mode" : "Simple Mode (K–2)"}</button>
          </div>
        </header>

        {/* Step 1 */}
        <section id="step1" style={S.section}>
          <h2 style={S.h2}>1) Warm‑Up</h2>
          <p style={S.p}>{is35 ? "Activate prior knowledge: What do you know about wildfires and prescribed burns? List fire‑triangle parts (fuel, heat, oxygen)." : "Start with a brief read‑aloud or picture walk. Ask: ‘How could fire help a prairie?’ and ‘What makes a fire safe or unsafe?’"}</p>
        </section>

        {/* Step 2 */}
        <section id="step2" style={S.section}>
          <h2 style={S.h2}>2) Prairie Visualizer (Before ⇄ After)</h2>
          {simpleMode ? (
            <PanelVisualizer />
          ) : (
            <>
              <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
                <label style={S.label}>Upload BEFORE photo (optional)
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) setBeforeUrl(URL.createObjectURL(f)); }} />
                </label>
                <label style={S.label}>Upload AFTER photo (optional)
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) setAfterUrl(URL.createObjectURL(f)); }} />
                </label>
              </div>
              <PhotoSliderVisualizer progress={progress} setProgress={setProgress} beforeUrl={beforeUrl} afterUrl={afterUrl} />
            </>
          )}
        </section>

        {/* Step 3 */}
        <section id="step3" style={S.section}>
          <h2 style={S.h2}>3) Sorting Game: Good Fire vs. Bad Fire</h2>
          <SortingGame cards={cards} />
        </section>

        {/* Step 4 */}
        <section id="step4" style={S.section}>
          <h2 style={S.h2}>4) Quick Quiz</h2>
          <Quiz questions={questions} />
        </section>

        {/* Step 5 */}
        <section id="step5" style={S.section}>
          <h2 style={S.h2}>5) Safety & What to Expect on Burn Day</h2>
          <Step5 is35={is35} />
        </section>

        {/* Step 6 */}
        <section id="step6" style={S.section}>
          <h2 style={S.h2}>6) Safe‑to‑Burn Simulator (demo)</h2>
          <SafetyMeter advanced={is35} />
        </section>

        {/* Step 7 */}
        <section id="step7" style={S.section}>
          <h2 style={S.h2}>7) Celebration Certificate</h2>
          <Certificate />
        </section>

        <footer style={{ ...S.small, textAlign: "center", marginTop: 16 }}>
          © Prairie Burn Lesson — For classroom use. No student data is collected or stored.
        </footer>
      </main>
    </div>
  );
}


/* =============================================
   EXTRA ASSET: Save the following as /public/data-collector.html
   (or at the repo root if using GitHub Pages without a build step).
   The Step 6 button opens this file, prefilled via URL params.
===============================================
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Prairie Burn — Data Collector</title>
    <style>
      body{font-family:system-ui,Segoe UI,Roboto,Arial;margin:0;padding:16px;background:#f8fafc;color:#111}
      h1{margin:0 0 8px;font-size:20px}
      .small{color:#555;font-size:12px;margin-bottom:12px}
      .row{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8;margin-bottom:8}
      input,button,textarea{padding:8px;border:1px solid #ddd;border-radius:10px}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}
      .btn{background:#111827;color:#fff;border:1px solid #111827;border-radius:10px;padding:8px 12px;cursor:pointer}
      .ghost{background:#fff;color:#111;border:1px solid #ddd}
    </style>
  </head>
  <body>
    <h1>Prairie Burn — Data Collector</h1>
    <div class="small">Log class readings for <strong>wind</strong>, <strong>humidity</strong>, and <strong>dryness</strong>. Add optional temperature & notes, then download a CSV to import into Google Sheets.</div>

    <div class="row">
      <label>Wind (mph)
        <input id="wind" type="number" />
      </label>
      <label>Humidity (%)
        <input id="humidity" type="number" />
      </label>
      <label>Dryness (0–100)
        <input id="dryness" type="number" />
      </label>
      <label>Temperature (°F)
        <input id="temp" type="number" placeholder="optional" />
      </label>
    </div>
    <label>Notes
      <textarea id="notes" rows="2" placeholder="Crew, sky, smoke direction, etc."></textarea>
    </label>
    <div style="display:flex;gap:8;margin-top:8">
      <button class="btn" id="add">Add Data Point</button>
      <button class="btn ghost" id="download">Download CSV</button>
      <button class="btn ghost" id="clear">Clear Table</button>
    </div>

    <table id="tbl"><thead><tr><th>Timestamp</th><th>Wind (mph)</th><th>Humidity (%)</th><th>Dryness</th><th>Temp (°F)</th><th>Notes</th></tr></thead><tbody></tbody></table>

    <script>
      (function(){
        // Prefill from query string
        var sp = new URLSearchParams(location.search);
        var wind = sp.get('wind');
        var humidity = sp.get('humidity');
        var dryness = sp.get('dryness');
        if (wind) document.getElementById('wind').value = wind;
        if (humidity) document.getElementById('humidity').value = humidity;
        if (dryness) document.getElementById('dryness').value = dryness;

        var tbody = document.querySelector('#tbl tbody');
        function addRow() {
          var now = new Date().toLocaleString();
          var w = (document.getElementById('wind').value||'').trim();
          var h = (document.getElementById('humidity').value||'').trim();
          var d = (document.getElementById('dryness').value||'').trim();
          var t = (document.getElementById('temp').value||'').trim();
          var n = (document.getElementById('notes').value||'').trim();
          var tr = document.createElement('tr');
          [now,w,h,d,t,n].forEach(function(v){ var td=document.createElement('td'); td.textContent=v; tr.appendChild(td); });
          tbody.appendChild(tr);
          document.getElementById('notes').value='';
        }
        function toCSV() {
          var rows = [['Timestamp','Wind (mph)','Humidity (%)','Dryness','Temp (°F)','Notes']];
          Array.from(tbody.querySelectorAll('tr')).forEach(function(tr){
            rows.push(Array.from(tr.children).map(function(td){ return '"' + ((td.textContent||'').replaceAll('"','""')) + '"'; }));
          });
          var csv = rows.map(function(r){ return Array.isArray(r) ? r.join(',') : r; }).join('
');
          var a = document.createElement('a');
          a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
          a.download = 'prairie-burn-data.csv';
          a.click();
        }
        function clearTable(){ tbody.innerHTML=''; }
        document.getElementById('add').addEventListener('click', addRow);
        document.getElementById('download').addEventListener('click', toCSV);
        document.getElementById('clear').addEventListener('click', clearTable);
      })();
    </script>
  </body>
</html>
=============================================== */
