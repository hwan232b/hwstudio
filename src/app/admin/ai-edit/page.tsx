"use client";

import React, { useEffect, useRef, useState } from "react";
import { AdminShell } from "@/components/AdminShell";

type Dials = Record<string, number>;
type Pair = { name: string; before: string | null; after: string; dials: Dials | null };
type Progress = { stage: "download" | "edit" | "upload"; done: number; total: number };

// The ten CIELAB dials, with plain-English labels and what a +/- move means.
const DIALS: { key: string; label: string; hint: string; pos: string; neg: string }[] = [
  { key: "exposure", label: "Exposure", hint: "overall brightness", pos: "brighter", neg: "darker" },
  { key: "contrast", label: "Contrast", hint: "tonal spread", pos: "more", neg: "less" },
  { key: "warmth", label: "Warmth", hint: "blue ↔ yellow", pos: "warmer", neg: "cooler" },
  { key: "tint", label: "Tint", hint: "green ↔ magenta", pos: "magenta", neg: "greener" },
  { key: "saturation", label: "Saturation", hint: "colorfulness", pos: "more", neg: "less" },
  { key: "vibrance_slope", label: "Vibrance", hint: "dull colors boosted more than saturated", pos: "up", neg: "down" },
  { key: "shadow_lift", label: "Shadows", hint: "darkest quarter of tones", pos: "lifted", neg: "deepened" },
  { key: "highlight_roll", label: "Highlights", hint: "brightest quarter of tones", pos: "raised", neg: "pulled down" },
  { key: "midtone_shift", label: "Midtones", hint: "mid-gray tone", pos: "up", neg: "down" },
  { key: "local_residual", label: "Local edits", hint: "beyond a global curve (dodge & burn)", pos: "more", neg: "less" },
];

function DialRows({ dials, scale }: { dials: Dials; scale: Dials }) {
  return (
    <ul className="dial-list">
      {DIALS.map((d) => {
        const value = dials[d.key] ?? 0;
        const max = scale[d.key] || 1;
        const pct = Math.max(-1, Math.min(1, value / max)) * 50;
        const direction = value > 0.02 ? d.pos : value < -0.02 ? d.neg : "no change";
        return (
          <li className="dial-row" key={d.key}>
            <div className="dial-head">
              <span className="dial-label">{d.label}</span>
              <span className="dial-value">
                <span>
                  {value >= 0 ? "+" : ""}
                  {value.toFixed(2)}
                </span>
                <em>{direction}</em>
              </span>
            </div>
            <div className="dial-track" aria-hidden="true">
              <span className="dial-center" />
              <span
                className="dial-fill"
                data-sign={value >= 0 ? "pos" : "neg"}
                style={pct >= 0 ? { left: "50%", width: `${pct}%` } : { left: `${50 + pct}%`, width: `${-pct}%` }}
              />
            </div>
            <span className="dial-hint">{d.hint}</span>
          </li>
        );
      })}
    </ul>
  );
}

// Draggable wipe: "before" on the left, "after" on the right, handle reveals.
function BeforeAfterSlider({ pair }: { pair: Pair }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromX = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <div
      className="ba-slider"
      ref={ref}
      role="slider"
      aria-label={`Drag to compare before and after for ${pair.name}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      tabIndex={0}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        setFromX(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && setFromX(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPos((p) => Math.max(0, p - 2));
        if (e.key === "ArrowRight") setPos((p) => Math.min(100, p + 2));
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="ba-base" src={pair.after} alt={`${pair.name} after`} draggable={false} />
      <div className="ba-top" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {pair.before ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pair.before} alt={`${pair.name} before`} draggable={false} />
        ) : (
          <span className="aiedit-missing" aria-hidden="true" />
        )}
      </div>
      <span className="ba-handle" style={{ left: `${pos}%` }} aria-hidden="true" />
      <span className="ba-tag ba-tag-before">Before</span>
      <span className="ba-tag ba-tag-after">After</span>
    </div>
  );
}

export default function AdminAiEditPage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [configured, setConfigured] = useState(true);
  const [beforeFolder, setBeforeFolder] = useState("");
  const [afterFolder, setAfterFolder] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [previews, setPreviews] = useState<Pair[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [shootAverage, setShootAverage] = useState<Dials | null>(null);
  const [active, setActive] = useState<Pair | null>(null);
  const [view, setView] = useState<"slider" | "split">("slider");

  useEffect(() => {
    fetch("/api/oauth/status")
      .then((r) => r.json())
      .then((d) => {
        setConnected(Boolean(d.connected));
        setConfigured(Boolean(d.configured));
      })
      .catch(() => setConnected(false));
    if (new URLSearchParams(window.location.search).get("connected") === "1") {
      setStatus("Google account connected.");
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  // Per-dial scale for the diverging bars: the largest move seen in this shoot,
  // so bars are comparable within the run without inventing fixed ranges.
  const scale: Dials = {};
  for (const d of DIALS) {
    let max = Math.abs(shootAverage?.[d.key] ?? 0);
    for (const p of previews) max = Math.max(max, Math.abs(p.dials?.[d.key] ?? 0));
    scale[d.key] = max || 1;
  }

  const progressLabel = (p: Progress) =>
    p.stage === "download"
      ? "Downloading photos from Drive…"
      : p.stage === "edit"
        ? `Editing ${p.done} / ${p.total}…`
        : `Uploading ${p.done} / ${p.total}…`;

  async function runEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setPreviews([]);
    setTruncated(false);
    setShootAverage(null);
    setStatus("");
    setProgress({ stage: "download", done: 0, total: 0 });
    try {
      const response = await fetch("/api/ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beforeFolder, afterFolder }),
      });
      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        setStatus(data.error ?? "Something went wrong.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, nl).trim();
          buf = buf.slice(nl + 1);
          if (!line) continue;
          const ev = JSON.parse(line);
          if (ev.type === "phase" && ev.phase === "download") {
            setProgress({ stage: "download", done: 0, total: 0 });
          } else if (ev.type === "phase" && ev.phase === "upload") {
            setProgress({ stage: "upload", done: 0, total: ev.total ?? 0 });
          } else if (ev.type === "progress") {
            setProgress({ stage: ev.stage, done: ev.done, total: ev.total });
          } else if (ev.type === "done") {
            setPreviews(ev.previews ?? []);
            setTruncated(Boolean(ev.truncated));
            setShootAverage(ev.shootAverage ?? null);
            setStatus(`Done — edited ${ev.edited} photos and added them to your after folder.`);
          } else if (ev.type === "error") {
            setStatus(ev.error ?? "Editing failed.");
          }
        }
      }
    } catch {
      setStatus("Couldn't reach the editor. Make sure the site is running on your Mac.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  return (
    <AdminShell title="Edit Studio">
      {status ? (
        <p className="admin-status" role="status">
          {status}
        </p>
      ) : null}

      {busy && progress ? (
        <div className="aiedit-progress" role="status" aria-live="polite">
          <span className="aiedit-progress-label">{progressLabel(progress)}</span>
          <div className="aiedit-progress-track">
            <span
              className={`aiedit-progress-fill${progress.total ? "" : " is-indeterminate"}`}
              style={progress.total ? { width: `${Math.round((progress.done / progress.total) * 100)}%` } : undefined}
            />
          </div>
        </div>
      ) : null}

      <div className="admin-editor-grid">
        <section className="admin-panel admin-form">
          <h2>Edit a shoot</h2>
          {!configured ? (
            <p className="admin-hint">
              Google OAuth isn&apos;t configured yet. Add your OAuth client ID and secret to the site&apos;s
              environment, then reload.
            </p>
          ) : connected === false ? (
            <>
              <p className="admin-hint">
                Connect your Google account once so the site can save edited photos into your Drive.
              </p>
              <a className="dark-button" href="/api/oauth/start">
                Connect Google account
              </a>
            </>
          ) : connected === null ? (
            <p className="admin-empty">Checking connection…</p>
          ) : (
            <form className="admin-form" onSubmit={runEdit}>
              <label>
                Before folder (unedited photos) — Drive link
                <input
                  value={beforeFolder}
                  onChange={(e) => setBeforeFolder(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/…"
                  required
                />
              </label>
              <label>
                After folder (where edits go) — Drive link
                <input
                  value={afterFolder}
                  onChange={(e) => setAfterFolder(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/…"
                  required
                />
              </label>
              <button className="dark-button" type="submit" disabled={busy}>
                {busy ? "Editing…" : "Edit into after folder"}
              </button>
            </form>
          )}
        </section>

        <section className="admin-panel">
          <h2>How it works</h2>
          <p className="admin-hint">
            The before folder is read with the studio service account, each photo is edited in your learned style,
            and the results are saved into the after folder as you. Share the <strong>before</strong> folder (Viewer)
            with <strong>hwstudio@photo-site-501601.iam.gserviceaccount.com</strong>. This runs while the site is open
            on your Mac. The edit is your consistent <em>baseline</em> look — a fast starting point, not a final edit.
          </p>
        </section>
      </div>

      {shootAverage ? (
        <section className="admin-panel aiedit-review">
          <h2>What your style did to this shoot</h2>
          <p className="admin-hint">
            The average edit across every photo, in the same ten CIELAB dials your signature is built from. Click any
            photo below to see its own breakdown.
          </p>
          <DialRows dials={shootAverage} scale={scale} />
        </section>
      ) : null}

      {previews.length > 0 ? (
        <section className="admin-panel aiedit-review">
          <div className="aiedit-review-head">
            <h2>Before &amp; after</h2>
            {afterFolder ? (
              <a className="text-button" href={afterFolder} target="_blank" rel="noreferrer">
                Open after folder in Drive
              </a>
            ) : null}
          </div>
          <p className="admin-hint">
            Your original on the left, edited on the right. Every photo is already saved in your after folder
            {truncated ? "; the first 24 are shown here." : "."} Click a photo to compare it and see how each dial moved.
          </p>
          <div className="aiedit-grid">
            {previews.map((pair) => (
              <figure className="aiedit-pair" key={pair.name}>
                <button
                  type="button"
                  className="aiedit-open"
                  onClick={() => setActive(pair)}
                  aria-label={`See how ${pair.name} was edited`}
                >
                  <span className="aiedit-shots">
                    <span className="aiedit-shot">
                      <em>Before</em>
                      {pair.before ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={pair.before} alt={`${pair.name} before`} loading="lazy" />
                      ) : (
                        <span className="aiedit-missing" aria-hidden="true" />
                      )}
                    </span>
                    <span className="aiedit-shot">
                      <em>After</em>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pair.after} alt={`${pair.name} after`} loading="lazy" />
                    </span>
                  </span>
                </button>
                <figcaption>{pair.name}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      {active ? (
        <div
          className="aiedit-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${active.name} edit breakdown`}
          onClick={() => setActive(null)}
        >
          <div className="aiedit-modal-inner" onClick={(e) => e.stopPropagation()}>
            <div className="aiedit-modal-head">
              <h2>{active.name}</h2>
              <div className="aiedit-modal-controls">
                <div className="aiedit-toggle" role="group" aria-label="Comparison view">
                  <button
                    type="button"
                    className={`text-button${view === "slider" ? " selected-button" : ""}`}
                    aria-pressed={view === "slider"}
                    onClick={() => setView("slider")}
                  >
                    Slider
                  </button>
                  <button
                    type="button"
                    className={`text-button${view === "split" ? " selected-button" : ""}`}
                    aria-pressed={view === "split"}
                    onClick={() => setView("split")}
                  >
                    Side by side
                  </button>
                </div>
                <button type="button" className="text-button" onClick={() => setActive(null)}>
                  Close
                </button>
              </div>
            </div>
            <div className="aiedit-modal-body">
              <div className="aiedit-modal-shots">
                {view === "slider" ? (
                  <BeforeAfterSlider pair={active} />
                ) : (
                  <div className="aiedit-split">
                    <span className="aiedit-shot">
                      <em>Before</em>
                      {active.before ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={active.before} alt={`${active.name} before`} />
                      ) : (
                        <span className="aiedit-missing" aria-hidden="true" />
                      )}
                    </span>
                    <span className="aiedit-shot">
                      <em>After</em>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={active.after} alt={`${active.name} after`} />
                    </span>
                  </div>
                )}
              </div>
              <div className="aiedit-modal-dials">
                {active.dials ? (
                  <DialRows dials={active.dials} scale={scale} />
                ) : (
                  <p className="admin-hint">No dial measurements for this photo.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
