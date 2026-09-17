/* Shared, privacy-minimized Cupids analytics. Keep copies in the three customer sites identical. */
(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else factory(root, document);
})(typeof window !== 'undefined' ? window : null, function (win, doc) {
  'use strict';
  if (win.CupidsAnalytics) return win.CupidsAnalytics;
  var ID = 'G-Z7RBR6PTY0';
  var OWNED = ['links-three-olive.vercel.app', 'cupids-denwa.vercel.app',
    'cupids-seven.vercel.app', 'cupids-chat.vercel.app'];
  var SOURCES = ['instagram', 'tiktok', 'youtube', 'line', 'x', 'facebook',
    'threads', 'google', 'port', 'referral', 'direct', 'internal', 'test'];
  var here = new URL(win.location.href);
  var testMode = here.searchParams.get('cupids_analytics_test') === '1';
  var enabled = OWNED.indexOf(here.hostname) !== -1 && !testMode;
  var storageKey = 'cupids_traffic_v1';
  var now = Date.now();
  function sourceName(raw) {
    var v = String(raw || '').toLowerCase();
    var aliases = {ig:'instagram', insta:'instagram', twitter:'x', 't.co':'x',
      yt:'youtube', fb:'facebook'};
    v = aliases[v] || v;
    return SOURCES.indexOf(v) !== -1 ? v : null;
  }
  function refSource(raw) {
    try {
      var h = new URL(raw).hostname.toLowerCase();
      if (OWNED.indexOf(h) !== -1) return 'internal';
      var domains = {'instagram.com':'instagram', 'tiktok.com':'tiktok',
        'youtube.com':'youtube', 'youtu.be':'youtube', 'line.me':'line', 'lin.ee':'line',
        'x.com':'x', 't.co':'x', 'twitter.com':'x', 'facebook.com':'facebook',
        'threads.net':'threads', 'threads.com':'threads', 'google.com':'google',
        'google.co.jp':'google', 'online.port-app.jp':'port'};
      for (var d in domains) if (h === d || h.endsWith('.' + d)) return domains[d];
      return 'referral';
    } catch (_) { return 'direct'; }
  }
  function savedSource() {
    try {
      var saved = JSON.parse(win.sessionStorage.getItem(storageKey) || 'null');
      return saved && now - saved.at >= 0 && now - saved.at < 1800000 ? sourceName(saved.source) : null;
    } catch (_) { return null; }
  }
  var ref = refSource(doc.referrer);
  // Only allowlisted source labels cross domains; never copy customer or conversation identifiers.
  var source = sourceName(here.searchParams.get('utm_source'));
  if (!source && ref === 'internal') source = sourceName(here.searchParams.get('cp_source'));
  if (!source && (ref === 'direct' || ref === 'internal')) source = savedSource();
  source = source || ref;
  try { if (!testMode) win.sessionStorage.setItem(storageKey, JSON.stringify({source:source, at:now})); } catch (_) {}

  function siteName(h) {
    return {'links-three-olive.vercel.app':'links', 'cupids-denwa.vercel.app':'phone',
      'cupids-seven.vercel.app':'chat100', 'cupids-chat.vercel.app':'chat_text'}[h] || 'other';
  }
  var site = siteName(here.hostname);
  var titles = {links:'みなみのリンク集', phone:'キューピッズ 電話鑑定',
    chat100:'キューピッズ 100文字チャット', chat_text:'キューピッズ 文字数チャット', other:'キューピッズ'};
  var safeUrl = here.origin + here.pathname;
  // Unknown campaign text may contain personal data. Send only the fixed SNS labels.
  if (sourceName(here.searchParams.get('utm_source'))) {
    safeUrl += '?utm_source=' + source + '&utm_medium=social&utm_campaign=profile';
  }
  var safeRef = '';
  try { safeRef = new URL(doc.referrer).origin + '/'; } catch (_) {}
  win.dataLayer = win.dataLayer || [];
  win.gtag = win.gtag || function () { win.dataLayer.push(arguments); };
  var base = {send_to:ID, traffic_source:source, source_site:site,
    page_location:safeUrl, page_referrer:safeRef, page_title:titles[site]};
  function track(name, service) {
    try {
      if (!['traffic_visit','service_select','purchase_link_click','consultation_submit','call_connected'].includes(name)) return;
      if (service && !['phone','chat100','chat_text','mail','points','goods','digital','affiliate','social'].includes(service)) return;
      var params = Object.assign({}, base);
      if (service) params.service_type = service;
      if (enabled) win.gtag('event', name, params);
      if (testMode) {
        var events = JSON.parse(doc.documentElement.getAttribute('data-cupids-test-events') || '[]');
        events.push({event:name, params:params});
        doc.documentElement.setAttribute('data-cupids-test-events', JSON.stringify(events));
      }
    } catch (_) { /* Measurement must never interrupt a payment, message or call. */ }
  }
  function destination(raw) {
    try {
      var u = new URL(raw, here.href);
      if (u.protocol !== 'https:') return null;
      var owned = siteName(u.hostname);
      if (owned !== 'other' && owned !== 'links') return owned;
      if (u.hostname === 'qpizzu.stores.jp') return 'points';
      if (u.hostname === 'minamisan.stores.jp') return u.pathname === '/items/671e3d14dbcf2501d843030c' ? 'mail' : 'digital';
      if (['marjoly.booth.pm','marjoly.base.shop'].includes(u.hostname)) return 'goods';
      if (u.hostname === 'px.a8.net') return 'affiliate';
      var social = refSource(u.href);
      return ['instagram','tiktok','youtube','line','x','facebook','threads'].includes(social) ? 'social' : null;
    } catch (_) { return null; }
  }
  function decorate(anchor) {
    try {
      var u = new URL(anchor.href, here.href);
      if (u.protocol === 'https:' && OWNED.includes(u.hostname) && u.hostname !== here.hostname) {
        u.searchParams.set('cp_source', source);
        anchor.href = u.href;
      }
    } catch (_) {}
  }
  function onClick(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    var a = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!a) return;
    decorate(a);
    var service = destination(a.href);
    if (!service) return;
    // In-site navigation is not another service choice. Outbound points links are not purchases.
    if (new URL(a.href, here.href).hostname === here.hostname) return;
    track(service === 'points' ? 'purchase_link_click' : 'service_select', service);
  }
  var api = {track:track, destination:destination, source:source, measurementId:ID};
  win.CupidsAnalytics = api;
  try {
    if (enabled) {
      win.gtag('set', 'linker', {domains:OWNED, accept_incoming:true});
      win.gtag('js', new Date());
      win.gtag('config', ID, Object.assign({}, base, {
        send_page_view:true, allow_google_signals:false, allow_ad_personalization_signals:false
      }));
      var script = doc.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
      doc.head.appendChild(script);
    }
    doc.addEventListener('click', onClick, true);
    doc.addEventListener('auxclick', onClick, true);
    track('traffic_visit');
  } catch (_) {}
  return api;
});
