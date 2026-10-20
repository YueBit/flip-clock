/* ---------------------------------------------------------------
   Robodiag flip clock — ES5 only, so an iPad stuck on iOS 9 still
   runs every line of it. No fetch(), no arrows, no template strings.
   --------------------------------------------------------------- */

(function () {
  'use strict';

  var CFG = window.CLOCK_CONFIG || {};

  function pick(key, fallback) {
    var v = CFG[key];
    return (v === undefined || v === null) ? fallback : v;
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function el(id) { return document.getElementById(id); }
  function num(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function show(node, on) {
    if (!node) { return; }
    if (on) { node.removeAttribute('hidden'); }
    else { node.setAttribute('hidden', 'hidden'); }
  }

  /* -------------------------------------------------------------
     Language
     ------------------------------------------------------------- */

  /* ?lang=zh on the URL wins over config.js: it makes a Chinese board linkable
     (a home-screen shortcut can pin it) and gives the layout a way to be checked
     in both languages without editing a file. */
  var lang = (function () {
    var m = /[?&]lang=(zh|en)\b/.exec(location.search);
    return String(m ? m[1] : pick('lang', 'auto')).toLowerCase();
  })();
  if (lang === 'auto') {
    var nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    lang = nav.indexOf('zh') === 0 ? 'zh' : 'en';
  }
  if (lang !== 'zh' && lang !== 'en') { lang = 'en'; }

  var L = {
    zh: {
      weekdays: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      date: function (d) {
        return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' +
          this.weekdays[d.getDay()];
      },
      weatherError: '',
      tapHint: '轻触屏幕开启声音'
    },
    en: {
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'],
      date: function (d) {
        return this.weekdays[d.getDay()] + ', ' + d.getDate() + ' ' +
          this.months[d.getMonth()] + ' ' + d.getFullYear();
      },
      weatherError: '',
      tapHint: 'Tap the screen for sound'
    }
  }[lang];

  /* -------------------------------------------------------------
     Weather codes (WMO). [icon, zh, en]
     ------------------------------------------------------------- */

  var WMO = {
    0: ['clear', '晴', 'Clear'],
    1: ['mostlysunny', '大致晴朗', 'Mainly clear'],
    2: ['partly', '多云', 'Partly cloudy'],
    3: ['cloudy', '阴', 'Overcast'],
    45: ['fog', '有雾', 'Fog'],
    48: ['fog', '冻雾', 'Freezing fog'],
    51: ['drizzle', '细微雨', 'Light drizzle'],
    53: ['drizzle', '毛毛雨', 'Drizzle'],
    55: ['drizzle', '细雨', 'Dense drizzle'],
    56: ['drizzle', '冻毛毛雨', 'Freezing drizzle'],
    57: ['drizzle', '冻雨', 'Freezing drizzle'],
    61: ['rain', '小雨', 'Light rain'],
    63: ['rain', '中雨', 'Rain'],
    65: ['rain', '大雨', 'Heavy rain'],
    66: ['rain', '冻雨', 'Freezing rain'],
    67: ['rain', '冻雨', 'Freezing rain'],
    71: ['snow', '小雪', 'Light snow'],
    73: ['snow', '中雪', 'Snow'],
    75: ['snow', '大雪', 'Heavy snow'],
    77: ['snow', '霰', 'Snow grains'],
    80: ['rain', '阵雨', 'Light showers'],
    81: ['rain', '阵雨', 'Showers'],
    82: ['rain', '强阵雨', 'Violent showers'],
    85: ['snow', '阵雪', 'Snow showers'],
    86: ['snow', '强阵雪', 'Heavy snow showers'],
    95: ['thunder', '雷阵雨', 'Thunderstorm'],
    96: ['thunder', '雷阵雨伴冰雹', 'Thunderstorm, hail'],
    99: ['thunder', '强雷暴伴冰雹', 'Thunderstorm, hail']
  };

  /* -------------------------------------------------------------
     Inline icons — thin monochrome line art, no external requests
     ------------------------------------------------------------- */

  var CLOUD = 'M7 15.6h9.4a3.6 3.6 0 0 0 .2-7.2A5.4 5.4 0 0 0 6.3 7.2 3.7 3.7 0 0 0 7 15.6z';
  var CLOUD_LOW = 'M8.2 19.4h9.2a3.5 3.5 0 0 0 .2-7A5.3 5.3 0 0 0 7.5 11.2 3.6 3.6 0 0 0 8.2 19.4z';

  var ICON = {
    clear: '<circle cx="12" cy="12" r="4.3"/><path d="M12 2.4v2.1M12 19.5v2.1M4.6 4.6l1.5 1.5M17.9 17.9l1.5 1.5M2.4 12h2.1M19.5 12h2.1M4.6 19.4l1.5-1.5M17.9 6.1l1.5-1.5"/>',
    moon: '<path d="M20.4 14.7A8.5 8.5 0 0 1 9.3 3.6a8.6 8.6 0 1 0 11.1 11.1z"/>',
    mostlysunny: '<circle cx="8.8" cy="7.8" r="2.7"/><path d="M8.8 2.9v1.4M4.6 4l1 1M3.2 7.8h1.4"/><path d="' + CLOUD_LOW + '"/>',
    partly: '<circle cx="9" cy="8.4" r="3"/><path d="M9 3.4v1.3M4.9 4.3l.9.9M4 8.4h1.3"/><path d="M9.2 19.4h8.8a3.5 3.5 0 0 0 .2-7 5.3 5.3 0 0 0-10-1.2 3.6 3.6 0 0 0 1 8.2z"/>',
    cloudy: '<path d="M8.6 18.6h8.6a3.4 3.4 0 0 0 .2-6.8A5.1 5.1 0 0 0 7.7 10.7a3.5 3.5 0 0 0 .9 7.9z"/><path d="M5.8 13.2a4 4 0 0 1 3.2-4.6"/><path d="M4.6 17.8a4 4 0 0 1 1.2-6.4"/>',
    fog: '<path d="M4.4 8.6h15.2M6.6 12.4h10.8M4.4 16.2h15.2M7.4 20h9.2"/>',
    drizzle: '<path d="' + CLOUD + '"/><path d="M9.6 18.2v2M13 18.2v2"/>',
    rain: '<path d="' + CLOUD + '"/><path d="M8.6 18v2.6M12 18v2.6M15.4 18v2.6"/>',
    showers: '<path d="' + CLOUD + '"/><path d="M8.6 18l-1 2.6M12 18l-.8 2.6M15.4 18l-1 2.6"/>',
    snow: '<path d="' + CLOUD + '"/><circle cx="8.8" cy="19.4" r="0.85" fill="currentColor" stroke="none"/><circle cx="12" cy="20.6" r="0.85" fill="currentColor" stroke="none"/><circle cx="15.2" cy="19.4" r="0.85" fill="currentColor" stroke="none"/>',
    thunder: '<path d="' + CLOUD + '"/><path d="M12.9 17.2l-2.1 3.4h2.5l-1.3 2.4"/>'
  };

  function iconSVG(name) {
    var body = ICON[name] || ICON.cloudy;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }

  /* -------------------------------------------------------------
     Flip digits
     ------------------------------------------------------------- */

  var clockEl = el('clock');
  var animate = pick('animate', true) !== false;
  var showSeconds = pick('showSeconds', true) !== false;
  var hour12 = pick('hour12', false) === true;

  function makeUnit() {
    var u = document.createElement('div');
    u.className = 'unit';
    u.innerHTML =
      '<div class="facet top"><span>0</span></div>' +
      '<div class="facet bot"><span>0</span></div>' +
      '<div class="facet leaf-top"><span>0</span><i class="shade"></i></div>' +
      '<div class="facet leaf-bot"><span>0</span><i class="shade"></i></div>' +
      '<div class="seam"></div>';
    return {
      el: u,
      top: u.getElementsByTagName('span')[0],
      bot: u.getElementsByTagName('span')[1],
      ltop: u.getElementsByTagName('span')[2],
      lbot: u.getElementsByTagName('span')[3],
      ltopEl: u.getElementsByTagName('div')[2],
      lbotEl: u.getElementsByTagName('div')[3],
      facets: u.getElementsByTagName('div'),
      cur: '',
      busy: false,
      timer: null
    };
  }

  function settle(u) {
    if (u.timer) { clearTimeout(u.timer); u.timer = null; }
    u.top.textContent = u.cur;
    u.bot.textContent = u.cur;
    u.ltop.textContent = u.cur;
    u.lbot.textContent = u.cur;
    u.ltopEl.className = 'facet leaf-top';
    u.lbotEl.className = 'facet leaf-bot';
    u.ltopEl.style.display = '';
    u.lbotEl.style.display = '';
    u.el.className = 'unit';
    u.busy = false;
  }

  function setUnit(u, value) {
    if (u.cur === value) { return; }
    if (u.busy) { settle(u); }

    var prev = u.cur;
    u.cur = value;

    if (!animate || prev === '') {
      u.top.textContent = value;
      u.bot.textContent = value;
      return;
    }

    /* New digits go in behind the leaves; the old top falls away while the
       new bottom swings up. All in one task, so no frame sees a wrong face. */
    u.ltop.textContent = prev;
    u.lbot.textContent = value;
    u.top.textContent = value;
    u.ltopEl.style.display = 'block';
    u.lbotEl.style.display = 'block';
    u.ltopEl.className = 'facet leaf-top flip';
    u.lbotEl.className = 'facet leaf-bot flip';
    u.el.className = 'unit flipping';
    u.busy = true;
    u.timer = setTimeout(function () {
      u.top.textContent = value;
      u.bot.textContent = value;
      u.ltopEl.className = 'facet leaf-top';
      u.lbotEl.className = 'facet leaf-bot';
      u.ltopEl.style.display = '';
      u.lbotEl.style.display = '';
      u.el.className = 'unit';
      u.busy = false;
      u.timer = null;
    }, 300);
  }

  var units = { h1: makeUnit(), h2: makeUnit(), m1: makeUnit(), m2: makeUnit() };

  clockEl.appendChild(units.h1.el);
  clockEl.appendChild(units.h2.el);

  var colon = document.createElement('span');
  colon.className = 'colon';
  colon.innerHTML = '<i></i><i></i>';
  clockEl.appendChild(colon);

  clockEl.appendChild(units.m1.el);
  clockEl.appendChild(units.m2.el);

  var secs = document.createElement('span');
  secs.className = 'secs';
  units.s1u = makeUnit();
  units.s2u = makeUnit();
  secs.appendChild(units.s1u.el);
  secs.appendChild(units.s2u.el);

  var periodEl = document.createElement('span');
  periodEl.className = 'period';
  periodEl.textContent = '';

  if (hour12) { clockEl.appendChild(periodEl); }
  if (showSeconds) { clockEl.appendChild(secs); }

  /* -------------------------------------------------------------
     Sizing — computed in px so no viewport-unit quirks on old iOS
     ------------------------------------------------------------- */

  /* Both languages are set in 喜脉体, the display face robodiag.cn titles with.
     Its figures advance 0.60 em against a Latin text face's 0.50 and its ink
     reaches 0.80 em, so 0.90h fills the plate with the advance still inside the
     card. */

  function sizeUnit(u, h) {
    var w = h * 0.58;
    var fs = Math.round(h * 0.90);
    var r = Math.max(3, Math.round(h * 0.035));
    var spans, i;

    u.el.style.width = w + 'px';
    u.el.style.height = h + 'px';
    u.el.style.webkitPerspective = Math.round(h * 10) + 'px';
    u.el.style.perspective = Math.round(h * 10) + 'px';
    u.el.style.margin = '0 ' + h * 0.016 + 'px';

    spans = u.el.getElementsByTagName('span');
    for (i = 0; i < spans.length; i++) {
      spans[i].style.fontSize = fs + 'px';
      spans[i].style.width = w + 'px';
      spans[i].style.height = h + 'px';
      spans[i].style.lineHeight = h + 'px';
      // bottom-facing facets show the lower half of the same glyph
      spans[i].style.marginTop = ((i === 1 || i === 3) ? (-h / 2) : 0) + 'px';
    }

    for (i = 0; i < 4; i++) {
      u.facets[i].style.borderRadius = (i === 0 || i === 2)
        ? r + 'px ' + r + 'px 0 0'
        : '0 0 ' + r + 'px ' + r + 'px';
    }
  }

  /* The rendered width of the line. scrollWidth alone under-reports it once the
     overflow spills off both ends of a centred line, so ask a Range for the
     real extent and fall back to scrollWidth on very old WebKit. */
  function metaLineWidth(metaEl) {
    var w = 0;
    try {
      var range = document.createRange();
      range.selectNodeContents(metaEl);
      var box = range.getBoundingClientRect();
      w = box ? box.width : 0;
    } catch (e) { w = 0; }
    if (!w) { w = metaEl.scrollWidth; }
    return w;
  }

  /* The line under the date is nowrap by design. 喜脉体 sets it wider than a
     text face would, so on a short screen it can run off both edges — the
     weather label alone can do it. Measure the rendered line and step the type
     down until it sits inside the padding: a smaller line still reads, a clipped
     index number does not.

     Always starts again from the size layout() chose, so an item that goes
     away (a failed quote, an expired note) gives the line its type back. */
  var metaPad = 20;
  var metaBasePx = 14;

  function fitMeta() {
    var metaEl = document.querySelector('.meta');
    if (!metaEl) { return; }
    var limit = metaEl.clientWidth - metaPad * 2;
    var px = Math.round(metaBasePx);
    var guard = 0;
    metaEl.style.fontSize = px + 'px';
    while (px > 11 && metaLineWidth(metaEl) > limit && guard < 24) {
      px -= 1;
      metaEl.style.fontSize = px + 'px';
      guard++;
    }
  }

  function layout() {
    var W = document.documentElement.clientWidth || window.innerWidth;
    var H = document.documentElement.clientHeight || window.innerHeight;
    var portrait = H > W;
    var pad = Math.max(6, Math.round(W * 0.02));
    var wrapEl = el('wrap');

    wrapEl.style.paddingLeft = pad + 'px';
    wrapEl.style.paddingRight = pad + 'px';

    /* Portrait stacks the seconds under the minutes: five cards across a narrow
       screen force the whole clock down to a third of the height, and on a mini
       that is the difference between a clock and a postage stamp. */
    var ratio = showSeconds ? (portrait ? 2.75 : 3.42) : 2.75;
    var maxH = H * (portrait ? 0.42 : 0.50);
    var h = Math.min((W - pad * 2) * 0.995 / ratio, maxH);
    if (h < 64) { h = 64; }

    var big = [units.h1, units.h2, units.m1, units.m2];
    var i;

    for (i = 0; i < big.length; i++) { sizeUnit(big[i], h); }

    if (showSeconds) {
      var sh = portrait ? h * 0.40 : h * 0.42;
      sizeUnit(units.s1u, sh);
      sizeUnit(units.s2u, sh);
      if (portrait) {
        secs.style.display = 'block';
        secs.style.marginLeft = '0';
        secs.style.marginTop = Math.round(h * 0.10) + 'px';
      } else {
        secs.style.display = 'inline-block';
        secs.style.marginTop = '0';
        secs.style.marginLeft = Math.round(h * 0.13) + 'px';
      }
    }

    var dot = Math.max(4, Math.round(h * 0.062));
    var dots = colon.getElementsByTagName('i');
    colon.style.width = Math.round(h * 0.22) + 'px';
    colon.style.height = Math.round(h) + 'px';
    for (i = 0; i < dots.length; i++) {
      dots[i].style.width = dot + 'px';
      dots[i].style.height = dot + 'px';
      dots[i].style.marginLeft = (-dot / 2) + 'px';
      dots[i].style.top = Math.round(h * (i === 0 ? 0.3 : 0.56)) + 'px';
    }

    /* Type scales with the cards rather than with the viewport width, so the
       date and the weather line stay in proportion with what they sit under.
       Both floors exist because at mini sizes this line stops being readable
       before it stops fitting. */
    var dateEl = el('date');
    var ruleEl = el('rule');
    var metaEl = document.querySelector('.meta');

    dateEl.style.fontSize = Math.max(18, Math.round(h * 0.125)) + 'px';
    dateEl.style.marginTop = Math.round(h * 0.16) + 'px';
    ruleEl.style.width = Math.round(h * 0.55) + 'px';
    ruleEl.style.marginTop = Math.round(h * 0.085) + 'px';
    metaEl.style.fontSize = Math.max(14, Math.round(h * 0.080)) + 'px';
    metaEl.style.marginTop = Math.round(h * 0.075) + 'px';
    metaPad = pad;
    metaBasePx = parseFloat(metaEl.style.fontSize) || 14;
    fitMeta();

    /* 喜脉体 is a display face: at a text face's small sizes it turns to mush,
       so the quiet line at the bottom keeps a larger floor. */
    var hintEl = el('hint');
    if (hintEl) {
      hintEl.style.fontSize = Math.max(17, Math.round(h * 0.058)) + 'px';
    }

    if (hour12) {
      periodEl.style.fontSize = Math.max(10, Math.round(h * 0.075)) + 'px';
      periodEl.style.marginLeft = Math.round(h * 0.05) + 'px';
      periodEl.style.marginBottom = Math.round(h * 0.045) + 'px';
    }

    /* Reset the anchors before measuring: a stale top or bottom from the last
       orientation changes the box and makes every measurement below lie. */
    var clockEl2 = el('clock');
    var infoEl = el('info');
    clockEl2.style.top = '0px';
    infoEl.style.top = '0px';
    infoEl.style.bottom = 'auto';

    var clockH = clockEl2.offsetHeight;
    var infoH = infoEl.offsetHeight;
    var bottomPad = Math.round(H * 0.085);
    var top = Math.round(H * (portrait ? 0.11 : 0.14));
    var gap = (H - bottomPad - infoH) - top - clockH;

    /* Anchor both ends while the gap still reads as deliberate spacing. On a
       tall portrait screen that same gap becomes a hole in the middle of the
       board, so past a fifth of the height the group closes up and centres. */
    if (gap > H * 0.20) {
      var groupGap = Math.round(H * 0.12);
      var groupTop = Math.round((H - (clockH + groupGap + infoH)) / 2 - H * 0.015);
      if (groupTop < 0) { groupTop = 0; }
      clockEl2.style.top = groupTop + 'px';
      infoEl.style.top = (groupTop + clockH + groupGap) + 'px';
    } else if (gap < 12) {
      var shift = Math.ceil((12 - gap) / 2);
      clockEl2.style.top = Math.max(0, top - shift) + 'px';
      infoEl.style.top = 'auto';
      infoEl.style.bottom = Math.max(0, bottomPad - shift) + 'px';
    } else {
      clockEl2.style.top = top + 'px';
      infoEl.style.top = 'auto';
      infoEl.style.bottom = bottomPad + 'px';
    }

  }

  /* -------------------------------------------------------------
     The tick
     ------------------------------------------------------------- */

  var lastMinute = -1;
  var lastSecond = -1;

  function tick(fresh) {
    var d = new Date();
    var hh = d.getHours();
    var period = '';

    if (hour12) {
      period = hh < 12 ? 'AM' : 'PM';
      hh = hh % 12;
      if (hh === 0) { hh = 12; }
    }

    var hs = pad(hh), ms = pad(d.getMinutes()), ss = pad(d.getSeconds());

    setUnit(units.h1, hs.charAt(0));
    setUnit(units.h2, hs.charAt(1));
    setUnit(units.m1, ms.charAt(0));
    setUnit(units.m2, ms.charAt(1));
    if (showSeconds) {
      setUnit(units.s1u, ss.charAt(0));
      setUnit(units.s2u, ss.charAt(1));
    }
    var second = d.getSeconds();
    if (lastSecond !== -1 && second !== lastSecond) { playTick(second); }
    lastSecond = second;

    if (hour12 && periodEl.textContent !== period) { periodEl.textContent = period; }

    var minute = d.getHours() * 60 + d.getMinutes();
    if (minute !== lastMinute || fresh) {
      lastMinute = minute;
      el('date').textContent = L.date(d);
      el('sr').textContent = hs + ':' + ms + ', ' + L.date(d);
      clockEl.setAttribute('aria-label', hs + ':' + ms);
      document.title = hs + ':' + ms;
    }
  }

  function loop() {
    tick(false);
    var wait = 1000 - new Date().getMilliseconds() + 15;
    if (wait < 15) { wait += 1000; }
    setTimeout(loop, wait);
  }

  /* -------------------------------------------------------------
     Weather — Open-Meteo, keyless, CORS-friendly
     ------------------------------------------------------------- */

  var GEO_KEY = 'flipclock.city';
  var haveWeather = false;

  /* The two readers share one XHR: getText hands back the body as it arrived,
     getJSON parses it. iOS 9 has no fetch(), and the quote endpoint answers
     with a JS assignment rather than JSON, so both are needed. */
  function getText(url, ok, fail) {
    var x = new XMLHttpRequest();
    var done = false;
    function finish(fn, arg) {
      if (done) { return; }
      done = true;
      fn(arg);
    }
    try {
      x.open('GET', url, true);
      x.onload = function () {
        if (x.status >= 200 && x.status < 300) { finish(ok, x.responseText); }
        else { finish(fail); }
      };
      x.onerror = function () { finish(fail); };
      x.timeout = 12000;
      x.ontimeout = function () { finish(fail); };
      x.send();
    } catch (e) {
      finish(fail);
    }
  }

  function getJSON(url, ok, fail) {
    getText(url, function (body) {
      var data;
      try { data = JSON.parse(body); } catch (e) { fail(); return; }
      ok(data);
    }, fail);
  }

  function showWeather(temp, code, isDay) {
    var row = WMO[code] || WMO[3];
    var icon = row[0];
    if (icon === 'clear' && !isDay) { icon = 'moon'; }
    if (icon === 'mostlysunny' && !isDay) { icon = 'moon'; }
    if (icon === 'partly' && !isDay) { icon = 'moon'; }

    el('wicon').innerHTML = iconSVG(icon);
    el('wtemp').textContent = Math.round(temp) + '°';
    el('wdesc').textContent = lang === 'zh' ? row[1] : row[2];
    show(el('weather'), true);
    haveWeather = true;
    updateSeps();
  }

  var wxRetry = null, geoRetry = null, weatherStarted = false;

  function retryWeather(lat, lon) {
    if (wxRetry) { return; }
    wxRetry = setTimeout(function () { wxRetry = null; loadWeather(lat, lon); }, 60000);
  }

  function loadWeather(lat, lon) {
    var unitParam = (pick('units', 'celsius') === 'fahrenheit') ? '&temperature_unit=fahrenheit' : '';
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
      '&current=temperature_2m,weather_code,is_day&timezone=auto' + unitParam;
    getJSON(url, function (data) {
      if (!data || !data.current) { retryWeather(lat, lon); return; }
      showWeather(num(data.current.temperature_2m), data.current.weather_code, num(data.current.is_day) !== 0);
    }, function () { retryWeather(lat, lon); });
  }

  function cachedCity(name, ok, fail) {
    var raw = null, parsed = null;
    try { raw = window.localStorage.getItem(GEO_KEY); } catch (e) { raw = null; }
    if (raw) {
      try { parsed = JSON.parse(raw); } catch (e) { parsed = null; }
      if (parsed && parsed.name === name &&
          Math.abs((new Date()).getTime() - parsed.t) < 30 * 86400000) {
        return ok(parsed.lat, parsed.lon);
      }
    }
    getJSON('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(name) +
      '&count=1&language=' + (lang === 'zh' ? 'zh' : 'en') + '&format=json', function (data) {
        if (!data || !data.results || !data.results.length) { fail(); return; }
        var r = data.results[0];
        try {
          window.localStorage.setItem(GEO_KEY, JSON.stringify({
            name: name, lat: r.latitude, lon: r.longitude, t: (new Date()).getTime()
          }));
        } catch (e) { /* private mode */ }
        ok(r.latitude, r.longitude);
      }, fail);
  }

  function refreshWeather() {
    var lat = pick('lat', null), lon = pick('lon', null), city = pick('city', '');
    if (lat && lon) { loadWeather(parseFloat(lat), parseFloat(lon)); return; }
    if (!city) {
      show(el('weather'), false);
      haveWeather = false;
      updateSeps();
      return;
    }
    cachedCity(String(city), function (la, lo) { loadWeather(la, lo); }, function () {
      // network hiccup or rate limit: try again in five minutes, quietly
      if (geoRetry) { return; }
      geoRetry = setTimeout(function () { geoRetry = null; refreshWeather(); }, 300000);
    });
  }

  function startWeather() {
    if (weatherStarted) { return; }
    weatherStarted = true;
    refreshWeather();
    setInterval(refreshWeather, Math.max(2, num(pick('weatherEvery', 15))) * 60000);
  }

  /* -------------------------------------------------------------
     Bilibili followers
     Bilibili refuses a browser read of its API (403 on any Origin), so a GitHub
     Action refreshes data/followers.json and this reads it from our own origin.
     ------------------------------------------------------------- */

  var haveFollowers = false;
  var haveIndex = false;

  function biliSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="3" y="7.6" width="18" height="12.4" rx="2.6"/>' +
      '<path d="M8.1 3.6l3.1 3.4M15.9 3.6l-3.1 3.4"/>' +
      '<circle cx="8.7" cy="13.7" r="1.05" fill="currentColor" stroke="none"/>' +
      '<circle cx="15.3" cy="13.7" r="1.05" fill="currentColor" stroke="none"/>' +
      '</svg>';
  }

  function shortCount(n) {
    if (lang === 'zh') {
      if (n >= 10000) { return (n / 10000).toFixed(1).replace(/\.0$/, '') + '万'; }
      return String(n);
    }
    if (n >= 1000000) { return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'; }
    if (n >= 10000) { return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'; }
    return String(n);
  }

  function showFollowers(n) {
    el('ficon').innerHTML = biliSVG();
    el('fcount').textContent = shortCount(n);
    el('flabel').textContent = lang === 'zh' ? '粉丝' : 'followers';
    show(el('followers'), true);
    haveFollowers = true;
    updateSeps();
  }

  /* One place decides where the dots go, so a gap never shows as a stray mark:
     weather · followers · index · note, and a dot appears before an item only
     if something visible came before it. */
  function updateSeps() {
    var present = [haveWeather, haveFollowers, haveIndex, !!el('note').textContent];
    var dots = [el('sep'), el('sep2'), el('sep3')];
    var earlier = false, i;
    for (i = 0; i < present.length; i++) {
      if (i > 0) { show(dots[i - 1], earlier && present[i]); }
      if (present[i]) { earlier = true; }
    }
    fitMeta();
  }

  function loadFollowers() {
    if (pick('showFollowers', true) === false) { return; }
    getJSON('data/followers.json?t=' + (new Date()).getTime(), function (d) {
      if (d && typeof d.follower === 'number' && d.follower >= 0) { showFollowers(d.follower); }
    }, function () { /* no file yet, or offline: the line just stays short */ });
    setTimeout(loadFollowers, Math.max(3, num(pick('followersEvery', 15))) * 60000);
  }

  /* -------------------------------------------------------------
     Shanghai Composite (上证指数)
     Tencent's quote endpoint answers with Access-Control-Allow-Origin: *, so
     the page reads it directly — no proxy, no key, no Action, and the number
     is as fresh as the last read. Shut, it keeps returning the last close,
     which is what a clock on a wall should show.
     ------------------------------------------------------------- */

  /* 09:30–11:30 and 13:00–15:00, Monday to Friday. A minute between reads keeps
     the tick alive during the session and is wasteful at three in the morning;
     the page only samples the clock's own day, which is the market's day here. */
  function marketOpen() {
    var d = new Date();
    var day = d.getDay();
    var m = d.getHours() * 60 + d.getMinutes();
    return day > 0 && day < 6 && ((m >= 570 && m <= 690) || (m >= 780 && m <= 900));
  }

  function paintIndex(price, change, pct) {
    el('qlabel').textContent = lang === 'zh' ? '上证指数' : 'SSE';
    el('qvalue').textContent = price.toFixed(2);
    el('qchange').textContent = (change > 0 ? '+' : (change < 0 ? '-' : '')) +
      Math.abs(pct).toFixed(2) + '%';
    /* Shanghai paints a rise red and a fall green; the colours sit at the
       line's own weight, so direction is legible across a room without the
       number shouting over the clock. */
    el('quote').className = 'quote' + (change > 0 ? ' up' : (change < 0 ? ' down' : ''));
    show(el('quote'), true);
    haveIndex = true;
    updateSeps();
  }

  function loadIndex() {
    if (pick('showIndex', true) === false) { return; }
    /* The body is a JS assignment around a tilde record:
         v_s_sh000001="1~上证指数~000001~3716.28~8.80~0.24~…";
       [3] is the index, [4] the point change, [5] the percentage. The &_ suffix
       is a cache-buster: without it Safari can answer from its own cache and
       leave yesterday's close on the wall. */
    var url = 'https://qt.gtimg.cn/q=s_sh000001&_=' + (new Date()).getTime();
    getText(url, function (body) {
      var m = /"([^"]*)"/.exec(body || '');
      if (!m) { return; }
      var f = m[1].split('~');
      if (f.length < 6) { return; }
      var price = parseFloat(f[3]), change = parseFloat(f[4]), pct = parseFloat(f[5]);
      if (!(price > 0) || isNaN(change) || isNaN(pct)) { return; }
      paintIndex(price, change, pct);
    }, function () { /* offline: the line just stays short */ });
    setTimeout(loadIndex, (marketOpen() ? 1 : Math.max(3, num(pick('indexEvery', 15)))) * 60000);
  }

  /* -------------------------------------------------------------
     The rotating note
     ------------------------------------------------------------- */

  function startNotes() {
    var notes = pick('notes', null);
    var noteEl = el('note');
    var i = 0;

    if (!notes || !notes.length) {
      noteEl.textContent = '';
      updateSeps();
      return;
    }

    function paint(first) {
      if (first) {
        noteEl.textContent = notes[0];
        noteEl.style.opacity = '1';
      } else {
        noteEl.style.opacity = '0';
        setTimeout(function () {
          noteEl.textContent = notes[i % notes.length];
          noteEl.style.opacity = '1';
        }, 1200);
      }
      updateSeps();
    }

    paint(true);

    if (notes.length > 1) {
      var mins = Math.max(1, num(pick('noteEvery', 30)));
      setInterval(function () {
        i = (i + 1) % notes.length;
        paint(false);
      }, mins * 60000);
    }
  }


  /* -------------------------------------------------------------
     Tick and tock — Web Audio, so the click lands on the second
     instead of whenever an <audio> element feels like starting.
     ------------------------------------------------------------- */

  /* Which recorded set to play. ?sound=wood on the URL overrides the config so a
     set can be tried on the clock itself without editing anything. */
  var SOUND_SETS = { flap: 1, wood: 1, sharp: 1, soft: 1 };
  var soundSet = (function () {
    var m = /[?&]sound=([a-z]+)/.exec(location.search);
    var want = m ? m[1] : String(pick('tickSoundSet', 'flap'));
    return SOUND_SETS[want] ? want : 'flap';
  })();

  var sound = {
    on: pick('tickSound', true) !== false,
    volume: Math.min(1, Math.max(0, num(pick('tickVolume', 0.45)))),
    ctx: null,
    buffers: {},
    loading: false,
    ready: false,
    fallback: null
  };

  /* iOS will not let a page make a sound until the user has touched it, and it
     wants the context created or resumed inside that touch. So nothing is
     created at load time unless the browser is already happy to run audio. */
  function audioCtx() {
    if (sound.ctx) { return sound.ctx; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { return null; }
    try { sound.ctx = new AC(); } catch (e) { sound.ctx = null; }
    return sound.ctx;
  }

  function loadClip(name) {
    var x = new XMLHttpRequest();
    x.open('GET', 'sounds/' + soundSet + '-' + name + '.wav?v=2', true);
    x.responseType = 'arraybuffer';
    x.onload = function () {
      if (!x.response) { return; }
      var got = function (buf) { if (buf && buf.duration) { sound.buffers[name] = buf; } };
      try {
        var maybe = sound.ctx.decodeAudioData(x.response, got, function () { });
        if (maybe && typeof maybe.then === 'function') { maybe.then(got); }
      } catch (e) {
        // some old builds only decode once the context is running
        setTimeout(function () { sound.loading = false; loadClips(); }, 800);
      }
    };
    x.send();
  }

  function loadClips() {
    if (sound.loading || !sound.ctx) { return; }
    sound.loading = true;
    loadClip('tick');
    loadClip('tock');
  }

  function confirmTick() {
    var tries = 0;
    var iv = setInterval(function () {
      if (sound.buffers.tick) { playTick(0); clearInterval(iv); }
      if (++tries > 40) { clearInterval(iv); }
    }, 100);
  }

  /* No Web Audio at all: two <audio> elements, primed inside the same gesture. */
  function fallbackArm() {
    if (sound.fallback) { return; }
    try {
      var a = new Audio('sounds/' + soundSet + '-tick.wav?v=2');
      var b = new Audio('sounds/' + soundSet + '-tock.wav?v=2');
      a.preload = 'auto'; b.preload = 'auto';
      a.muted = true; a.play(); a.pause(); a.muted = false;
      b.muted = true; b.play(); b.pause(); b.muted = false;
      sound.fallback = { tick: a, tock: b };
      hideHint();
    } catch (e) { }
  }

  function armSound() {
    if (!sound.on) { return; }
    var ctx = audioCtx();
    if (!ctx) { fallbackArm(); return; }

    function start() {
      sound.ready = true;
      loadClips();
      hideHint();
      confirmTick();
    }

    if (ctx.state === 'suspended' && ctx.resume) {
      var p = null;
      try { p = ctx.resume(); } catch (e) { p = null; }
      if (p && typeof p.then === 'function') { p.then(start, start); }
      else { setTimeout(start, 60); }
    } else if (!sound.ready) {
      start();
    }
  }

  function playTick(second) {
    if (!sound.on || document.hidden === true) { return; }
    var name = (second % 2 === 0) ? 'tick' : 'tock';

    if (sound.ctx && sound.buffers[name]) {
      try {
        var src = sound.ctx.createBufferSource();
        var gain = sound.ctx.createGain();
        src.buffer = sound.buffers[name];
        gain.gain.value = sound.volume;
        src.connect(gain);
        gain.connect(sound.ctx.destination);
        if (src.start) { src.start(0); }
        else if (src.noteOn) { src.noteOn(0); }
      } catch (e) { }
      return;
    }

    if (sound.fallback && sound.fallback[name]) {
      try {
        var a = sound.fallback[name];
        a.currentTime = 0;
        a.volume = sound.volume;
        a.play();
      } catch (e) { }
    }
  }

  /* A line that says so, until the first touch has actually armed audio. */
  var hintTimer = null;
  function showHint() {
    var h = el('hint');
    if (!h || !sound.on) { return; }
    h.textContent = L.tapHint;
    h.className = 'hint show';
    hintTimer = setTimeout(hideHint, 30000);
  }
  function hideHint() {
    var h = el('hint');
    if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }
    if (h) { h.className = 'hint'; }
  }

  /* -------------------------------------------------------------
     Night dim, drift, on-screen wake
     ------------------------------------------------------------- */

  var dimNow = -1;

  function applyDim() {
    var dim = el('dim');
    var amount = num(pick('nightDim', 0.7));
    var start = num(pick('nightStart', 23));
    var end = num(pick('nightEnd', 7));
    var h = (new Date()).getHours();
    var on;

    if (!amount) {
      if (dimNow !== 0) { dim.style.opacity = '0'; dimNow = 0; }
      return;
    }
    on = (start <= end) ? (h >= start && h < end) : (h >= start || h < end);
    var next = on ? amount : 0;
    if (next !== dimNow) { dim.style.opacity = String(next); dimNow = next; }
  }

  function startDrift() {
    if (pick('drift', true) === false) { return; }
    var wrap = el('wrap');
    var steps = [[3, -2], [-4, 3], [2, 4], [-3, -3], [4, 1], [-2, -4]];
    var n = 0;
    setInterval(function () {
      var s = steps[n % steps.length];
      n++;
      wrap.style.webkitTransform = 'translate3d(' + s[0] + 'px,' + s[1] + 'px,0)';
      wrap.style.transform = 'translate3d(' + s[0] + 'px,' + s[1] + 'px,0)';
    }, 4 * 60000);
  }

  function startKeepAwake() {
    if (pick('keepAwake', true) === false) { return; }
    var v = el('awake');
    if (!v) { return; }

    function play() {
      try {
        var p = v.play();
        if (p && typeof p.catch === 'function') { p.catch(function () { }); }
      } catch (e) { }
    }

    play();
    v.addEventListener('loadeddata', play, false);
    document.addEventListener('touchstart', play, false);
    document.addEventListener('click', play, false);
    setInterval(play, 5 * 60000);
  }

  /* -------------------------------------------------------------
     One face — charcoal cards, cream 喜脉体, both languages.
     ------------------------------------------------------------- */

  function applyFace() {
    document.body.className = 'theme-dark lang-' + lang;
    document.documentElement.lang = (lang === 'zh') ? 'zh-CN' : 'en';
    layout();
    tick(true);
    /* The shipped face is a webfont that may not have arrived yet; measure the
       date and meta lines again once it has, or they sit at fallback widths. */
    setTimeout(layout, 150);
    setTimeout(layout, 900);
  }

  /* -------------------------------------------------------------
     Boot
     ------------------------------------------------------------- */

  applyFace();

  layout();
  tick(true);
  applyDim();
  startWeather();
  loadFollowers();
  loadIndex();
  startNotes();
  startDrift();
  startKeepAwake();
  setTimeout(showHint, 1500);

  setTimeout(function () { tick(true); }, 400);
  loop();

  setInterval(applyDim, 60000);
  setTimeout(function () { applyDim(); }, 3000);

  var resizeTimer = null;
  function onResize() {
    if (resizeTimer) { clearTimeout(resizeTimer); }
    resizeTimer = setTimeout(function () { layout(); tick(true); }, 250);
  }
  /* The first layout runs before the shipped font has loaded, so its metrics are
     the fallback's. Lay out again once everything has arrived, otherwise the
     board sits a few pixels off until something forces a resize. */
  function settleLayout() {
    window.setTimeout(layout, 60);
    window.setTimeout(layout, 400);
    window.setTimeout(layout, 1200);
  }
  if (document.readyState === 'complete') { settleLayout(); }
  else { window.addEventListener('load', settleLayout, false); }

  window.addEventListener('resize', onResize, false);
  window.addEventListener('orientationchange', onResize, false);

  document.addEventListener('touchstart', armSound, false);
  document.addEventListener('mousedown', armSound, false);
  document.addEventListener('click', armSound, false);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden !== true) { tick(true); armSound(); applyDim(); }
  }, false);

  /* A hidden tab throttles timers; when it comes back, re-sync instantly. */
  window.addEventListener('pageshow', function () { tick(true); }, false);
  window.addEventListener('focus', function () { tick(true); }, false);

})();
