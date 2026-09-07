"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Eraser, RotateCcw, RotateCw, Trash2, Sparkles, Flame, Plus, Minus } from "lucide-react";

const COLORS = [
  "#111827","#ffffff","#ef4444","#f97316","#f59e0b","#facc15",
  "#84cc16","#22c55e","#10b981","#14b8a6","#06b6d4","#0ea5e9",
  "#3b82f6","#6366f1","#8b5cf6","#a855f7","#d946ef","#ec4899",
  "#f43f5e","#92400e","#78350f","#64748b","#94a3b8","#e2e8f0"
];

type Cell = string | null;

export default function Home(){
  const [size,setSize]=useState(32);
  const [grid,setGrid]=useState<Cell[]>([]);
  const [selected,setSelected]=useState(COLORS[2]);
  const [eraser,setEraser]=useState(false);
  const [history,setHistory]=useState<Cell[][]>([]);
  const [future,setFuture]=useState<Cell[][]>([]);
  const [zoom,setZoom]=useState(1);
  const [done,setDone]=useState(false);
  const [mounted,setMounted]=useState(false);
  const canvasRef=useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    setMounted(true);
    const saved=localStorage.getItem("pindou-grid-v1");
    const savedSize=localStorage.getItem("pindou-size-v1");
    if(saved && savedSize){
      try {
        setSize(Number(savedSize));
        setGrid(JSON.parse(saved));
        return;
      } catch {}
    }
    setGrid(Array(32*32).fill(null));
  },[]);

  useEffect(()=>{
    if(mounted && grid.length){
      localStorage.setItem("pindou-grid-v1",JSON.stringify(grid));
      localStorage.setItem("pindou-size-v1",String(size));
    }
  },[grid,size,mounted]);

  const filled=useMemo(()=>grid.filter(Boolean).length,[grid]);
  const counts=useMemo(()=>{
    const m:Record<string,number>={};
    grid.forEach(c=>{if(c)m[c]=(m[c]||0)+1});
    return m;
  },[grid]);

  function changeCell(i:number){
    const next=[...grid];
    next[i]=eraser?null:selected;
    setHistory(h=>[...h,grid].slice(-40));
    setFuture([]);
    setGrid(next);
  }
  function undo(){
    if(!history.length)return;
    const h=[...history]; const prev=h.pop()!;
    setFuture(f=>[...f,grid].slice(-40)); setHistory(h); setGrid(prev);
  }
  function redo(){
    if(!future.length)return;
    const f=[...future]; const next=f.pop()!;
    setHistory(h=>[...h,grid].slice(-40)); setFuture(f); setGrid(next);
  }
  function clearAll(){
    if(!filled)return;
    setHistory(h=>[...h,grid].slice(-40)); setFuture([]); setGrid(Array(size*size).fill(null));
  }
  function resize(n:number){
    setSize(n); setGrid(Array(n*n).fill(null)); setHistory([]); setFuture([]); setDone(false);
  }
  function exportImage(){
    const canvas=canvasRef.current;
    if(!canvas)return;
    const ctx=canvas.getContext("2d")!;
    const cell=20, gap=1;
    canvas.width=size*cell; canvas.height=size*cell;
    ctx.fillStyle="#f8fafc"; ctx.fillRect(0,0,canvas.width,canvas.height);
    grid.forEach((c,i)=>{
      const x=(i%size)*cell, y=Math.floor(i/size)*cell;
      ctx.fillStyle=c||"#e2e8f0"; ctx.beginPath();
      ctx.arc(x+cell/2,y+cell/2,7.8,0,Math.PI*2); ctx.fill();
    });
    const a=document.createElement("a"); a.download="我的拼豆作品.png"; a.href=canvas.toDataURL("image/png"); a.click();
  }

  if(!mounted || !grid.length) return <main className="loading">正在准备拼豆板…</main>;

  return (
    <main className="app">
      <header className="topbar">
        <div><div className="brand"><span>🧩</span> 拼豆乐</div><div className="sub">手机拼豆 · V1</div></div>
        <button className="export" onClick={exportImage}><Download size={17}/> 导出</button>
      </header>

      <section className="board-wrap">
        <div className="board-head">
          <div><b>{size} × {size}</b><span>{filled} / {size*size} 颗</span></div>
          <div className="zoom"><button onClick={()=>setZoom(z=>Math.max(.6,z-.1))}><Minus size={16}/></button><span>{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(z=>Math.min(1.6,z+.1))}><Plus size={16}/></button></div>
        </div>
        <div className="board-scroll">
          <div className="board" style={{width:`min(92vw, ${Math.round(620*zoom)}px)`,aspectRatio:"1",["--n" as any]:size}}>
            {grid.map((c,i)=><button aria-label={`第${i+1}格`} key={i} className="cell" onClick={()=>changeCell(i)} style={{background:c||"transparent", boxShadow:c?"inset 0 1px 2px #ffffff88, inset 0 -2px 3px #0002":"none"}} />)}
          </div>
        </div>
      </section>

      <section className="controls">
        <div className="row">
          <button onClick={undo} disabled={!history.length}><RotateCcw size={18}/>撤销</button>
          <button onClick={redo} disabled={!future.length}><RotateCw size={18}/>重做</button>
          <button onClick={clearAll} disabled={!filled}><Trash2 size={18}/>清空</button>
          <button className={eraser?"active danger":""} onClick={()=>setEraser(v=>!v)}><Eraser size={18}/>橡皮</button>
        </div>

        <div className="size-row">
          <span>画板</span>
          {[32,48,64].map(n=><button key={n} className={size===n?"chosen":""} onClick={()=>resize(n)}>{n}×{n}</button>)}
        </div>

        <div className="palette-title"><span>颜色</span><span className="tip">{eraser?"橡皮模式":"选择颜色后点击格子"}</span></div>
        <div className="palette">
          {COLORS.map(c=><button key={c} aria-label={c} onClick={()=>{setSelected(c);setEraser(false)}} className={`swatch ${selected===c&&!eraser?"selected":""}`} style={{background:c}}/> )}
        </div>

        <button className="finish" onClick={()=>setDone(true)}><Flame size={19}/>完成拼豆</button>
      </section>

      {done && <div className="modal">
        <div className="modal-card">
          <div className="shine"><Sparkles size={30}/></div>
          <h2>拼好了！</h2>
          <p>你的作品有 <b>{filled}</b> 颗拼豆</p>
          <div className="preview">
            {grid.map((c,i)=><span key={i} style={{background:c||"#e2e8f0"}}/>)}
          </div>
          <div className="modal-actions"><button onClick={()=>setDone(false)}>继续修改</button><button className="primary" onClick={exportImage}>保存作品</button></div>
        </div>
      </div>}
      <canvas ref={canvasRef} hidden/>
    </main>
  );
}
