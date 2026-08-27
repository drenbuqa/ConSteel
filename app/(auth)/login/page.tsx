"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";

const B = { x: 48, y: 105, w: 468, h: 648, floors: 8, bays: 5 };
const fH = B.h / B.floors;
const bW = B.w / B.bays;
const wW = bW * 0.58;
const wH = fH  * 0.56;
const wPX = (bW - wW) / 2;
const wPY = (fH - wH) / 2;

const wins: {x:number;y:number;w:number;h:number}[] = [];
for (let f = 0; f < B.floors - 1; f++)
  for (let b = 0; b < B.bays; b++)
    wins.push({ x: B.x+b*bW+wPX, y: B.y+f*fH+wPY, w: wW, h: wH });

const FP = { x: 720, y: 55, w: 688, h: 370 };
const walls = [
  { x:FP.x+40, y:FP.y+40,  w:FP.w-80, h:14 },
  { x:FP.x+40, y:FP.y+40,  w:14, h:FP.h-80 },
  { x:FP.x+FP.w-54, y:FP.y+40, w:14, h:FP.h-80 },
  { x:FP.x+40, y:FP.y+FP.h-54, w:FP.w-80, h:14 },
  { x:FP.x+270, y:FP.y+54, w:12, h:145 },
  { x:FP.x+270, y:FP.y+239, w:12, h:135 },
  { x:FP.x+54, y:FP.y+174, w:216, h:12 },
  { x:FP.x+282, y:FP.y+174, w:190, h:12 },
  { x:FP.x+490, y:FP.y+54, w:12, h:120 },
];

const ST = "#8A9BAB"; // single stroke color — blue-gray, very muted

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await signIn("credentials", { password, redirect: false });
      if (res?.error) setError("Fjalëkalimi është i gabuar. Provoni përsëri.");
      else { router.push("/"); router.refresh(); }
    } catch { setError("Ndodhi një gabim. Provoni përsëri."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", fontFamily:"Inter,sans-serif", display:"flex",
      alignItems:"center", justifyContent:"center", position:"relative",
      overflow:"hidden", background:"#EFF1F5" }}>

      {/* ── ARCHITECTURAL BACKGROUND ── */}
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.2 }}
        xmlns="http://www.w3.org/2000/svg">

        <defs>
          <pattern id="g1" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M36 0H0V36" fill="none" stroke={ST} strokeWidth="0.4"/>
          </pattern>
          <pattern id="g2" width="180" height="180" patternUnits="userSpaceOnUse">
            <path d="M180 0H0V180" fill="none" stroke={ST} strokeWidth="0.9"/>
          </pattern>
          <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="5" stroke={ST} strokeWidth="0.5"/>
          </pattern>
        </defs>

        <rect width="1440" height="900" fill="url(#g1)"/>
        <rect width="1440" height="900" fill="url(#g2)"/>

        {/* ── ELEVATION (left) ── */}
        <rect x="12" y="18" width="598" height="820" fill="none" stroke={ST} strokeWidth="1"/>
        <rect x="20" y="26" width="582" height="804" fill="none" stroke={ST} strokeWidth="0.35"/>

        {/* Column reference bubbles */}
        {["A","B","C","D","E"].map((lbl,i)=>{
          const cx = B.x + i*bW + bW/2;
          return <g key={lbl}>
            <circle cx={cx} cy="72" r="11" fill="none" stroke={ST} strokeWidth="0.7"/>
            <line x1={cx} y1="83" x2={cx} y2={B.y} stroke={ST} strokeWidth="0.4" strokeDasharray="4,3"/>
            <circle cx={cx} cy={B.y+B.h+28} r="11" fill="none" stroke={ST} strokeWidth="0.7"/>
          </g>;
        })}

        {/* Building body */}
        <rect x={B.x} y={B.y} width={B.w} height={B.h} fill="none" stroke={ST} strokeWidth="1.1"/>

        {/* Floor lines */}
        {Array.from({length:B.floors-1},(_,i)=>i+1).map(f=>(
          <line key={f} x1={B.x} y1={B.y+f*fH} x2={B.x+B.w} y2={B.y+f*fH}
            stroke={ST} strokeWidth="0.4"/>
        ))}

        {/* Column grid dashes */}
        {Array.from({length:B.bays-1},(_,i)=>i+1).map(b=>(
          <line key={b} x1={B.x+b*bW} y1={B.y} x2={B.x+b*bW} y2={B.y+B.h}
            stroke={ST} strokeWidth="0.35" strokeDasharray="6,4"/>
        ))}

        {/* Windows */}
        {wins.map((w,i)=>(
          <g key={i}>
            <rect x={w.x} y={w.y} width={w.w} height={w.h} fill="none" stroke={ST} strokeWidth="0.6"/>
            <line x1={w.x} y1={w.y+w.h/2} x2={w.x+w.w} y2={w.y+w.h/2} stroke={ST} strokeWidth="0.3"/>
            <line x1={w.x+w.w/2} y1={w.y} x2={w.x+w.w/2} y2={w.y+w.h} stroke={ST} strokeWidth="0.3"/>
            <line x1={w.x-2} y1={w.y+w.h+2} x2={w.x+w.w+2} y2={w.y+w.h+2} stroke={ST} strokeWidth="0.7"/>
          </g>
        ))}

        {/* Ground floor side windows */}
        {[0,1,3,4].map(b=>{
          const gx=B.x+b*bW+wPX, gy=B.y+7*fH+wPY;
          return <g key={b}>
            <rect x={gx} y={gy} width={wW} height={wH} fill="none" stroke={ST} strokeWidth="0.6"/>
            <line x1={gx} y1={gy+wH/2} x2={gx+wW} y2={gy+wH/2} stroke={ST} strokeWidth="0.3"/>
            <line x1={gx+wW/2} y1={gy} x2={gx+wW/2} y2={gy+wH} stroke={ST} strokeWidth="0.3"/>
            <line x1={gx-2} y1={gy+wH+2} x2={gx+wW+2} y2={gy+wH+2} stroke={ST} strokeWidth="0.7"/>
          </g>;
        })}

        {/* Entrance door */}
        {(()=>{
          const dx=B.x+2*bW+(bW-wW*1.2)/2, dy=B.y+7*fH+wPY-4, dw=wW*1.2, dh=wH+6;
          return <g>
            <rect x={dx} y={dy} width={dw} height={dh} fill="none" stroke={ST} strokeWidth="0.8"/>
            <line x1={dx+dw/2} y1={dy} x2={dx+dw/2} y2={dy+dh} stroke={ST} strokeWidth="0.4"/>
            <rect x={dx-12} y={B.y+B.h}   width={dw+24} height="6" fill="none" stroke={ST} strokeWidth="0.5"/>
            <rect x={dx-22} y={B.y+B.h+6} width={dw+44} height="6" fill="none" stroke={ST} strokeWidth="0.5"/>
          </g>;
        })()}

        {/* Parapet */}
        <rect x={B.x-18} y={B.y-26} width={B.w+36} height="26" fill="none" stroke={ST} strokeWidth="0.9"/>
        <line x1={B.x-18} y1={B.y-13} x2={B.x+B.w+18} y2={B.y-13} stroke={ST} strokeWidth="0.3"/>

        {/* Level tick marks only (no text) */}
        {Array.from({length:B.floors+1},(_,i)=>(
          <line key={i} x1={B.x-20} y1={B.y+i*fH} x2={B.x-4} y2={B.y+i*fH}
            stroke={ST} strokeWidth="0.5"/>
        ))}
        <line x1={B.x-16} y1={B.y} x2={B.x-16} y2={B.y+B.h} stroke={ST} strokeWidth="0.4"/>

        {/* Bay ticks bottom */}
        {Array.from({length:B.bays+1},(_,i)=>(
          <line key={i} x1={B.x+i*bW} y1={B.y+B.h+20} x2={B.x+i*bW} y2={B.y+B.h+28}
            stroke={ST} strokeWidth="0.5"/>
        ))}
        <line x1={B.x} y1={B.y+B.h+24} x2={B.x+B.w} y2={B.y+B.h+24} stroke={ST} strokeWidth="0.4"/>

        {/* Ground line */}
        <line x1={B.x-60} y1={B.y+B.h+14} x2={B.x+B.w+60} y2={B.y+B.h+14}
          stroke={ST} strokeWidth="1.4"/>
        <line x1={B.x-60} y1={B.y+B.h+18} x2={B.x+B.w+60} y2={B.y+B.h+18}
          stroke={ST} strokeWidth="0.5"/>

        {/* Section cut line */}
        <line x1={B.x+2*bW+bW/2} y1={B.y-38} x2={B.x+2*bW+bW/2} y2={B.y+B.h+14}
          stroke={ST} strokeWidth="0.7" strokeDasharray="10,5"/>
        <circle cx={B.x+2*bW+bW/2} cy={B.y-48} r="12" fill="none" stroke={ST} strokeWidth="0.7"/>

        {/* ── FLOOR PLAN (right top) ── */}
        <rect x={FP.x-12} y={FP.y-12} width={FP.w+24} height={FP.h+24}
          fill="none" stroke={ST} strokeWidth="1"/>
        <rect x={FP.x-4} y={FP.y-4} width={FP.w+8} height={FP.h+8}
          fill="none" stroke={ST} strokeWidth="0.3"/>

        {walls.map((w,i)=>(
          <rect key={i} x={w.x} y={w.y} width={w.w} height={w.h}
            fill="url(#hatch)" stroke={ST} strokeWidth="0.6"/>
        ))}

        {/* Column marks */}
        {[
          {cx:FP.x+61, cy:FP.y+61}, {cx:FP.x+276, cy:FP.y+61}, {cx:FP.x+FP.w-61, cy:FP.y+61},
          {cx:FP.x+61, cy:FP.y+FP.h-61}, {cx:FP.x+276, cy:FP.y+FP.h-61}, {cx:FP.x+FP.w-61, cy:FP.y+FP.h-61},
        ].map((c,i)=>(
          <g key={i}>
            <rect x={c.cx-8} y={c.cy-8} width="16" height="16" fill="none" stroke={ST} strokeWidth="0.7"/>
            <line x1={c.cx-8} y1={c.cy-8} x2={c.cx+8} y2={c.cy+8} stroke={ST} strokeWidth="0.4"/>
            <line x1={c.cx+8} y1={c.cy-8} x2={c.cx-8} y2={c.cy+8} stroke={ST} strokeWidth="0.4"/>
          </g>
        ))}

        {/* Door arcs */}
        <line x1={FP.x+68} y1={FP.y+186} x2={FP.x+68+36} y2={FP.y+186} stroke={ST} strokeWidth="0.6"/>
        <path d={`M ${FP.x+68} ${FP.y+186} A 36 36 0 0 1 ${FP.x+68} ${FP.y+186-36}`}
          fill="none" stroke={ST} strokeWidth="0.45" strokeDasharray="3,2"/>
        <line x1={FP.x+294} y1={FP.y+186} x2={FP.x+294+36} y2={FP.y+186} stroke={ST} strokeWidth="0.6"/>
        <path d={`M ${FP.x+330} ${FP.y+186} A 36 36 0 0 0 ${FP.x+330} ${FP.y+186-36}`}
          fill="none" stroke={ST} strokeWidth="0.45" strokeDasharray="3,2"/>

        {/* Staircase */}
        {(()=>{
          const sx=FP.x+502, sy=FP.y+54, sw=90, sh=120, steps=7;
          return <g>
            <rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke={ST} strokeWidth="0.7"/>
            {Array.from({length:steps},(_,i)=>(
              <line key={i} x1={sx} y1={sy+i*(sh/steps)} x2={sx+sw} y2={sy+i*(sh/steps)}
                stroke={ST} strokeWidth="0.4"/>
            ))}
            <line x1={sx+sw/2} y1={sy+sh-8} x2={sx+sw/2} y2={sy+8} stroke={ST} strokeWidth="0.6"/>
            <polygon points={`${sx+sw/2-3},${sy+14} ${sx+sw/2},${sy+5} ${sx+sw/2+3},${sy+14}`} fill={ST}/>
          </g>;
        })()}

        {/* Plan dim ticks only */}
        <line x1={FP.x+40} y1={FP.y+6} x2={FP.x+FP.w-40} y2={FP.y+6} stroke={ST} strokeWidth="0.45"/>
        <line x1={FP.x+40} y1={FP.y+2} x2={FP.x+40} y2={FP.y+10} stroke={ST} strokeWidth="0.5"/>
        <line x1={FP.x+FP.w-40} y1={FP.y+2} x2={FP.x+FP.w-40} y2={FP.y+10} stroke={ST} strokeWidth="0.5"/>

        {/* ── SECTION (right bottom) ── */}
        {(()=>{
          const SC={x:720, y:480, w:688, h:382};
          const wallXs=[SC.x+80, SC.x+200, SC.x+350, SC.x+500];
          const slabYs=[SC.y+60, SC.y+160, SC.y+260, SC.y+360];
          return <>
            <rect x={SC.x-12} y={SC.y-12} width={SC.w+24} height={SC.h+24}
              fill="none" stroke={ST} strokeWidth="1"/>
            <rect x={SC.x-4} y={SC.y-4} width={SC.w+8} height={SC.h+8}
              fill="none" stroke={ST} strokeWidth="0.3"/>

            {wallXs.map((wx,i)=>(
              <g key={i}>
                <rect x={wx} y={SC.y+60} width="22" height={SC.h-100}
                  fill="url(#hatch)" stroke={ST} strokeWidth="0.6"/>
                {Array.from({length:3},(_,j)=>(
                  <circle key={j} cx={wx+11} cy={SC.y+100+j*90} r="2.5"
                    fill="none" stroke={ST} strokeWidth="0.6"/>
                ))}
              </g>
            ))}

            {slabYs.map((sy,i)=>(
              <g key={i}>
                <rect x={SC.x+40} y={sy} width={SC.w-80} height="18"
                  fill="url(#hatch)" stroke={ST} strokeWidth="0.6"/>
                <line x1={SC.x+60} y1={sy+9} x2={SC.x+SC.w-60} y2={sy+9}
                  stroke={ST} strokeWidth="0.5" strokeDasharray="5,3"/>
                <line x1={SC.x+18} y1={sy} x2={SC.x+40} y2={sy} stroke={ST} strokeWidth="0.5"/>
              </g>
            ))}

            <line x1={SC.x+18} y1={SC.y+60} x2={SC.x+18} y2={SC.y+SC.h-40}
              stroke={ST} strokeWidth="0.45"/>
            <circle cx={SC.x+SC.w-20} cy={SC.y+20} r="12" fill="none" stroke={ST} strokeWidth="0.7"/>
          </>;
        })()}

        {/* ── SCALE BAR (bottom center) ── */}
        <g transform="translate(660,868)">
          {[0,1,2,3,4].map(i=>(
            <rect key={i} x={i*36} y="0" width="36" height="7"
              fill={i%2===0 ? ST : "none"} stroke={ST} strokeWidth="0.5" opacity={i%2===0?0.6:1}/>
          ))}
        </g>

      </svg>

      {/* Soft vignette so card reads cleanly */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        background:"radial-gradient(ellipse 50% 60% at 50% 50%, transparent 0%, rgba(239,241,245,0.5) 100%)" }}/>

      {/* ── LOGIN CARD ── */}
      <div style={{
        position:"relative",
        background:"rgba(255,255,255,0.94)",
        backdropFilter:"blur(16px)",
        WebkitBackdropFilter:"blur(16px)",
        borderRadius:"20px",
        padding:"48px 44px",
        width:"420px",
        boxShadow:"0 8px 48px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.05)",
        border:"1px solid rgba(255,255,255,0.96)",
      }}>
        <div style={{ textAlign:"center", marginBottom:"28px" }}>
          <div style={{
            width:"56px", height:"56px", background:"#F3F4F6", borderRadius:"14px",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 20px", border:"1px solid #E5E7EB",
          }}>
            <Lock size={24} color="#374151"/>
          </div>
          <h1 style={{ fontSize:"22px", fontWeight:"700", color:"#111827",
            margin:"0 0 8px", letterSpacing:"-0.02em" }}>
            Mirësevini në ConSteel Pro
          </h1>
          <p style={{ fontSize:"14px", color:"#6B7280", margin:0, lineHeight:1.5 }}>
            Përdorni fjalëkalimin e përbashkët të kompanisë<br/>për të hyrë në sistem.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display:"block", fontSize:"13px", fontWeight:"500",
            color:"#374151", marginBottom:"6px" }}>
            Fjalëkalimi
          </label>
          <div style={{ position:"relative", marginBottom:"16px" }}>
            <div style={{ position:"absolute", left:"13px", top:"50%",
              transform:"translateY(-50%)", color:"#9CA3AF", display:"flex" }}>
              <Lock size={15}/>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{
                width:"100%", background:"#F9FAFB",
                border: error ? "1px solid #FCA5A5" : "1px solid #E5E7EB",
                borderRadius:"10px", padding:"12px 42px 12px 40px",
                fontSize:"14px", color:"#111827", outline:"none",
                fontFamily:"Inter,sans-serif", boxSizing:"border-box",
              }}
              onFocus={e=>{ if(!error) e.target.style.borderColor="#9CA3AF"; }}
              onBlur={e=>{ if(!error) e.target.style.borderColor="#E5E7EB"; }}
            />
            <button type="button" onClick={()=>setShowPassword(!showPassword)}
              style={{ position:"absolute", right:"12px", top:"50%",
                transform:"translateY(-50%)", background:"none", border:"none",
                cursor:"pointer", color:"#9CA3AF", display:"flex", padding:0 }}>
              {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>

          {error && (
            <div style={{ background:"#FEF2F2", border:"1px solid #FECACA",
              borderRadius:"8px", padding:"10px 12px", fontSize:"13px",
              color:"#DC2626", marginBottom:"16px" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width:"100%", background: loading ? "#374151" : "#111827",
            color:"white", border:"none", borderRadius:"10px",
            padding:"13px 16px", fontSize:"15px", fontWeight:"600",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily:"Inter,sans-serif", letterSpacing:"-0.01em",
          }}>
            {loading ? "Duke hyrë..." : "Hyr në sistem"}
          </button>
        </form>

        <div style={{ display:"flex", alignItems:"center", gap:"7px",
          marginTop:"20px", justifyContent:"center" }}>
          <ShieldCheck size={13} color="#9CA3AF"/>
          <p style={{ fontSize:"12px", color:"#9CA3AF", margin:0 }}>
            Sistem i brendshëm — vetëm për punonjësit e kompanisë.
          </p>
        </div>
      </div>

      <div style={{ position:"absolute", bottom:"22px", left:0, right:0,
        textAlign:"center", fontSize:"12px", color:"#9CA3AF" }}>
        © {new Date().getFullYear()} ConSteel Sh.p.k. &nbsp;|&nbsp; Të gjitha të drejtat e rezervuara.
      </div>
    </div>
  );
}
