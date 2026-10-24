(function () {
    var script = document.currentScript;
    var now = new Date();
    var month = now.getMonth();
    var day = now.getDate();
    var inSeason = (month === 9 && day >= 20) || (month === 10 && day === 1);
    if (!inSeason && !/[?&]halloween(=|&|$)/.test(window.location.search)) {
        return;
    }

    var base = script ? script.src.replace(/microbot\/halloween\/halloween\.js(\?.*)?$/, '') : '';
    var pumpkin = base + 'images/halloween/pumpkin.svg';
    var bat = base + 'images/halloween/bat.svg';
    document.documentElement.classList.add('is-halloween');

    var web = '<svg class="hw-web" viewBox="0 0 120 120" aria-hidden="true">' +
        '<g fill="none" stroke="currentColor" stroke-width="0.8">' +
        '<path d="M0 0 L120 6 M0 0 L110 46 M0 0 L84 84 M0 0 L46 110 M0 0 L6 120"/>' +
        '<path d="M24 1 Q20 10 22 9 Q16 16 19 19 Q10 20 9 22 Q4 22 1 24"/>' +
        '<path d="M50 3 Q42 20 45 19 Q32 30 38 38 Q24 40 19 45 Q12 46 3 50"/>' +
        '<path d="M78 4 Q66 30 70 29 Q50 46 57 57 Q38 58 29 70 Q22 68 4 78"/>' +
        '<path d="M106 5 Q90 40 95 39 Q70 62 77 77 Q54 76 39 95 Q30 92 5 106"/>' +
        '</g></svg>';

    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function img(src, className) {
        var el = document.createElement('img');
        el.src = src;
        el.alt = '';
        el.className = className;
        el.setAttribute('aria-hidden', 'true');
        return el;
    }

    ready(function () {
        document.querySelectorAll('.c-nav__logo').forEach(function (logo) {
            logo.src = base + 'images/halloween/logo-halloween.png';
        });

        var bar = document.querySelector('.c-events-block .container > div:first-child');
        if (bar && !bar.textContent.trim()) {
            bar.className = 'hw-greeting';
            bar.appendChild(img(pumpkin, 'hw-greeting-icon'));
            var text = document.createElement('span');
            text.textContent = 'Happy Halloween from the Microbot team!';
            bar.appendChild(text);
        }

        var hero = document.querySelector('.c-main-header, .rn-index-hero, .rn-hero, .plugins-header');
        if (!hero) {
            return;
        }
        hero.classList.add('hw-host');
        var sky = document.createElement('div');
        sky.className = 'hw-sky';
        sky.setAttribute('aria-hidden', 'true');
        sky.innerHTML = web;
        for (var i = 1; i <= 5; i++) {
            sky.appendChild(img(bat, 'hw-bat hw-bat-' + i));
        }
        if (hero.classList.contains('c-main-header')) {
            sky.appendChild(img(pumpkin, 'hw-pumpkin hw-pumpkin-small'));
            sky.appendChild(img(pumpkin, 'hw-pumpkin hw-pumpkin-large'));
        }
        hero.insertBefore(sky, hero.firstChild);
    });
})();
