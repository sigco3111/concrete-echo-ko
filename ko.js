/* CONCRETE ECHO 한국어판: 화면에 나온 영어 문구를 한국어로 바꾸는 번역 스크립트.
 * 원본 게임 코드는 그대로 두고, 화면 글자가 바뀔 때마다 아래 표로 번역한다. */
(function () {
  'use strict';

  var EXACT = {
    'Move': '이동',
    'MOUSE': '마우스',
    'LEFT / RIGHT CLICK': '좌 / 우 클릭',
    'WHEEL': '휠',
    'Aim the weapon (the camera follows)': '무기 조준 (카메라가 따라옴)',
    'Fire / aim down the sights': '발사 / 조준경 조준',
    'Rifle · pistol · shotgun · Thumper': '소총 · 권총 · 산탄총 · 썸퍼',
    'Echo pulse: see hostiles through walls. They hear it.': '에코 펄스: 벽 너머의 적을 봅니다. 적도 그 소리를 듣습니다.',
    'Sprint · crouch · jump': '달리기 · 웅크리기 · 점프',
    'Lean around corners': '모퉁이에서 몸 기울이기',
    'Reload · weapon light · laser': '재장전 · 무기 조명 · 레이저',
    'Toggle performance mode': '성능 모드 전환',
    'BODY CAMERA · BUILDING CLEARANCE': '바디캠 · 건물 소탕',
    'AUDIO ON · 1080P30': '오디오 켜짐 · 1080P30',
    '1-4 / WHEEL WEAPON · V ECHO PULSE · R RELOAD · F LIGHT · L LASER · Q/E LEAN': '1-4 / 휠 무기 · V 에코 펄스 · R 재장전 · F 조명 · L 레이저 · Q/E 기울이기',
    'Loading': '불러오는 중',
    'DEPLOY': '투입',
    'PAUSED': '일시정지',
    'CLICK TO RESUME': '클릭하여 계속',
    'REDEPLOY': '재투입',
    'OR PRESS ENTER': '또는 Enter 키',
    'BUILDING CLEAR': '건물 소탕 완료',
    'SIGNAL LOST': '신호 두절',
    'RELOADING': '재장전 중',
    'ECHO READY [V]': '에코 준비 [V]',
    'Loading surfaces': '표면 불러오는 중',
    'Painting walls': '벽 칠하는 중',
    'Letting daylight in': '햇빛 들이는 중',
    'Loading physics': '물리 엔진 불러오는 중',
    'Bringing in the scanned props': '스캔한 소품 들여오는 중'
  };

  var PATTERNS = [
    [/^● ?REC KESTREL BWC-2 UNIT K-41 · CAM 07$/, '● 녹화 KESTREL BWC-2 유닛 K-41 · 캠 07'],
    [/^REC KESTREL BWC-2 UNIT K-41 · CAM 07$/, '녹화 KESTREL BWC-2 유닛 K-41 · 캠 07'],
    [/^HOSTILE DOWN (\d+)\/(\d+)$/, '적 사살 $1/$2'],
    [/^CLEAR THE BUILDING · (\d+) HOSTILES$/, '건물을 소탕하라 · 적 $1명'],
    [/^ECHO\s+([\d.]+)\s*s$/, '에코 $1초']
  ];

  /* 결과 화면 통계(#endStats) 안에서만 쓰는 단어 */
  var STATS = [
    [/HOSTILES DOWN/g, '사살'],
    [/ROUNDS FIRED/g, '발사 수'],
    [/ACCURACY/g, '명중률'],
    [/TIME/g, '시간']
  ];

  function translateText(text, inStats) {
    var m = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
    var lead = m[1], core = m[2], tail = m[3];
    if (!core) return text;
    var dots = core.match(/[.…]+$/);
    var suffix = dots ? dots[0] : '';
    var bare = suffix ? core.slice(0, core.length - suffix.length) : core;
    if (Object.prototype.hasOwnProperty.call(EXACT, core)) return lead + EXACT[core] + tail;
    if (suffix && Object.prototype.hasOwnProperty.call(EXACT, bare)) return lead + EXACT[bare] + suffix + tail;
    for (var i = 0; i < PATTERNS.length; i++) {
      if (PATTERNS[i][0].test(core)) return lead + core.replace(PATTERNS[i][0], PATTERNS[i][1]) + tail;
    }
    if (inStats) {
      var out = core;
      for (var j = 0; j < STATS.length; j++) out = out.replace(STATS[j][0], STATS[j][1]);
      if (out !== core) return lead + out + tail;
    }
    return text;
  }

  function insideStats(node) {
    var el = node.parentNode;
    while (el && el.nodeType === 1) {
      if (el.id === 'endStats') return true;
      el = el.parentNode;
    }
    return false;
  }

  function fixNode(node) {
    if (node.nodeType === 3) {
      var next = translateText(node.nodeValue, insideStats(node));
      if (next !== node.nodeValue) node.nodeValue = next;
      return;
    }
    if (node.nodeType === 1 && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
      for (var c = node.firstChild; c; c = c.nextSibling) fixNode(c);
    }
  }

  function start() {
    document.documentElement.lang = 'ko';
    fixNode(document.body);
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var r = list[i];
        if (r.type === 'characterData') fixNode(r.target);
        else for (var k = 0; k < r.addedNodes.length; k++) fixNode(r.addedNodes[k]);
        if (r.type === 'childList' && r.target) fixNode(r.target);
      }
    }).observe(document.body, { childList: true, characterData: true, subtree: true });
  }

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start);
})();
