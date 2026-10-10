/* 꾸메땅 영문법 게임 · 결과 보내기 (공용)
   모든 게임이 이 파일 하나를 함께 씁니다.
   ENDPOINT 가 비어 있으면 아무 것도 하지 않습니다. */
(function () {
  "use strict";

  var ENDPOINT = "https://script.google.com/macros/s/AKfycbzYfIkE34V5EYemZ7zPwBPcmrVZT6s25ANMtehe7Q6wPoaMjLXQa_gtRyhZ0po8s60ECQ/exec";
  var NAME_KEY = "kkt_name_v1";
  var QUEUE_KEY = "kkt_queue_v1";

  /* ---------- 잔심부름 ---------- */
  function $(s, r) { try { return (r || document).querySelector(s); } catch (e) { return null; } }
  function $$(s, r) {
    try { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
    catch (e) { return []; }
  }
  function tx(s, r) { var e = $(s, r); return e ? (e.textContent || "").replace(/\s+/g, " ").trim() : ""; }
  function num(v) { var m = String(v).match(/-?\d+/); return m ? parseInt(m[0], 10) : null; }
  function vis(e) { return !!(e && e.offsetParent !== null); }
  function ratio(s) { var m = String(s).match(/(\d+)\s*\/\s*(\d+)/); return m ? [+m[1], +m[2]] : null; }
  function pct(hit, total) { return total ? Math.round(hit / total * 100) : 0; }
  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }
    catch (e) { return null; }
  }

  /* ---------- 게임별 읽기 규칙 ---------- */
  function familyA(game) {
    return {
      game: game,
      nameSel: "#nameIn",
      totalWatch: function () {
        if (!vis($("#quiz"))) return null;
        var m = tx("#qnum").match(/(\d+)\s*\/\s*(\d+)/);
        return m ? +m[2] : null;
      },
      read: function () {
        var box = $("#result");
        if (!vis(box)) return null;
        if (tx("#result .of") !== "/ 100점") return null;   /* 오답 복습·노트 결과는 보내지 않음 */
        var score = num(tx("#rscore"));
        if (score === null) return null;
        var wrongs = $$("#rwrong .wrong").map(function (w) {
          var a = $$(".a", w);
          /* 문제마다 붙은 태그(세부 영역)를 함께 보냅니다.
             시트 쪽을 고치지 않아도 되게 문제 글 앞에도 [태그] 로 넣어 둡니다. */
          var tag = (w.getAttribute && w.getAttribute("data-tag")) || "";
          var kind = (w.getAttribute && w.getAttribute("data-kind")) || "";
          var body = tx(".q", w);
          return {
            no: tx(".no", w),
            tag: tag,
            kind: kind,
            q: tag ? "[" + tag + "] " + body : body,
            mine: "",
            ans: a.length ? tx("b", a[a.length - 1]) : ""
          };
        });
        var hm = tally(wrongs.length, score);
        return {
          level: tx("#rtitle").replace(/\s*결과\s*/, " ").replace(/^[\s·]+|[\s·]+$/g, "").trim(),
          score: score,
          hit: hm[0],
          total: hm[1],
          wrongs: wrongs
        };
      }
    };
  }

  /* 맞은 개수·문항 수 찾기 — 게임마다 요약 칸 모양이 달라 순서대로 시도합니다 */
  function tally(wrongCount, score) {
    /* 1) 맞은/틀린 칸이 그대로 있는 경우 */
    if ($("#r0")) {
      var a = num(tx("#r0")), b = num(tx("#r1"));
      if (a !== null && b !== null) return [a, a + b];
    }
    var hit = null, miss = null;
    $$("#rbreak .bd").forEach(function (d) {
      var label = tx(".t", d);
      if (/맞[은힌]/.test(label)) hit = num(tx(".v", d));
      else if (/틀린/.test(label)) miss = num(tx(".v", d));
    });
    if (hit !== null && miss !== null) return [hit, hit + miss];

    /* 2) 문제를 푸는 동안 본 "1 / 20" 의 뒷숫자 */
    if (lastTotal && wrongCount <= lastTotal) return [lastTotal - wrongCount, lastTotal];

    /* 3) 점수와 오답 개수로 되짚기 */
    if (score === 0 && wrongCount > 0) return [0, wrongCount];
    if (score > 0 && score < 100 && wrongCount > 0) {
      var t = Math.round(wrongCount / (1 - score / 100));
      if (t >= wrongCount) return [t - wrongCount, t];
    }
    if (hit !== null) return [hit, null];
    return [null, null];
  }

  var READERS = {
    "gerund": familyA("동명사 GAME"),
    "relpron": familyA("관계대명사 GAME"),
    "reladv": familyA("관계부사 뽀개기"),
    "asconj": familyA("접속사 AS 뽀개기"),
    "relwhat": familyA("관계대명사 WHAT GAME"),
    "asas": familyA("AS ~ AS 뽀개기"),
    "toinf": familyA("TO부정사 GAME"),
    "toinf-basic": familyA("TO부정사 기본"),
    "pumsa8": familyA("8품사 GAME"),
    "usedto": familyA("USED TO GAME"),
    "sothat": familyA("SO~THAT GAME"),
    "sothat-purpose": familyA("SO THAT 목적 GAME"),
    "form5b": familyA("5형식 뽀개기"),
    "ph": familyA("파닉스 뽀개기"),
    "adj": familyA("형용사 뽀개기"),
    "conj": familyA("접속사 뽀개기"),
    "interj": familyA("감탄사 뽀개기"),
    "adv": familyA("부사 뽀개기"),
    "prep": familyA("전치사 뽀개기"),
    "noun": familyA("[대]명사 뽀개기"),
    "verbtype": familyA("동사 뽀개기"),
    "beuse": familyA("be동사 문장 활용"),
    "thereis": familyA("There is · are 뽀개기"),
    "tense": familyA("시제 뽀개기"),
    "freq": familyA("빈도부사 뽀개기"),
    "participle": familyA("분사 뽀개기"),
    "subjunctive": familyA("가정법 뽀개기"),
    "themore": familyA("THE 비교급 뽀개기"),
    "verbuse": familyA("일반동사 문장 활용"),
    "sense": familyA("감각동사 GAME"),
    "itsub": familyA("비인칭주어 GAME"),
    "perfect": familyA("현재완료 GAME"),

    "phonics": {
      game: "파닉스 자음 뒤집기",
      nameSel: "#nameInput",
      read: function () {
        if (!vis($("#stage-report"))) return null;
        var r = ratio(tx("#reportScore"));
        if (!r) return null;
        var wrongs = $$(".wrong-list tbody tr").map(function (tr) {
          var td = $$("td", tr);
          return {
            no: "",
            q: td[0] ? td[0].textContent.trim() : "",
            mine: td[1] ? td[1].textContent.trim() : "",
            ans: td[2] ? td[2].textContent.trim() : ""
          };
        });
        return { level: "단어 퀴즈", score: pct(r[0], r[1]), hit: r[0], total: r[1], wrongs: wrongs };
      }
    },

    "pumsa-lab": {
      game: "품사 표본실",
      nameSel: null,
      read: function () {
        if (!vis($("#screen-result"))) return null;
        var r = ratio(tx("#stat-correct"));
        if (!r) return null;
        return { level: "채집", score: pct(r[0], r[1]), hit: r[0], total: r[1], wrongs: [] };
      }
    },

    "verb1": {
      game: "일반동사 도장깨기",
      nameSel: "#name",
      read: function () {
        var box = $("#resultCard");
        if (!vis(box)) return null;
        var score = num(tx("#finalScore"));
        if (score === null) return null;
        var hit = num(tx("#t0")), miss = num(tx("#t1"));
        var wrongs = $$("#missList .miss").map(function (w, i) {
          return {
            no: String(i + 1),
            q: tx(".q", w),
            mine: tx("s", w),
            ans: tx("b", w)
          };
        });
        return {
          level: tx("#stageLabel") || tx("#resultWho"),
          score: score,
          hit: hit,
          total: (hit !== null && miss !== null) ? hit + miss : null,
          wrongs: wrongs
        };
      }
    },


    "verb2": {
      game: "일반동사 완전정복",
      nameSel: "#studentName",
      read: function () {
        var box = $("#resultCard");
        if (!box || !box.classList.contains("show")) return null;
        var r = ratio(tx("#finalScore"));
        if (!r) return null;
        return {
          level: $("#modeBanner.show") ? "오답 재도전" : "전체 27문항",
          score: pct(r[0], r[1]), hit: r[0], total: r[1], wrongs: []
        };
      }
    },



    "jokjipge": {
      game: "문법 족집게 퀴즈",
      nameSel: null,
      read: function () {
        var s = $("#summary");
        if (!s || !s.classList.contains("show")) return null;
        var r = ratio(tx("#summaryScore"));
        if (!r) return null;
        return { level: "3문항", score: pct(r[0], r[1]), hit: r[0], total: r[1], wrongs: [] };
      }
    }
  };

  /* ---------- 어느 게임인지 ---------- */
  var slug = (location.pathname.replace(/\/index\.html?$/i, "").replace(/\/+$/, "").split("/").pop() || "").toLowerCase();
  var R = READERS[slug];
  if (!ENDPOINT || !R) return;

  /* ---------- 보내기 ---------- */
  function pushQueue(rec) {
    var q = [];
    try { q = JSON.parse(ls(QUEUE_KEY) || "[]"); } catch (e) { q = []; }
    q.push(rec);
    ls(QUEUE_KEY, JSON.stringify(q.slice(-40)));
  }

  function post(rec) {
    var body = JSON.stringify(rec);
    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: body
    }).then(function () { return true; })
      .catch(function () {
        return fetch(ENDPOINT, { method: "POST", mode: "no-cors", body: body })
          .then(function () { return true; })
          .catch(function () { return false; });
      });
  }

  function flushQueue() {
    var q = [];
    try { q = JSON.parse(ls(QUEUE_KEY) || "[]"); } catch (e) { return; }
    if (!q.length) return;
    ls(QUEUE_KEY, "[]");
    q.forEach(function (rec) {
      post(rec).then(function (ok) { if (!ok) pushQueue(rec); });
    });
  }

  /* ---------- 아직 보내지 않은 결과 보관 ---------- */
  /* 단계를 끝내면 결과를 먼저 기기에 담아 둡니다.
     게임을 나갔다가 들어와도 담아 둔 결과를 한꺼번에 보낼 수 있습니다. */
  function loadPend() {
    var a = [];
    try { a = JSON.parse(ls(PEND_KEY) || "[]"); } catch (e) { a = []; }
    return Array.isArray(a) ? a : [];
  }
  function savePend(a) { ls(PEND_KEY, JSON.stringify(a.slice(-30))); }
  function loadSent() {
    var a = [];
    try { a = JSON.parse(ls(SENT_KEY) || "[]"); } catch (e) { a = []; }
    return Array.isArray(a) ? a : [];
  }
  function markSent(keys) {
    var a = loadSent().concat(keys);
    ls(SENT_KEY, JSON.stringify(a.slice(-60)));
    keys.forEach(function (k) { sent[k] = true; });
  }
  function recKey(res) { return [R.game, res.level, res.score, res.hit, res.total].join("|"); }
  function addPend(res) {
    var key = recKey(res);
    if (sent[key]) return;
    if (loadSent().indexOf(key) >= 0) { sent[key] = true; return; }
    var a = loadPend();
    for (var i = 0; i < a.length; i++) if (a[i].key === key) return;
    a.push({
      key: key, game: R.game, level: res.level || "",
      score: res.score, hit: res.hit, total: res.total,
      wrongs: (res.wrongs || []).slice(0, 60), ts: Date.now()
    });
    savePend(a);
  }
  function pendCount() { return loadPend().length; }

  /* ---------- 화면 아래 붙어 있는 보내기 칸 ---------- */
  var bar, nameInput, sendBtn, msgEl, subEl, sending = false, sent = {}, shownKey = null;
  var mini, placed = "";
  var PEND_KEY = "kkt_pending_v1";
  var SENT_KEY = "kkt_sent_v1";

  var FIXED_CSS = [
    "position:fixed", "left:0", "right:0", "bottom:0", "border-radius:0", "margin:0",
    "padding:13px 14px calc(13px + env(safe-area-inset-bottom,0px))",
    "box-shadow:0 -8px 22px -12px rgba(0,0,0,.55)"
  ];
  var INLINE_CSS = [
    "position:static", "left:auto", "right:auto", "bottom:auto", "border-radius:16px",
    "margin:16px 0 6px", "padding:16px 16px 17px",
    "box-shadow:0 14px 30px -18px rgba(15,110,92,.95)"
  ];
  var MODAL_CSS = [
    "position:static", "left:auto", "right:auto", "bottom:auto", "border-radius:14px",
    "margin:12px 0 2px", "padding:14px 14px 15px",
    "box-shadow:none"
  ];

  function buildBar() {
    bar = document.createElement("div");
    bar.setAttribute("dir", "ltr");
    bar.style.cssText = [
      "display:none", "position:fixed", "left:0", "right:0", "bottom:0", "z-index:99999",
      "box-sizing:border-box", "width:100%",
      "padding:13px 14px calc(13px + env(safe-area-inset-bottom,0px))",
      "background:#0F6E5C", "color:#FFFFFF",
      "font-family:'IBM Plex Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif",
      "font-size:16px", "line-height:1.45", "text-align:left",
      "box-shadow:0 -8px 22px -12px rgba(0,0,0,.55)"
    ].join(";");

    var inner = document.createElement("div");
    inner.style.cssText = "max-width:720px;margin:0 auto;display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px";

    msgEl = document.createElement("span");
    msgEl.style.cssText = "flex:1 1 100%;font-weight:700;font-size:17px;color:#FFFFFF";

    subEl = document.createElement("span");
    subEl.style.cssText = "flex:1 1 100%;font-size:14px;color:#D8F0E8;margin-top:-4px";

    nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.maxLength = 20;
    nameInput.placeholder = "이름";
    nameInput.setAttribute("aria-label", "이름");
    nameInput.style.cssText = [
      "flex:1 1 130px", "min-width:0", "box-sizing:border-box",
      "font-family:inherit", "font-size:17px",
      "padding:11px 13px", "border:0", "border-radius:9px",
      "background:#FFFFFF", "color:#15201D"
    ].join(";");

    sendBtn = document.createElement("button");
    sendBtn.type = "button";
    sendBtn.textContent = "선생님께 보내기";
    sendBtn.style.cssText = [
      "flex:0 0 auto", "font-family:inherit", "font-size:17px", "font-weight:700",
      "padding:12px 20px", "border:0", "border-radius:9px", "cursor:pointer",
      "background:#F3D74B", "color:#15201D"
    ].join(";");

    inner.appendChild(msgEl);
    inner.appendChild(subEl);
    inner.appendChild(nameInput);
    inner.appendChild(sendBtn);
    bar.appendChild(inner);
    document.body.appendChild(bar);

    sendBtn.addEventListener("click", doSend);
    nameInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); doSend(); }
    });
  }

  /* 화면 아래에 붙는 작은 되돌아가기 단추 — 결과 칸이 위로 밀려 보이지 않을 때만 나옵니다 */
  function buildMini() {
    mini = document.createElement("button");
    mini.type = "button";
    mini.setAttribute("dir", "ltr");
    mini.textContent = "↑ 선생님께 보내기";
    mini.style.cssText = [
      "display:none", "position:fixed", "left:0", "right:0", "bottom:0", "z-index:99998",
      "box-sizing:border-box", "width:100%", "border:0", "cursor:pointer",
      "padding:14px 14px calc(14px + env(safe-area-inset-bottom,0px))",
      "background:#F3D74B", "color:#15201D",
      "font-family:'IBM Plex Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif",
      "font-size:17px", "font-weight:700",
      "box-shadow:0 -8px 22px -12px rgba(0,0,0,.45)"
    ].join(";");
    mini.addEventListener("click", function () { lookAtBar(); });
    document.body.appendChild(mini);
  }

  /* 칸을 둘 자리를 정합니다 — 칭찬 창 안 → 결과 칸 안 → 화면 아래 차례 */
  /* 칭찬 창은 position:fixed 라서 offsetParent 로는 못 봅니다 */
  function modalUp() {
    var pb = $("#praiseBox");
    if (!pb) return false;
    if (pb.className && /(^|\s)hide(\s|$)/.test(pb.className)) return false;
    try { return getComputedStyle(pb).display !== "none" && getComputedStyle(pb).visibility !== "hidden"; }
    catch (e) { return false; }
  }

  function desiredSpot(res) {
    if (modalUp()) return "modal";
    var r = $("#result");
    if (res || (r && vis(r))) return "inline";
    return "fixed";
  }

  /* 칭찬 창 · 결과 칸 안(글 흐름) · 화면 아래 고정 — 같은 칸을 자리만 옮겨 씁니다 */
  function placeBar(where) {
    if (!bar) buildBar();
    if (placed === where) return;
    if (where === "modal") {
      var box = $("#praiseBox .box");
      if (box && modalUp()) {
        applyCss(MODAL_CSS);
        var close = $("#pmClose");
        if (close && close.parentNode === box) box.insertBefore(bar, close);
        else box.appendChild(bar);
        placed = "modal";
        return;
      }
      where = "inline";
    }
    if (where === "inline") {
      var host = $("#result");
      if (host && vis(host)) {
        var slot = document.getElementById("kktSlot");
        if (!slot) {
          slot = document.createElement("div");
          slot.id = "kktSlot";
          var anchor = $("#rnext") || $("#rsubmit") || $("#rwrong");
          if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(slot, anchor);
          else host.appendChild(slot);
        }
        applyCss(INLINE_CSS);
        slot.appendChild(bar);
        placed = "inline";
        return;
      }
    }
    applyCss(FIXED_CSS);
    document.body.appendChild(bar);
    placed = "fixed";
  }

  function applyCss(rules) {
    rules.forEach(function (r) {
      var i = r.indexOf(":");
      bar.style[cssProp(r.slice(0, i))] = r.slice(i + 1);
    });
  }

  function cssProp(n) { return n.replace(/-([a-z])/g, function (m, c) { return c.toUpperCase(); }); }

  function lookAtBar() {
    try { bar.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) { try { bar.scrollIntoView(); } catch (e2) {} }
    try {
      sendBtn.style.transition = "transform .25s";
      var k = 0, t = setInterval(function () {
        sendBtn.style.transform = (k % 2 ? "scale(1)" : "scale(1.07)");
        if (++k > 5) { clearInterval(t); sendBtn.style.transform = "scale(1)"; }
      }, 260);
    } catch (e) {}
  }

  /* 결과 칸이 화면에서 벗어났는지 봅니다 */
  function barOffScreen() {
    if (!bar || placed !== "inline" || bar.style.display === "none") return false;
    if (modalUp()) return false;
    try {
      var r = bar.getBoundingClientRect();
      if (!r.height) return false;
      return r.bottom < 40 || r.top > (window.innerHeight || 0) - 20;
    } catch (e) { return false; }
  }

  function syncMini() {
    if (!mini) buildMini();
    var on = !sending && pendCount() > 0 && barOffScreen();
    mini.style.display = on ? "block" : "none";
    if (on) padBody(true, mini.offsetHeight);
    else if (placed === "inline") padBody(false);
  }

  function isAdmin() { return gameName() === "꾸메땅"; }

  function gameName() {
    if (!R.nameSel) return "";
    var e = $(R.nameSel);
    return e ? (e.value || "").trim() : "";
  }

  function showBar(res) {
    if (!bar) buildBar();
    var n = pendCount();
    if (!n) { hideBar(); return; }
    var wasPlaced = placed;
    placeBar(desiredSpot(res));
    if (res && placed === "modal") {
      msgEl.textContent = "단계 끝! 선생님께 보내 주세요";
    } else if (res) {
      msgEl.textContent = "단계 끝! 결과를 선생님께 보내 주세요 — " +
        (res.level ? res.level + " · " : "") + res.score + "점" +
        (res.total ? " (" + res.hit + "/" + res.total + ")" : "");
    } else {
      msgEl.textContent = "아직 선생님께 보내지 않은 결과가 " + n + "개 있습니다.";
    }
    subEl.textContent = n > 1
      ? "보내지 않은 결과 " + n + "개를 한 번에 보냅니다."
      : "① 이름을 적고 ② 노란 단추를 누르면 선생님께 바로 갑니다.";
    if (!sending) {
      nameInput.style.display = "";
      sendBtn.style.display = "";
      sendBtn.disabled = false;
      sendBtn.textContent = n > 1 ? "모두 보내기 (" + n + ")" : "선생님께 보내기";
      if (!nameInput.value) nameInput.value = gameName() || ls(NAME_KEY) || "";
    }
    bar.style.display = "block";
    padBody(placed === "fixed");
    if (placed === "inline" && res && wasPlaced !== "inline") setTimeout(lookAtBar, 260);
    syncMini();
  }

  function hideBar() {
    if (bar) bar.style.display = "none";
    if (mini) mini.style.display = "none";
    padBody(false);
  }

  /* 칸이 화면 아래를 가리지 않도록 여백을 둡니다 */
  function padBody(on, h) {
    try {
      if (on) {
        var px = h || (bar ? bar.offsetHeight : 0);
        document.body.style.paddingBottom = (px + 12) + "px";
      } else if (document.body.style.paddingBottom) {
        document.body.style.paddingBottom = "";
      }
    } catch (e) {}
  }

  function doSend() {
    var who = (nameInput.value || "").trim();
    if (!who) { nameInput.focus(); msgEl.textContent = "이름을 먼저 적어 주세요."; return; }
    ls(NAME_KEY, who);

    var list = loadPend();
    if (!list.length) { hideBar(); return; }

    sending = true;
    savePend([]);                      /* 먼저 비우고, 실패하면 다시 담습니다 */
    markSent(list.map(function (p) { return p.key; }));
    sendBtn.disabled = true;
    sendBtn.textContent = "보내는 중…";

    var done = 0, fail = 0;
    list.forEach(function (p) {
      var rec = {
        name: who, game: p.game, level: p.level,
        score: p.score, hit: p.hit, total: p.total, wrongs: p.wrongs || []
      };
      post(rec).then(function (ok) {
        if (!ok) { fail++; pushQueue(rec); }
        done++;
        if (done === list.length) finishSend(who, list.length, fail);
      });
    });
  }

  function finishSend(who, count, fail) {
    sending = false;
    msgEl.textContent = "✓ 보냈습니다 — " + who + " · 결과 " + count + "개";
    subEl.textContent = fail ? "인터넷이 돌아오면 자동으로 다시 보냅니다." : "잘했습니다. 이어서 다음 단계에 도전해 보세요.";
    nameInput.style.display = "none";
    sendBtn.style.display = "none";
    shownKey = null;
    if (mini) mini.style.display = "none";
    setTimeout(function () {
      if (pendCount()) { showBar(null); } else { hideBar(); }
    }, 5000);
  }

  /* ---------- 결과 화면 지켜보기 ---------- */
  var lastLevel = "", lastTotal = null;

  function tick() {
    if (R.totalWatch) {
      try { var t = R.totalWatch(); if (t) lastTotal = t; } catch (e) {}
    }
    if (R.levelWatch) {
      try { var lv = R.levelWatch(); if (lv) lastLevel = lv; } catch (e) {}
    }
    if (isAdmin()) { hideBar(); return; }   /* 관리자(꾸메땅)로 풀어 볼 때는 보내지 않습니다 */

    var res = null;
    try { res = R.read(); } catch (e) { res = null; }

    if (res && res.score !== null && res.score !== undefined) {
      addPend(res);
      var key = recKey(res);
      if (sending) return;
      if (key !== shownKey) { shownKey = key; showBar(res); }
      else if (bar && bar.style.display === "none" && pendCount()) showBar(res);
      else if (placed !== desiredSpot(res)) showBar(res);
      else syncMini();
      return;
    }

    /* 결과 화면이 아니어도, 보내지 않은 결과가 있으면 칸을 계속 보여 줍니다 */
    if (sending) return;
    if (pendCount()) {
      if (shownKey !== "pend") { shownKey = "pend"; showBar(null); }
    } else {
      shownKey = null;
      hideBar();
    }
  }

  function start() {
    flushQueue();
    setInterval(tick, 700);
    var waiting = false;
    function onScroll() {
      if (waiting) return;
      waiting = true;
      setTimeout(function () { waiting = false; try { syncMini(); } catch (e) {} }, 120);
    }
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    tick();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
