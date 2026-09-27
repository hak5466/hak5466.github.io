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
          return {
            no: tx(".no", w),
            q: tx(".q", w),
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
  var PEND_KEY = "kkt_pending_v1";
  var SENT_KEY = "kkt_sent_v1";

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
    if (res) {
      msgEl.textContent = "이 단계 결과를 선생님께 보내 주세요 — " +
        (res.level ? res.level + " · " : "") + res.score + "점" +
        (res.total ? " (" + res.hit + "/" + res.total + ")" : "");
    } else {
      msgEl.textContent = "아직 선생님께 보내지 않은 결과가 " + n + "개 있습니다.";
    }
    subEl.textContent = n > 1
      ? "보내지 않은 결과 " + n + "개를 한 번에 보냅니다."
      : "이름을 적고 단추를 누르면 선생님께 바로 갑니다.";
    if (!sending) {
      nameInput.style.display = "";
      sendBtn.style.display = "";
      sendBtn.disabled = false;
      sendBtn.textContent = n > 1 ? "모두 보내기 (" + n + ")" : "선생님께 보내기";
      if (!nameInput.value) nameInput.value = gameName() || ls(NAME_KEY) || "";
    }
    bar.style.display = "block";
    padBody(true);
  }

  function hideBar() {
    if (bar) bar.style.display = "none";
    padBody(false);
  }

  /* 칸이 화면 아래를 가리지 않도록 여백을 둡니다 */
  function padBody(on) {
    try {
      if (on) {
        var h = bar ? bar.offsetHeight : 0;
        document.body.style.paddingBottom = (h + 12) + "px";
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
    tick();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
