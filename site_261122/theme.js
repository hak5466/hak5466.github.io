/* 꾸메땅 영문법 GAME · 바탕 밝기 단추
   바탕은 늘 흰 종이색으로 엽니다. 휴대폰이 어두운 화면 설정이어도 그대로입니다.
   어둡게 보고 싶은 아이는 단추로 바꿀 수 있고, 한 번 고르면 그 기기에 기억됩니다. */
(function () {
  var KEY = "kkt_theme_v1";

  function saved() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function store(v) {
    try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) {}
  }
  function now() {
    return saved() === "dark" ? "dark" : "light";
  }

  /* 그림이 그려지기 전에 먼저 맞춰 둡니다 */
  document.documentElement.setAttribute("data-theme", now());

  function paintMeta(mode) {
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", mode === "dark" ? "#101614" : "#0F6E5C");
  }
  paintMeta(now());

  function build() {
    if (document.getElementById("themeBtn")) return;

    var css = document.createElement("style");
    css.textContent =
      'body{position:relative;padding-top:42px}' +
      '#themeBtn{position:absolute;top:9px;' +
      'right:calc(env(safe-area-inset-right,0px) + 12px);z-index:9999;' +
      'display:flex;align-items:center;gap:6px;' +
      'font-family:"IBM Plex Sans KR","Apple SD Gothic Neo",sans-serif;font-size:14px;font-weight:700;' +
      'padding:7px 11px;border-radius:999px;cursor:pointer;' +
      'border:1.5px solid var(--line-strong,#C9D1C8);background:var(--card,#fff);color:var(--muted,#54615D);' +
      'opacity:.72;transition:opacity .15s ease}' +
      '#themeBtn:hover,#themeBtn:focus{opacity:1;outline:none;border-color:var(--accent,#0F6E5C);color:var(--accent,#0F6E5C)}' +
      '#themeBtn .ico{font-size:15px;line-height:1}' +
      '@media print{#themeBtn{display:none}}';
    document.head.appendChild(css);

    var b = document.createElement("button");
    b.id = "themeBtn";
    b.type = "button";
    document.body.appendChild(b);

    function draw() {
      var dark = now() === "dark";
      b.innerHTML = '<span class="ico">' + (dark ? "☀" : "☾") + "</span>" + (dark ? "밝게" : "어둡게");
      b.setAttribute("aria-label", dark ? "밝은 바탕으로 바꾸기" : "어두운 바탕으로 바꾸기");
      paintMeta(dark ? "dark" : "light");
    }

    b.addEventListener("click", function () {
      var next = now() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      store(next);
      draw();
    });

    draw();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
