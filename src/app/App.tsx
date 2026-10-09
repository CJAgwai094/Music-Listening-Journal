import { useState, useEffect, useRef } from "react";
import { X, Plus, ChevronRight, Star, Search, Loader2 } from "lucide-react";
import React from "react";

const EMOTIONS = [
  "the emotion"
];

interface Entry {
  id: string;
  album: string;
  artist: string;
  genre: string;
  dateListened: string;
  rating: number;
  emotions: string[];
  notes: string;
  index: number;
  coverArt?: string;
}

interface FormData {
  album: string;
  artist: string;
  genre: string;
  dateListened: string;
  rating: number;
  emotions: string[];
  notes: string;
  coverArt?: string;
}

interface DiscogsResult {
  id: number;
  title: string; // "Artist - Album" format
  thumb: string;
  cover_image: string;
  genre?: string[];
  style?: string[];
  year?: string;
  type: string;
}

function parseDiscogsTitle(title: string): { artist: string; album: string } {
  const idx = title.indexOf(" - ");
  if (idx === -1) return { artist: "", album: title };
  return { artist: title.slice(0, idx), album: title.slice(idx + 3) };
}


function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function albumHue(index: number) {
  const hues = [210, 280, 160, 340, 30, 60, 190];
  return hues[index % hues.length];
}

function AlbumArt({ index, size = 48, coverArt }: { index: number; size?: number; coverArt?: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const h = albumHue(index);
  const fallback = (
    <div
      className="shrink-0"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, hsl(${h}, 28%, 20%) 0%, hsl(${h}, 18%, 12%) 100%)`,
      }}
    />
  );
  if (!coverArt || imgFailed) return fallback;
  return (
    <img
      src={coverArt}
      alt=""
      className="shrink-0 object-cover"
      style={{ width: size, height: size }}
      onError={() => setImgFailed(true)}
    />
  );
}

function RatingStars({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          className={`transition-colors ${onChange ? "cursor-pointer" : "cursor-default"} ${
            n <= rating ? "text-amber-400" : "text-foreground/15"
          }`}
        >
          <Star size={13} fill={n <= rating ? "currentColor" : "none"} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

function EntryCard({ entry, onClick }: { entry: Entry; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="w-full border-b border-border py-7 group transition-colors hover:bg-foreground/[0.02] cursor-pointer"
    >
      <div className="flex items-start gap-5">
        <span
          className="shrink-0 pt-0.5"
          style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--muted-foreground)", width: 24 }}
        >
          {String(entry.index).padStart(2, "0")}
        </span>

        <AlbumArt index={entry.index} size={104} coverArt={entry.coverArt} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3
                className="leading-tight text-foreground group-hover:text-amber-300 transition-colors truncate"
                style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 400 }}
              >
                {entry.album}
              </h3>
              <p
                className="mt-0.5 text-muted-foreground uppercase"
                style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.12em" }}
              >
                {entry.artist}
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <RatingStars rating={entry.rating} />
              <span
                className="text-muted-foreground"
                style={{ fontFamily: "'DM Mono', monospace", fontSize: 10 }}
              >
                {formatDate(entry.dateListened)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {entry.emotions.slice(0, 5).map((e) => (
              <span
                key={e}
                className="border border-border text-muted-foreground uppercase"
                style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.1em", padding: "2px 8px" }}
              >
                {e}
              </span>
            ))}
          </div>

          <p
            className="mt-2.5 text-muted-foreground leading-relaxed line-clamp-2"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 13, fontStyle: "italic" }}
          >
            {entry.notes}
          </p>
        </div>

        <ChevronRight
          size={14}
          className="shrink-0 mt-1 text-muted-foreground group-hover:text-amber-400 transition-colors"
        />
      </div>
    </div>
  );
}

function EntryDetail({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(14,12,10,0.97)", backdropFilter: "blur(8px)" }}>
      <div className="max-w-xl mx-auto px-6 py-14">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-14"
          style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}
        >
          <X size={11} /> Close
        </button>

        <div className="flex items-start gap-6 mb-10">
          <AlbumArt index={entry.index} size={192} coverArt={entry.coverArt} />
          <div>
            <p
              className="mb-2"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)" }}
            >
              First Listen No. {String(entry.index).padStart(2, "0")}
            </p>
            <h1
              className="text-foreground leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 400 }}
            >
              {entry.album}
            </h1>
            <p
              className="mt-1.5 text-muted-foreground uppercase"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.14em" }}
            >
              {entry.artist}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 border border-border mb-10" style={{ gap: 1, background: "var(--border)" }}>
          {[
            { label: "Date Heard", value: formatDate(entry.dateListened) },
            { label: "Genre", value: entry.genre || "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-background p-4">
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 6 }}>
                {label}
              </p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--foreground)" }}>
                {value}
              </p>
            </div>
          ))}
          <div className="bg-background p-4">
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 6 }}>
              Rating
            </p>
            <RatingStars rating={entry.rating} />
          </div>
        </div>

        <div className="mb-10">
          <p className="mb-3 text-muted-foreground uppercase" style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.12em" }}>
            How It Felt
          </p>
          <div className="flex flex-wrap gap-2">
            {entry.emotions.map((e) => (
              <span
                key={e}
                className="uppercase"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  padding: "5px 12px",
                  border: "1px solid rgba(201,151,58,0.4)",
                  color: "rgba(201,151,58,0.9)",
                }}
              >
                {e}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-muted-foreground uppercase" style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.12em" }}>
            Notes
          </p>
          <p
            className="leading-loose"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "rgba(240,235,224,0.82)", lineHeight: 1.9 }}
          >
            {entry.notes}
          </p>
        </div>
      </div>
    </div>
  );
}

function AlbumSearch({ onSelect }: { onSelect: (result: DiscogsResult) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DiscogsResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=master&per_page=8&key=fSGihGImJpNFVeOjwqSQ&secret=gEMophFbBTCKbHxAiVdblENWRxxCUcjn`,
          { headers: { "User-Agent": "MusicListenJournal/1.0" } }
        );
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelect(result: DiscogsResult) {
    onSelect(result);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative mb-8">
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 8 }}>
        Search Album
      </p>
      <div className="relative flex items-center">
        <Search size={13} className="absolute left-3 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an album..."
          style={{
            width: "100%",
            background: "var(--muted)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            fontFamily: "'Playfair Display', serif",
            fontSize: 15,
            padding: "10px 36px",
            outline: "none",
          }}
        />
        {loading && (
          <Loader2 size={13} className="absolute right-3 text-muted-foreground animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div
          className="absolute left-0 right-0 z-10"
          style={{ top: "calc(100% + 2px)", border: "1px solid var(--border)", background: "#111009", maxHeight: 360, overflowY: "auto" }}
        >
          {results.map((r) => {
            const { artist, album } = parseDiscogsTitle(r.title);
            const genre = r.style?.[0] ?? r.genre?.[0] ?? "";
            return (
              <div
                key={r.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(r)}
                onKeyDown={(e) => e.key === "Enter" && handleSelect(r)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-foreground/[0.06]"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                {r.thumb ? (
                  <img src={r.thumb} alt="" className="shrink-0 object-cover" style={{ width: 44, height: 44 }} />
                ) : (
                  <div className="shrink-0" style={{ width: 44, height: 44, background: "var(--secondary)" }} />
                )}
                <div className="min-w-0">
                  <p
                    className="truncate text-foreground"
                    style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, fontWeight: 400 }}
                  >
                    {album || r.title}
                  </p>
                  <p
                    className="truncate text-muted-foreground uppercase mt-0.5"
                    style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em" }}
                  >
                    {artist}
                    {genre ? ` · ${genre}` : ""}
                    {r.year ? ` · ${r.year}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && !loading && results.length === 0 && query.trim() && (
        <div
          className="absolute left-0 right-0 z-10 px-4 py-5"
          style={{ top: "calc(100% + 2px)", border: "1px solid var(--border)", background: "#111009" }}
        >
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            No results found
          </p>
        </div>
      )}
    </div>
  );
}

function AddEntryModal({ onClose, onSave, nextIndex }: {
  onClose: () => void;
  onSave: (data: FormData) => void;
  nextIndex: number;
}) {
  const [form, setForm] = useState<FormData>({
    album: "",
    artist: "",
    genre: "",
    dateListened: new Date().toISOString().split("T")[0],
    rating: 0,
    emotions: [],
    notes: "",
    coverArt: undefined,
  });

  function handleSearchSelect(result: DiscogsResult) {
    const { artist, album } = parseDiscogsTitle(result.title);
    const genre = result.style?.[0] ?? result.genre?.[0] ?? "";
    setForm((f) => ({
      ...f,
      album: album || result.title,
      artist,
      genre: genre || f.genre,
      coverArt: result.cover_image || result.thumb || undefined,
    }));
  }

  const toggleEmotion = (e: string) => {
    setForm((f) => ({
      ...f,
      emotions: f.emotions.includes(e) ? f.emotions.filter((x) => x !== e) : [...f.emotions, e],
    }));
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.album || !form.artist) return;
    onSave(form);
  };

  const inputStyle = {
    background: "var(--muted)",
    border: "1px solid var(--border)",
    color: "var(--foreground)",
    fontFamily: "'Playfair Display', serif",
    fontSize: 15,
    padding: "10px 12px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const labelStyle = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 9,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "var(--muted-foreground)",
    display: "block",
    marginBottom: 8,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(14,12,10,0.97)", backdropFilter: "blur(8px)" }}>
      <div className="max-w-xl mx-auto px-6 py-14">
        <div className="flex items-start justify-between mb-10">
          <div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 8 }}>
              First Listen No. {String(nextIndex).padStart(2, "0")}
            </p>
            <h2 className="text-foreground" style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 400 }}>
              Log a New Listen
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-1">
            <X size={18} />
          </button>
        </div>

        {/* Album search */}
        <AlbumSearch onSelect={handleSearchSelect} />

        {/* Cover art preview + fields */}
        <div className="flex items-start gap-5 mb-7">
          {form.coverArt ? (
            <img
              src={form.coverArt}
              alt=""
              className="shrink-0 object-cover"
              style={{ width: 80, height: 80 }}
            />
          ) : (
            <div
              className="shrink-0"
              style={{ width: 80, height: 80, background: "var(--muted)", border: "1px solid var(--border)" }}
            />
          )}
          <div className="flex-1 grid grid-cols-1 gap-4">
            <div>
              <label style={labelStyle}>Album *</label>
              <input
                type="text"
                value={form.album}
                onChange={(e) => setForm((f) => ({ ...f, album: e.target.value }))}
                placeholder="Album title"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Artist *</label>
              <input
                type="text"
                value={form.artist}
                onChange={(e) => setForm((f) => ({ ...f, artist: e.target.value }))}
                placeholder="Artist name"
                required
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-5 mb-7">
            <div>
              <label style={labelStyle}>Genre</label>
              <input
                type="text"
                value={form.genre}
                onChange={(e) => setForm((f) => ({ ...f, genre: e.target.value }))}
                placeholder="Optional"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Date Listened</label>
              <input
                type="date"
                value={form.dateListened}
                onChange={(e) => setForm((f) => ({ ...f, dateListened: e.target.value }))}
                style={{ ...inputStyle, fontFamily: "'DM Mono', monospace", fontSize: 12 }}
              />
            </div>
          </div>

          <div className="mb-7">
            <label style={labelStyle}>Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, rating: n }))}
                  style={{
                    width: 40,
                    height: 40,
                    border: `1px solid ${n <= form.rating ? "var(--accent)" : "var(--border)"}`,
                    background: n <= form.rating ? "rgba(201,151,58,0.12)" : "transparent",
                    color: n <= form.rating ? "var(--accent)" : "var(--muted-foreground)",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-7">
            <label style={labelStyle}>How Did It Feel?</label>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((e) => {
                const selected = form.emotions.includes(e);
                return (
                  <button
                    key={e}
                    type="button"
                    onClick={() => toggleEmotion(e)}
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "5px 10px",
                      border: `1px solid ${selected ? "rgba(201,151,58,0.6)" : "var(--border)"}`,
                      background: selected ? "rgba(201,151,58,0.1)" : "transparent",
                      color: selected ? "rgba(201,151,58,0.95)" : "var(--muted-foreground)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-10">
            <label style={labelStyle}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="What did this album make you feel? Where were you? What stood out?"
              rows={5}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.8 }}
            />
          </div>

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
                padding: "8px 16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                background: "var(--foreground)",
                color: "var(--background)",
                padding: "10px 24px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true); 
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    fetch("/api/entry")
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        return res.json();
      })
      .then((data: Entry[]) => setEntries(data))
      .catch((err) => console.error("Failed to load entries:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (data: FormData) => {
    const newEntry: Entry = {
      ...data,
      id: Date.now().toString(),
      index: entries.length + 1,
    };
    setEntries((prev) => [...prev, newEntry]);
    try {
      const response = await fetch("/api/entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEntry),
      });
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      console.log("Entry saved successfully:", response);
    } catch (error) {
      console.error("Failed to save entry:", error);
    }

    setShowAdd(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div className="flex items-end justify-between">
            <div>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 10, opacity: 0.85 }}>
                Personal Archive
              </p>
              <h1 className="text-foreground leading-none" style={{ fontFamily: "'Playfair Display', serif", fontSize: 44, fontWeight: 400 }}>
                First Listens
              </h1>
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                border: "1px solid var(--border)",
                padding: "9px 16px",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <Plus size={11} />
              Log Album
            </button>
          </div>
          <p className="text-muted-foreground mt-5" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em" }}>
            {entries.length} {entries.length === 1 ? "entry" : "entries"} recorded
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-24">
        {entries.length === 0 ? (
          <div className="py-28 text-center">
            <p className="text-foreground/25 mb-3" style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontStyle: "italic" }}>
              No listens logged yet
            </p>
            <p className="text-muted-foreground uppercase" style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.12em" }}>
              Start with the last album that stopped you in your tracks
            </p>
          </div>
        ) : (
          <div>
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} onClick={() => setSelectedEntry(entry)} />
            ))}
          </div>
        )}
      </main>

      {selectedEntry && (
        <EntryDetail entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}

      {showAdd && (
        <AddEntryModal
          onClose={() => setShowAdd(false)}
          onSave={handleSave}
          nextIndex={entries.length + 1}
        />
      )}
    </div>
  );
}
