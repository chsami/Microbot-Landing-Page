/* Shared behaviour for every Microbot page: menu, cookie consent, releases badge, small helpers. */
window.MB = (function () {
    var root = document.documentElement;
    // Only the launcher's first URL has the flag, so remember it for the rest of this tab's visit.
    var inLauncher = /[?&]source=[^&]*launcher/i.test(location.search);
    try {
        if (inLauncher) sessionStorage.setItem('mb-launcher', '1');
        else inLauncher = sessionStorage.getItem('mb-launcher') === '1';
    } catch (e) {}
    if (inLauncher) root.classList.add('mb-in-launcher');

    function el(tag, className, text) {
        var n = document.createElement(tag);
        if (className) n.className = className;
        if (text !== undefined) n.textContent = text;
        return n;
    }

    function countUp(node, end) {
        if (!node) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { node.textContent = end.toLocaleString('en-US'); return; }
        var t0 = null;
        requestAnimationFrame(function step(t) {
            if (t0 === null) t0 = t;
            var p = Math.min((t - t0) / 1000, 1);
            node.textContent = Math.floor(end * p).toLocaleString('en-US');
            if (p < 1) requestAnimationFrame(step);
        });
    }

    function isNewRelease(date) {
        return Date.now() - new Date(date).getTime() < 7 * 24 * 3600 * 1000;
    }

    // "2.6.51 Release - Headline" entries have a summary in content; older entries have only the content.
    function releaseText(r) {
        var titled = r.title.includes(' - ');
        return { headline: titled ? r.title.split(' - ').slice(1).join(' - ') : r.content, summary: titled ? r.content : '' };
    }

    // The Hub list is written by the community: one malformed entry must not take the whole list down.
    function cleanPlugins(list) {
        function text(v) { return v === undefined || v === null ? '' : String(v); }
        function texts(v) { return Array.isArray(v) ? v.map(text) : []; }
        return list.filter(function (p) { return p && !p.disable; }).map(function (p) {
            return Object.assign({}, p, {
                name: text(p.name), internalName: text(p.internalName), description: text(p.description), version: text(p.version),
                authors: texts(p.authors), tags: texts(p.tags), cardUrl: /^https?:\/\//i.test(text(p.cardUrl)) ? p.cardUrl : ''
            });
        });
    }

    // Install counts are a nice-to-have: after 3 seconds or on any failure, carry on without them.
    function pluginInstalls(names) {
        return Promise.resolve().then(function () {
            return fetch('https://microbot.cloud/api/PluginTelemetry/plugins-total-installs', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ PluginNames: names }), signal: AbortSignal.timeout(3000)
            });
        }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
            var installs = {};
            rows.forEach(function (d) { installs[d.pluginName] = d.totalInstalls; });
            return installs;
        }).catch(function () { return {}; });
    }

    function menu() {
        var btn = document.querySelector('.mb-menu');
        var nav = document.querySelector('.c-nav');
        if (!btn || !nav) return;
        btn.addEventListener('click', function () {
            var open = nav.dataset.open !== 'true';
            nav.dataset.open = String(open);
            btn.setAttribute('aria-expanded', String(open));
        });
    }

    function cookies() {
        var banner = document.getElementById('cookie-banner');
        if (!banner) return;
        var choice = null;
        try { choice = localStorage.getItem('cookies-consent'); } catch (e) {}
        if (choice === 'accepted') analytics();
        if (!choice && !root.classList.contains('mb-in-launcher')) banner.style.display = 'block';
        function pick(value) {
            try { localStorage.setItem('cookies-consent', value); } catch (e) {}
            banner.style.display = 'none';
            if (value === 'accepted') analytics();
        }
        var yes = document.getElementById('accept-cookies'), no = document.getElementById('decline-cookies');
        if (yes) yes.addEventListener('click', function () { pick('accepted'); });
        if (no) no.addEventListener('click', function () { pick('declined'); });
    }

    function analytics() {
        if (window.gtag) return;
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=G-0CEWCTWC8Q';
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { dataLayer.push(arguments); };
        gtag('js', new Date());
        gtag('config', 'G-0CEWCTWC8Q');
    }

    // NEW next to Releases when a release is under 7 days old (data: microbot/releases/release.js -> `releases`).
    // Fires `mb:releases` on document once `releases` is loaded (the home page's latest-release card uses it).
    function releasesBadge() {
        var badge = document.getElementById('releases-badge');
        if (!badge) return;
        function ready() {
            if (typeof releases === 'undefined') return;
            badge.hidden = !releases.some(function (r) { return isNewRelease(r.date); });
            document.dispatchEvent(new Event('mb:releases'));
        }
        // releases.html already loads release.js; its top-level const can't be declared twice.
        if (typeof releases !== 'undefined') return ready();
        var s = document.createElement('script');
        s.src = (document.querySelector('link[href$="mb-theme.css"]').href).replace('mb-theme.css', 'releases/release.js');
        s.onload = ready;
        document.head.appendChild(s);
    }

    document.addEventListener('DOMContentLoaded', function () { menu(); cookies(); releasesBadge(); });
    return { el: el, countUp: countUp, isNewRelease: isNewRelease, releaseText: releaseText, cleanPlugins: cleanPlugins, pluginInstalls: pluginInstalls };
})();
