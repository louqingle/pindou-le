"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  Sparkles,
  Flame,
  ArrowLeft,
  Check,
  Lock,
} from "lucide-react";

const COLORS = [
  "#111827",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#facc15",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#92400e",
  "#78350f",
  "#64748b",
  "#94a3b8",
  "#e2e8f0",
];

type Cell = string | null;

type Level = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  size: number;
  pattern: string[];
};

const LEVELS: Level[] = [
  {
    id: "heart",
    name: "爱心",
    emoji: "❤️",
    description: "送给喜欢的人",
    size: 16,
    pattern: [
      "000011110000",
      "000111111000",
      "001111111100",
      "011111111110",
      "011111111110",
      "011111111110",
      "001111111100",
      "000111111000",
      "000011110000",
      "000001100000",
    ],
  },
  {
    id: "star",
    name: "星星",
    emoji: "⭐",
    description: "闪闪发光",
    size: 16,
    pattern: [
      "000001100000",
      "000011110000",
      "000111111000",
      "011111111110",
      "001111111100",
      "000111111000",
      "001111111100",
      "011000001110",
      "110000000011",
      "000000000000",
    ],
  },
  {
    id: "strawberry",
    name: "草莓",
    emoji: "🍓",
    description: "甜甜的草莓",
    size: 16,
    pattern: [
      "000001100000",
      "000011110000",
      "000111111000",
      "001111111100",
      "011111111110",
      "011111111110",
      "011111111110",
      "001111111100",
      "001111111100",
      "000111111000",
    ],
  },
  {
    id: "cat",
    name: "小猫",
    emoji: "🐱",
    description: "喵喵喵",
    size: 16,
    pattern: [
      "110000000011",
      "111000000111",
      "111100001111",
      "111111111111",
      "111111111111",
      "110110110011",
      "111111111111",
      "111001110111",
      "111100011111",
      "011110111110",
    ],
  },
  {
    id: "dog",
    name: "小狗",
    emoji: "🐶",
    description: "汪汪汪",
    size: 16,
    pattern: [
      "111000000111",
      "111100001111",
      "111111111111",
      "111111111111",
      "110110110011",
      "111111111111",
      "111001110111",
      "111111111111",
      "011111111110",
      "001111111100",
    ],
  },
  {
    id: "panda",
    name: "熊猫",
    emoji: "🐼",
    description: "圆滚滚",
    size: 16,
    pattern: [
      "001111111100",
      "011111111110",
      "111111111111",
      "111111111111",
      "111111111111",
      "111111111111",
      "111111111111",
      "011111111110",
      "001111111100",
      "000111111000",
    ],
  },
  {
    id: "game",
    name: "游戏机",
    emoji: "🎮",
    description: "开始游戏",
    size: 16,
    pattern: [
      "000000000000",
      "001111111100",
      "011111111110",
      "111111111111",
      "111111111111",
      "111111111111",
      "111111111111",
      "011111111110",
      "001111111100",
      "000000000000",
    ],
  },
  {
    id: "flower",
    name: "樱花",
    emoji: "🌸",
    description: "春天来了",
    size: 16,
    pattern: [
      "000110110000",
      "001111111000",
      "011111111100",
      "111111111110",
      "011111111100",
      "001111111000",
      "000011000000",
      "000011000000",
      "000111100000",
      "001111110000",
    ],
  },
];

const MAX_HISTORY = 50;

function patternToGrid(pattern: string[], color: string): Cell[] {
  const rows = pattern.length;
  const cols = Math.max(...pattern.map((row) => row.length));

  const result: Cell[] = [];

  for (let y = 0; y < rows; y++) {
    const row = pattern[y];

    for (let x = 0; x < cols; x++) {
      result.push(row[x] === "1" ? color : null);
    }
  }

  return result;
}

function makeLevelGrid(level: Level): Cell[] {
  const target = patternToGrid(level.pattern, getLevelColor(level.id));

  const total = level.size * level.size;

  if (target.length === total) {
    return target;
  }

  const grid = Array<Cell>(total).fill(null);

  const rows = level.pattern.length;
  const cols = Math.max(...level.pattern.map((row) => row.length));

  const offsetY = Math.floor((level.size - rows) / 2);
  const offsetX = Math.floor((level.size - cols) / 2);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (level.pattern[y][x] === "1") {
        const index = (offsetY + y) * level.size + offsetX + x;

        if (index >= 0 && index < grid.length) {
          grid[index] = getLevelColor(level.id);
        }
      }
    }
  }

  return grid;
}

function getLevelColor(id: string) {
  switch (id) {
    case "heart":
      return "#ef4444";

    case "star":
      return "#facc15";

    case "strawberry":
      return "#f43f5e";

    case "cat":
      return "#f59e0b";

    case "dog":
      return "#92400e";

    case "panda":
      return "#111827";

    case "game":
      return "#3b82f6";

    case "flower":
      return "#ec4899";

    default:
      return "#ef4444";
  }
}

export default function Home() {
  const [mode, setMode] = useState<"levels" | "free">("levels");

  const [level, setLevel] = useState<Level | null>(null);

  const [size, setSize] = useState(16);
  const [grid, setGrid] = useState<Cell[]>([]);

  const [selected, setSelected] = useState(COLORS[2]);

  const [eraser, setEraser] = useState(false);

  const [history, setHistory] = useState<Cell[][]>([]);
  const [future, setFuture] = useState<Cell[][]>([]);

  const [zoom, setZoom] = useState(1);

  const [done, setDone] = useState(false);

  const [wrong, setWrong] = useState(false);

  const [mounted, setMounted] = useState(false);

  const [completedLevels, setCompletedLevels] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setMounted(true);

    try {
      const saved = localStorage.getItem("pindou-completed-v1");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setCompletedLevels(parsed);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(
      "pindou-completed-v1",
      JSON.stringify(completedLevels)
    );
  }, [completedLevels, mounted]);

  const filled = useMemo(() => {
    return grid.filter(Boolean).length;
  }, [grid]);

  const targetGrid = useMemo(() => {
    if (!level) return [];

    return makeLevelGrid(level);
  }, [level]);

  const targetCount = useMemo(() => {
    return targetGrid.filter(Boolean).length;
  }, [targetGrid]);

  const correctCount = useMemo(() => {
    if (!level || !grid.length) return 0;

    let count = 0;

    for (let i = 0; i < targetGrid.length; i++) {
      if (targetGrid[i] && grid[i] === targetGrid[i]) {
        count++;
      }
    }

    return count;
  }, [grid, targetGrid, level]);

  const progress = useMemo(() => {
    if (!targetCount) return 0;

    return Math.min(100, Math.round((correctCount / targetCount) * 100));
  }, [correctCount, targetCount]);

  function startLevel(item: Level) {
    setLevel(item);
    setMode("free");

    const emptyGrid = Array(item.size * item.size).fill(null);

    setSize(item.size);
    setGrid(emptyGrid);

    setHistory([]);
    setFuture([]);

    setSelected(getLevelColor(item.id));
    setEraser(false);

    setZoom(1);
    setDone(false);
    setWrong(false);
  }

  function startFree() {
    setLevel(null);
    setMode("free");

    setSize(32);
    setGrid(Array(32 * 32).fill(null));

    setHistory([]);
    setFuture([]);

    setSelected(COLORS[2]);
    setEraser(false);

    setZoom(1);
    setDone(false);
    setWrong(false);
  }

  function backToLevels() {
    setMode("levels");
    setLevel(null);
    setGrid([]);
    setHistory([]);
    setFuture([]);
    setDone(false);
    setWrong(false);
  }

  function changeCell(index: number) {
    const nextColor = eraser ? null : selected;

    if (grid[index] === nextColor) {
      return;
    }

    const previous = [...grid];
    const next = [...grid];

    next[index] = nextColor;

    setHistory((h) => [...h, previous].slice(-MAX_HISTORY));
    setFuture([]);
    setGrid(next);

    setWrong(false);

    if (level) {
      const target = targetGrid[index];

      if (nextColor !== target && nextColor !== null) {
        setWrong(true);

        window.setTimeout(() => {
          setWrong(false);
        }, 500);
      }
    }
  }

  function undo() {
    if (!history.length) return;

    const h = [...history];
    const previous = h.pop()!;

    setFuture((f) => [...f, [...grid]].slice(-MAX_HISTORY));
    setHistory(h);
    setGrid(previous);

    setWrong(false);
  }

  function redo() {
    if (!future.length) return;

    const f = [...future];
    const next = f.pop()!;

    setHistory((h) => [...h, [...grid]].slice(-MAX_HISTORY));
    setFuture(f);
    setGrid(next);

    setWrong(false);
  }

  function clearAll() {
    if (!filled) return;

    setHistory((h) => [...h, [...grid]].slice(-MAX_HISTORY));
    setFuture([]);

    setGrid(Array(size * size).fill(null));

    setWrong(false);
  }

  function resize(n: number) {
    setLevel(null);
    setMode("free");

    setSize(n);
    setGrid(Array(n * n).fill(null));

    setHistory([]);
    setFuture([]);

    setDone(false);
    setWrong(false);
    setZoom(1);
  }

  function finishLevel() {
    if (level) {
      if (progress === 100) {
        setDone(true);

        if (!completedLevels.includes(level.id)) {
          setCompletedLevels((items) => [...items, level.id]);
        }

        return;
      }

      setWrong(true);

      window.setTimeout(() => {
        setWrong(false);
      }, 900);

      return;
    }

    setDone(true);
  }

  function exportImage() {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const cell = 24;
    const radius = 8.8;

    canvas.width = size * cell;
    canvas.height = size * cell;

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    grid.forEach((color, index) => {
      const x = (index % size) * cell;
      const y = Math.floor(index / size) * cell;

      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(x, y, cell, cell);

      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;

      ctx.strokeRect(x, y, cell, cell);

      if (color) {
        ctx.fillStyle = color;

        ctx.beginPath();

        ctx.arc(
          x + cell / 2,
          y + cell / 2,
          radius,
          0,
          Math.PI * 2
        );

        ctx.fill();

        ctx.fillStyle = "#ffffff55";

        ctx.beginPath();

        ctx.arc(
          x + cell / 2 - 2.5,
          y + cell / 2 - 2.5,
          2.3,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }
    });

    const link = document.createElement("a");

    link.download = level
      ? `拼豆乐-${level.name}.png`
      : `我的拼豆作品-${size}x${size}.png`;

    link.href = canvas.toDataURL("image/png");

    link.click();
  }

  if (!mounted) {
    return (
      <main className="loading">
        正在准备拼豆乐…
      </main>
    );
  }

  /*
   * =========================
   * 关卡首页
   * =========================
   */

  if (mode === "levels") {
    return (
      <main className="app">
        <header className="topbar">
          <div>
            <div className="brand">
              <span>🧩</span>
              拼豆乐
            </div>

            <div className="sub">
              手机拼豆 · V1.2
            </div>
          </div>
        </header>

        <section
          style={{
            padding: "22px 14px 30px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 42,
                marginBottom: 8,
              }}
            >
              🧩
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 850,
                letterSpacing: "-1px",
              }}
            >
              选择一个作品
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: "#64748b",
                fontSize: 14,
              }}
            >
              按照目标图案，把拼豆一个个放进去
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            {LEVELS.map((item) => {
              const completed = completedLevels.includes(item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => startLevel(item)}
                  style={{
                    position: "relative",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    borderRadius: 18,
                    padding: 18,
                    minHeight: 170,
                    textAlign: "left",
                    boxShadow:
                      "0 4px 15px rgba(15,23,42,.05)",
                  }}
                >
                  {completed && (
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 25,
                        height: 25,
                        borderRadius: "50%",
                        background: "#22c55e",
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Check size={15} />
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: 42,
                      marginBottom: 8,
                    }}
                  >
                    {item.emoji}
                  </div>

                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      color: "#111827",
                    }}
                  >
                    {item.name}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#94a3b8",
                      marginTop: 4,
                    }}
                  >
                    {item.description}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#cbd5e1",
                      marginTop: 12,
                    }}
                  >
                    {completed ? "已完成" : "点击开始"}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={startFree}
            style={{
              width: "100%",
              height: 50,
              marginTop: 16,
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              background: "#fff",
              color: "#475569",
              fontWeight: 700,
            }}
          >
            🎨 自由创作
          </button>
        </section>
      </main>
    );
  }

  /*
   * =========================
   * 游戏页面
   * =========================
   */

  return (
    <main className="app">
      <header className="topbar">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <button
            onClick={backToLevels}
            style={{
              width: 34,
              height: 34,
              border: "1px solid #e2e8f0",
              background: "#fff",
              borderRadius: 10,
              display: "grid",
              placeItems: "center",
              color: "#475569",
            }}
            aria-label="返回"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="brand">
              <span>🧩</span>
              {level ? level.name : "自由创作"}
            </div>

            <div className="sub">
              {level ? "拼豆挑战" : "自由拼豆 · V1.2"}
            </div>
          </div>
        </div>

        <button
          className="export"
          onClick={exportImage}
        >
          <Download size={17} />
          导出
        </button>
      </header>

      {level && (
        <section
          style={{
            padding: "12px 14px 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 7,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "#64748b",
              }}
            >
              {level.emoji} {level.name}
            </span>

            <b
              style={{
                fontSize: 13,
                color: progress === 100
                  ? "#16a34a"
                  : "#111827",
              }}
            >
              {progress}%
            </b>
          </div>

          <div
            style={{
              height: 8,
              background: "#e2e8f0",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background:
                  progress === 100
                    ? "#22c55e"
                    : "#111827",
                borderRadius: 99,
                transition: "width .2s ease",
              }}
            />
          </div>
        </section>
      )}

      {wrong && level && (
        <div
          style={{
            margin: "10px 14px 0",
            padding: "10px 12px",
            borderRadius: 11,
            background: "#fff1f2",
            color: "#be123c",
            fontSize: 13,
            textAlign: "center",
            fontWeight: 700,
          }}
        >
          这里颜色不对，再试试看！
        </div>
      )}

      {level && (
        <section
          style={{
            padding: "12px 14px 0",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#94a3b8",
              marginBottom: 7,
            }}
          >
            目标图案
          </div>

          <div
            style={{
              width: 120,
              aspectRatio: "1",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              background: "#cbd5e1",
              padding: 1,
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {targetGrid.map((color, index) => (
              <span
                key={index}
                style={{
                  background: color || "#f8fafc",
                  border:
                    "0.5px solid rgba(71,85,105,.12)",
                }}
              />
            ))}
          </div>
        </section>
      )}

      <section className="board-wrap">
        <div className="board-head">
          <div>
            <b>
              {size} × {size}
            </b>

            <span>
              {filled} / {size * size} 颗
            </span>
          </div>

          <div className="zoom">
            <button
              onClick={() =>
                setZoom((z) =>
                  Math.max(
                    0.6,
                    Number((z - 0.1).toFixed(1))
                  )
                )
              }
            >
              −
            </button>

            <span>
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={() =>
                setZoom((z) =>
                  Math.min(
                    1.6,
                    Number((z + 0.1).toFixed(1))
                  )
                )
              }
            >
              +
            </button>
          </div>
        </div>

        <div className="board-scroll">
          <div
            className="board"
            style={
              {
                width: `min(92vw, ${Math.round(
                  620 * zoom
                )}px)`,
                aspectRatio: "1 / 1",
                "--n": size,
              } as React.CSSProperties
            }
          >
            {grid.map((color, index) => {
              const isCorrect =
                !!level &&
                !!targetGrid[index] &&
                color === targetGrid[index];

              const isWrong =
                !!level &&
                !!color &&
                color !== targetGrid[index];

              return (
                <button
                  key={index}
                  type="button"
                  aria-label={`第 ${index + 1} 格`}
                  className="cell"
                  onClick={() => changeCell(index)}
                  style={{
                    background:
                      color || "transparent",

                    border:
                      isWrong
                        ? "1px solid #fb7185"
                        : "1px solid rgba(71,85,105,.18)",

                    boxSizing: "border-box",

                    padding: 0,

                    boxShadow: color
                      ? isCorrect
                        ? "inset 0 1px 2px #ffffff88, inset 0 -2px 3px #0002, 0 0 0 1px #22c55e55"
                        : "inset 0 1px 2px #ffffff88, inset 0 -2px 3px #0002"
                      : "none",
                  }}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section className="controls">
        <div className="row">
          <button
            onClick={undo}
            disabled={!history.length}
          >
            <RotateCcw size={18} />
            撤销
          </button>

          <button
            onClick={redo}
            disabled={!future.length}
          >
            <RotateCw size={18} />
            重做
          </button>

          <button
            onClick={clearAll}
            disabled={!filled}
          >
            <Trash2 size={18} />
            清空
          </button>

          <button
            className={
              eraser
                ? "active danger"
                : ""
            }
            onClick={() =>
              setEraser((value) => !value)
            }
          >
            <Eraser size={18} />
            橡皮
          </button>
        </div>

        {!level && (
          <>
            <div className="size-row">
              <span>画板</span>

              {[32, 48, 64].map((n) => (
                <button
                  key={n}
                  className={
                    size === n
                      ? "chosen"
                      : ""
                  }
                  onClick={() =>
                    resize(n)
                  }
                >
                  {n}×{n}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="palette-title">
          <span>颜色</span>

          <span className="tip">
            {eraser
              ? "橡皮模式"
              : level
              ? `需要 ${level.name} 的颜色`
              : "选择颜色后点击格子"}
          </span>
        </div>

        <div className="palette">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`颜色 ${color}`}
              onClick={() => {
                setSelected(color);
                setEraser(false);
              }}
              className={`swatch ${
                selected === color &&
                !eraser
                  ? "selected"
                  : ""
              }`}
              style={{
                background: color,
              }}
            />
          ))}
        </div>

        <button
          className="finish"
          onClick={finishLevel}
        >
          <Flame size={19} />

          {level
            ? progress === 100
              ? "完成拼豆"
              : "检查作品"
            : "完成拼豆"}
        </button>
      </section>

      {done && (
        <div
          className="modal"
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDone(false);
            }
          }}
        >
          <div className="modal-card">
            <div className="shine">
              <Sparkles size={30} />
            </div>

            <h2>
              {level
                ? "挑战完成！"
                : "拼好了！"}
            </h2>

            <p>
              {level ? (
                <>
                  你完成了
                  <b>
                    {" "}
                    {level.emoji}{" "}
                    {level.name}
                  </b>
                </>
              ) : (
                <>
                  你的作品有{" "}
                  <b>{filled}</b> 颗拼豆
                </>
              )}
            </p>

            <div
              style={{
                fontSize: 14,
                color: "#64748b",
                marginBottom: 12,
              }}
            >
              完成度{" "}
              <b
                style={{
                  color:
                    level && progress === 100
                      ? "#16a34a"
                      : "#111827",
                }}
              >
                {level ? progress : 100}%
              </b>
            </div>

            <div
              className="preview"
              style={{
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((color, index) => (
                <span
                  key={index}
                  style={{
                    background:
                      color || "#e2e8f0",
                    border:
                      "0.5px solid rgba(71,85,105,.15)",
                  }}
                />
              ))}
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setDone(false);

                  if (level) {
                    backToLevels();
                  }
                }}
              >
                {level
                  ? "返回关卡"
                  : "继续修改"}
              </button>

              <button
                className="primary"
                onClick={exportImage}
              >
                保存作品
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        hidden
      />
    </main>
  );
}
