/* Shared behaviour for every Microbot page: menu, cookie consent, releases badge, small helpers. */
window.MB = (function () {
    var root = document.documentElement;
    if (/[?&]source=[^&]*launcher/i.test(location.search)) root.classList.add('mb-in-launcher');

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
        var s = document.createElement('script');
        s.src = (document.querySelector('link[href$="mb-theme.css"]').href).replace('mb-theme.css', 'releases/release.js');
        s.onload = function () {
            if (typeof releases === 'undefined') return;
            var week = 7 * 24 * 3600 * 1000;
            badge.hidden = !releases.some(function (r) { return Date.now() - new Date(r.date).getTime() <= week; });
            document.dispatchEvent(new Event('mb:releases'));
        };
        document.head.appendChild(s);
    }

    document.addEventListener('DOMContentLoaded', function () { menu(); cookies(); releasesBadge(); });
    return { el: el, countUp: countUp };
})();
