/* 사이트 공통 마우스 포인터 — Ink Sign 서명 칸의 십자선 방식
   빨간 가로·세로 실선 + 사각 조준점 + 좌표 표시. 마우스가 있는 기기에서만 켜집니다.
   - 링크·버튼 위에서는 조준점이 커집니다.
   - 글자 입력칸에서는 원래 커서(I자)를 그대로 씁니다.
   - data-cursor="own" 을 단 요소 위에서는 숨깁니다 (자체 십자선이 있는 서명 칸 등).
   - 색은 페이지에서 --hud-accent 로 바꿀 수 있습니다. */
(() => {
  if (window.__hudCursor) return;
  window.__hudCursor = true;
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const css = `
html.hudc,html.hudc *{cursor:none!important}
html.hudc input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]):not([type=reset]):not([type=color]):not([type=file]),
html.hudc textarea,html.hudc [contenteditable=""],html.hudc [contenteditable="true"]{cursor:text!important}
#hudc{position:fixed;inset:0;pointer-events:none;z-index:2147483646;contain:strict}
#hudc[hidden]{display:none}
#hudc i{position:absolute;left:0;top:0;display:block;will-change:transform}
#hudc .h{width:100%;height:1px;background:var(--hud-accent,#ff3b3b);opacity:.5}
#hudc .v{height:100%;width:1px;background:var(--hud-accent,#ff3b3b);opacity:.5}
#hudc .r{width:15px;height:15px;margin:-7px 0 0 -7px;border:1px solid var(--hud-accent,#ff3b3b);transition:width .16s,height .16s,margin .16s,background-color .16s}
#hudc.link .r{width:29px;height:29px;margin:-14px 0 0 -14px;background:color-mix(in srgb,var(--hud-accent,#ff3b3b) 14%,transparent)}
#hudc.down .r{width:9px;height:9px;margin:-4px 0 0 -4px}
#hudc .t{font:500 11px/1 "JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.06em;
  color:#fff;background:var(--hud-accent,#ff3b3b);padding:4px 6px;white-space:nowrap;font-style:normal;font-variant-numeric:tabular-nums}
@media (prefers-reduced-motion:reduce){#hudc .r{transition:none}}`;
  const st = document.createElement("style");
  st.id = "hudc-style";
  st.textContent = css;

  const box = document.createElement("div");
  box.id = "hudc";
  box.hidden = true;
  box.setAttribute("aria-hidden", "true");
  box.innerHTML = '<i class="h"></i><i class="v"></i><i class="r"></i><i class="t"></i>';
  const [h, v, r, t] = box.children;

  const INTERACTIVE = 'a[href],button,[role="button"],label,select,summary,input[type=checkbox],input[type=radio],input[type=range],input[type=button],input[type=submit],input[type=file],[onclick],[tabindex]:not([tabindex="-1"])';
  const pad4 = n => String(Math.max(0, Math.round(n))).padStart(4, "0");
  let x = 0, y = 0, raf = 0, tagW = 120;

  function draw() {
    raf = 0;
    h.style.transform = `translate3d(0,${y}px,0)`;
    v.style.transform = `translate3d(${x}px,0,0)`;
    r.style.transform = `translate3d(${x}px,${y}px,0)`;
    t.textContent = `X:${pad4(x)} Y:${pad4(y)}`;
    tagW = t.offsetWidth || tagW;
    const tx = x + 14 + tagW > innerWidth ? x - 14 - tagW : x + 14;
    const ty = y + 34 > innerHeight ? y - 30 : y + 12;
    t.style.transform = `translate3d(${tx}px,${ty}px,0)`;
  }
  function show(on) {
    box.hidden = !on;
  }
  function onMove(e) {
    if (e.pointerType && e.pointerType !== "mouse") {      // 펜·터치일 땐 원래 커서로
      document.documentElement.classList.remove("hudc");
      show(false);
      return;
    }
    document.documentElement.classList.add("hudc");
    x = e.clientX; y = e.clientY;
    const el = e.target instanceof Element ? e.target : null;
    const own = el && el.closest('[data-cursor="own"]');
    show(!own);
    if (own) return;
    box.classList.toggle("link", !!(el && el.closest(INTERACTIVE)));
    if (!raf) raf = requestAnimationFrame(draw);
  }

  function mount() {
    document.head.appendChild(st);
    document.body.appendChild(box);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", e => { if (e.pointerType === "mouse") box.classList.add("down"); }, { passive: true });
    addEventListener("pointerup", () => box.classList.remove("down"), { passive: true });
    document.addEventListener("mouseleave", () => show(false));
    document.documentElement.addEventListener("mouseleave", () => show(false));
    addEventListener("blur", () => show(false));
    document.addEventListener("mouseout", e => { if (!e.relatedTarget) show(false); });
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
