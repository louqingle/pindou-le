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
  Plus,
  Minus,
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

const DEFAULT_SIZE = 32;
const MAX_HISTORY = 40;

export default function Home() {
  const [size, setSize] = useState(DEFAULT_SIZE);
  const [grid, setGrid] = useState<Cell[]>([]);
  const [selected, setSelected] = useState(COLORS[2]);
  const [eraser, setEraser] = useState(false);

  const [history, setHistory] = useState<Cell[][]>([]);
  const [future, setFuture] = useState<Cell[][]>([]);

  const [zoom, setZoom] = useState(1);
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * 初始化
   */
  useEffect(() => {
    setMounted(true);

    const saved = localStorage.getItem("pindou-grid-v1");
    const savedSize = localStorage.getItem("pindou-size-v1");

    if (saved && savedSize) {
      try {
        const parsedSize = Number(savedSize);
        const parsedGrid = JSON.parse(saved);

        if (
          [32, 48, 64].includes(parsedSize) &&
          Array.isArray(parsedGrid) &&
          parsedGrid.length === parsedSize * parsedSize
        ) {
          setSize(parsedSize);
          setGrid(parsedGrid);
          return;
        }
      } catch {
        // 使用默认画板
      }
    }

    setGrid(Array(DEFAULT_SIZE * DEFAULT_SIZE).fill(null));
  }, []);

  /**
   * 自动保存
   */
  useEffect(() => {
    if (!mounted || !grid.length) return;

    localStorage.setItem("pindou-grid-v1", JSON.stringify(grid));
    localStorage.setItem("pindou-size-v1", String(size));
  }, [grid, size, mounted]);

  /**
   * 已放置数量
   */
  const filled = useMemo(() => {
    return grid.filter(Boolean).length;
  }, [grid]);

  /**
   * 各颜色数量
   */
  const counts = useMemo(() => {
    const result: Record<string, number> = {};

    grid.forEach((color) => {
      if (color) {
        result[color] = (result[color] || 0) + 1;
      }
    });

    return result;
  }, [grid]);

  /**
   * 点击格子
   */
  function changeCell(index: number) {
    const nextColor = eraser ? null : selected;

    // 如果本来就是这个颜色，不重复记录历史
    if (grid[index] === nextColor) {
      return;
    }

    const previous = [...grid];
    const next = [...grid];

    next[index] = nextColor;

    setHistory((h) => [...h, previous].slice(-MAX_HISTORY));
    setFuture([]);
    setGrid(next);
    setDone(false);
  }

  /**
   * 撤销
   */
  function undo() {
    if (!history.length) return;

    const h = [...history];
    const previous = h.pop()!;

    setFuture((f) => [...f, [...grid]].slice(-MAX_HISTORY));
    setHistory(h);
    setGrid(previous);
    setDone(false);
  }

  /**
   * 重做
   */
  function redo() {
    if (!future.length) return;

    const f = [...future];
    const next = f.pop()!;

    setHistory((h) => [...h, [...grid]].slice(-MAX_HISTORY));
    setFuture(f);
    setGrid(next);
    setDone(false);
  }

  /**
   * 清空
   */
  function clearAll() {
    if (!filled) return;

    setHistory((h) => [...h, [...grid]].slice(-MAX_HISTORY));
    setFuture([]);
    setGrid(Array(size * size).fill(null));
    setDone(false);
  }

  /**
   * 切换画板尺寸
   */
  function resize(n: number) {
    if (n === size) return;

    setSize(n);
    setGrid(Array(n * n).fill(null));
    setHistory([]);
    setFuture([]);
    setDone(false);
    setZoom(1);

    localStorage.setItem("pindou-size-v1", String(n));
    localStorage.setItem(
      "pindou-grid-v1",
      JSON.stringify(Array(n * n).fill(null))
    );
  }

  /**
   * 导出 PNG
   */
  function exportImage() {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const cell = 24;
    const radius = 8.8;

    canvas.width = size * cell;
    canvas.height = size * cell;

    // 背景
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 网格 + 拼豆
    grid.forEach((color, index) => {
      const x = (index % size) * cell;
      const y = Math.floor(index / size) * cell;

      // 格子背景
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(x, y, cell, cell);

      // 格子线
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cell, cell);

      // 拼豆
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

        // 高光
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

    link.download = `我的拼豆作品-${size}x${size}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  /**
   * 计算完成度
   */
  const progress = Math.round((filled / (size * size)) * 100);

  if (!mounted || !grid.length) {
    return <main className="loading">正在准备拼豆板…</main>;
  }

  return (
    <main className="app">
      {/* 顶部 */}
      <header className="topbar">
        <div>
          <div className="brand">
            <span>🧩</span>
            拼豆乐
          </div>

          <div className="sub">手机拼豆 · V1.1</div>
        </div>

        <button className="export" onClick={exportImage}>
          <Download size={17} />
          导出
        </button>
      </header>

      {/* 棋盘区域 */}
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
                setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))
              }
              aria-label="缩小"
            >
              <Minus size={16} />
            </button>

            <span>{Math.round(zoom * 100)}%</span>

            <button
              onClick={() =>
                setZoom((z) => Math.min(1.6, Number((z + 0.1).toFixed(1))))
              }
              aria-label="放大"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="board-scroll">
          <div
            className="board"
            style={
              {
                width: `min(92vw, ${Math.round(620 * zoom)}px)`,
                aspectRatio: "1 / 1",
                "--n": size,
              } as React.CSSProperties
            }
          >
            {grid.map((color, index) => (
              <button
                key={index}
                type="button"
                aria-label={`第 ${index + 1} 格`}
                className="cell"
                onClick={() => changeCell(index)}
                style={{
                  background: color || "transparent",

                  border: "1px solid rgba(71, 85, 105, 0.22)",

                  boxSizing: "border-box",

                  padding: 0,

                  boxShadow: color
                    ? "inset 0 1px 2px #ffffff88, inset 0 -2px 3px #0002"
                    : "none",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 操作区 */}
      <section className="controls">
        <div className="row">
          <button onClick={undo} disabled={!history.length}>
            <RotateCcw size={18} />
            撤销
          </button>

          <button onClick={redo} disabled={!future.length}>
            <RotateCw size={18} />
            重做
          </button>

          <button onClick={clearAll} disabled={!filled}>
            <Trash2 size={18} />
            清空
          </button>

          <button
            className={eraser ? "active danger" : ""}
            onClick={() => setEraser((value) => !value)}
          >
            <Eraser size={18} />
            橡皮
          </button>
        </div>

        {/* 画板大小 */}
        <div className="size-row">
          <span>画板</span>

          {[32, 48, 64].map((n) => (
            <button
              key={n}
              className={size === n ? "chosen" : ""}
              onClick={() => resize(n)}
            >
              {n}×{n}
            </button>
          ))}
        </div>

        {/* 颜色标题 */}
        <div className="palette-title">
          <span>颜色</span>

          <span className="tip">
            {eraser ? "橡皮模式" : "选择颜色后点击格子"}
          </span>
        </div>

        {/* 颜色 */}
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
                selected === color && !eraser ? "selected" : ""
              }`}
              style={{
                background: color,
              }}
            />
          ))}
        </div>

        {/* 完成按钮 */}
        <button className="finish" onClick={() => setDone(true)}>
          <Flame size={19} />
          完成拼豆
        </button>
      </section>

      {/* 完成弹窗 */}
      {done && (
        <div
          className="modal"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setDone(false);
            }
          }}
        >
          <div className="modal-card">
            <div className="shine">
              <Sparkles size={30} />
            </div>

            <h2>拼好了！</h2>

            <p>
              你的作品有 <b>{filled}</b> 颗拼豆
            </p>

            {/* 完成度 */}
            <div
              style={{
                width: "100%",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                  color: "#64748b",
                  marginBottom: 6,
                }}
              >
                <span>完成度</span>
                <b style={{ color: "#111827" }}>{progress}%</b>
              </div>

              <div
                style={{
                  width: "100%",
                  height: 8,
                  borderRadius: 999,
                  background: "#e2e8f0",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "#111827",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* 作品预览 */}
            <div
              className="preview"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((color, index) => (
                <span
                  key={index}
                  style={{
                    background: color || "#e2e8f0",
                    border: "0.5px solid rgba(71,85,105,0.15)",
                    boxSizing: "border-box",
                  }}
                />
              ))}
            </div>

            <div className="modal-actions">
              <button onClick={() => setDone(false)}>继续修改</button>

              <button className="primary" onClick={exportImage}>
                保存作品
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 隐藏导出 Canvas */}
      <canvas ref={canvasRef} hidden />
    </main>
  );
}
