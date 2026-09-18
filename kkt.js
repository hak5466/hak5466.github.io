/* 꾸메땅 영문법 게임 · 결과 보내기 (공용)
   게임 14개가 이 파일 하나를 함께 씁니다.
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
    "toinf": familyA("TO부정사 GAME"),
    "toinf-basic": familyA("TO부정사 기본 GAME"),
    "pumsa8": familyA("8품사 GAME"),
    "usedto": familyA("USED TO GAME"),
    "sothat": familyA("SO~THAT GAME"),
    "sothat-purpose": familyA("SO THAT 목적 GAME"),
    "form5b": familyA("5형식 뽀개기 (중2)"),
    "ph": familyA("파닉스 뽀개기"),
    "noun": familyA("[대]명사 뽀개기"),
    "verbtype": familyA("동사 뽀개기"),
    "sense": familyA("감각동사 GAME"),
    "itsub": familyA("비인칭주어 GAME"),

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

    "form5": {
      game: "지각·사역동사 클리닉",
      nameSel: "#studentNameInput",
      levelWatch: function () {
        var m = tx("#app").match(/(초급|중급|고급)\s*·\s*\d+\s*\/\s*\d+/);
        return m ? m[1] : null;
      },
      read: function () {
        var big = $("#app .banner .big");
        if (!vis(big)) return null;
        var m = (big.textContent || "").match(/(\d+)\s*\/\s*(\d+)\s*\((\d+)/);
        if (!m) return null;
        var desc = tx("#app .banner .desc");
        var lv = (lastLevel || desc).match(/(초급|기본|중급|고급)/);
        var wrongs = $$("#app .final-item").map(function (w, i) {
          return {
            no: String(i + 1),
            q: tx(".fs", w),
            mine: "",
            ans: tx(".fi-ans", w).replace(/^정답\s*:\s*/, "")
          };
        });
        return {
          level: lv ? lv[1] : tx("#app .banner .badge"),
          score: +m[3], hit: +m[1], total: +m[2], wrongs: wrongs
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


    "perfect": {
      game: "현재완료 게임",
      nameSel: "#nameIn",
      read: function () {
        var box = $("#result");
        if (!vis(box)) return null;
        if (tx("#result .of") !== "/ 100점") return null;
        var score = num(tx("#result .score .big"));
        if (score === null) return null;
        var bd = $$("#result .breakdown .bd");
        var hit = bd[0] ? num(tx(".v", bd[0])) : null;
        var miss = bd[1] ? num(tx(".v", bd[1])) : null;
        return {
          level: tx("#result h2").replace(/\s*결과.*$/, "").trim(),
          score: score, hit: hit,
          total: (hit !== null && miss !== null) ? hit + miss : null,
          wrongs: []
        };
      }
    },

    "perfect2": {
      game: "현재완료 클리닉",
      nameSel: "#studentName",
      read: function () {
        var big = $("#banner .big");
        if (!vis(big)) return null;
        var stillRetry = $$("#banner button").some(function (b) {
          return /다시 풀기/.test(b.textContent || "");
        });
        if (stillRetry) return null;                            /* 마지막 회차만 보냄 */
        var r = ratio(big.textContent);
        if (!r) return null;
        var wrongs = $$(".final-item").map(function (w, i) {
          return { no: tx(".fs", w) || String(i + 1), q: tx(".fi-kr", w), mine: "", ans: tx("strong", w) };
        });
        return { level: "20문항", score: pct(r[0], r[1]), hit: r[0], total: r[1], wrongs: wrongs };
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

  /* ---------- 결과 화면 안의 보내기 칸 ---------- */
  var bar, nameInput, sendBtn, msgEl, offered = null, sent = {};

  /* 게임마다 결과 화면에서 이 요소 바로 앞에 끼워 넣습니다. 못 찾으면 결과 상자 끝에 붙입니다. */
  var MOUNT = {
    "familyA":        { box: "#result",        before: "#rbreak" },
    "phonics":        { box: "#stage-report",  before: "#reportBody" },
    "pumsa-lab":      { box: "#screen-result .result-card", before: "#btn-retry" },
    "verb1":          { box: "#resultCard",    before: "#missTitle" },
    "verb2":          { box: "#resultCard",    before: ".retry-row" },
    "form5":          { box: "#app .banner",   before: null },
    "perfect":        { box: "#result",        before: ".breakdown" },
    "perfect2":       { box: "#banner .banner", before: null },
    "jokjipge":       { box: "#summary",       before: null }
  };
  var MOUNT_KEY = MOUNT[slug] ? slug : "familyA";

  function buildBar() {
    bar = document.createElement("div");
    bar.setAttribute("dir", "ltr");
    bar.style.cssText = [
      "display:none", "box-sizing:border-box", "width:100%",
      "margin:14px 0", "padding:15px 16px",
      "background:#0F6E5C", "color:#FFFFFF", "border-radius:13px",
      "font-family:'IBM Plex Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif",
      "font-size:16px", "line-height:1.5", "text-align:left",
      "box-shadow:0 6px 18px -10px rgba(0,0,0,.45)"
    ].join(";");

    var inner = document.createElement("div");
    inner.style.cssText = "display:flex;flex-wrap:wrap;align-items:center;gap:9px 10px";

    msgEl = document.createElement("span");
    msgEl.style.cssText = "flex:1 1 100%;font-weight:700;font-size:17px;color:#FFFFFF";

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
    inner.appendChild(nameInput);
    inner.appendChild(sendBtn);
    bar.appendChild(inner);

    sendBtn.addEventListener("click", doSend);
    nameInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); doSend(); }
    });
  }

  /* 결과 상자 안 제자리에 놓기 */
  function place() {
    var m = MOUNT[MOUNT_KEY];
    var box = $(m.box);
    if (!box) return false;
    var ref = m.before ? $(m.before, box) : null;
    if (ref && ref.parentNode === box) box.insertBefore(bar, ref);
    else if (ref && box.contains(ref)) ref.parentNode.insertBefore(bar, ref);
    else box.appendChild(bar);
    return true;
  }

  function gameName() {
    if (!R.nameSel) return "";
    var e = $(R.nameSel);
    return e ? (e.value || "").trim() : "";
  }

  function showBar(res, key) {
    if (!bar) buildBar();
    if (!place()) return;                 /* 결과 상자를 못 찾으면 아무것도 하지 않습니다 */
    bar.dataset.key = key;
    bar.dataset.payload = JSON.stringify(res);
    msgEl.textContent = "결과를 선생님께 보낼까요?  " +
      (res.level ? res.level + " · " : "") + res.score + "점" +
      (res.total ? " (" + res.hit + "/" + res.total + ")" : "");
    nameInput.value = gameName() || ls(NAME_KEY) || "";
    nameInput.style.display = "";
    sendBtn.style.display = "";
    sendBtn.disabled = false;
    sendBtn.textContent = "선생님께 보내기";
    bar.style.display = "block";
  }

  function hideBar() {
    if (bar) bar.style.display = "none";
  }

  function doSend() {
    var who = (nameInput.value || "").trim();
    if (!who) { nameInput.focus(); msgEl.textContent = "이름을 먼저 적어 주세요."; return; }
    ls(NAME_KEY, who);

    var res = JSON.parse(bar.dataset.payload);
    var key = bar.dataset.key;
    var rec = {
      name: who, game: R.game, level: res.level || "",
      score: res.score, hit: res.hit, total: res.total,
      wrongs: (res.wrongs || []).slice(0, 60)
    };

    sent[key] = true;
    sendBtn.disabled = true;
    sendBtn.textContent = "보내는 중…";

    post(rec).then(function (ok) {
      if (!ok) pushQueue(rec);
      msgEl.textContent = "✓ 보냈습니다 — " + who + " · " +
        (rec.level ? rec.level + " · " : "") + rec.score + "점";
      nameInput.style.display = "none";
      sendBtn.style.display = "none";
      setTimeout(hideBar, 6000);
    });
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
    var res = null;
    try { res = R.read(); } catch (e) { res = null; }
    if (!res || res.score === null || res.score === undefined) {
      if (offered !== null) { offered = null; hideBar(); }
      return;
    }
    var key = [R.game, res.level, res.score, res.hit, res.total].join("|");
    if (key === offered) return;
    offered = key;
    if (sent[key]) { hideBar(); return; }
    showBar(res, key);
  }

  function start() {
    flushQueue();
    setInterval(tick, 700);
    tick();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
