/* 꾸메땅 영문법 GAME
   홈 화면에 앱으로 담기 위한 최소한의 일꾼입니다.
   아무것도 저장해 두지 않고 그때그때 새로 받아 옵니다.
   그래서 선생님이 게임을 고쳐 올리시면 아이들 화면에도 바로 반영됩니다. */
self.addEventListener("install", function(){ self.skipWaiting(); });
self.addEventListener("activate", function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function(e){ /* 그냥 통과시킵니다 */ });
