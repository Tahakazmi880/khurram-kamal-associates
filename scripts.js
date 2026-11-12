// Khurram Kamal & Associates - shared scripts (all handlers guarded per page)
(function () {
  // Mobile menu toggle
  var menuBtn = document.getElementById('menuBtn');
  var mainNav = document.getElementById('mainNav');
  if (menuBtn && mainNav) {
    menuBtn.addEventListener('click', function () {
      var open = mainNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    mainNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mainNav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
  // Word-by-word split for section headings
  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    var i = 0;
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
        var s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = part;
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });
  }
  document.querySelectorAll('.sec-head h2').forEach(splitWords);
  // Scroll reveal
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('section .sec-head, .area, .lawyer, .step, .why div, .faq details, .acc details, .serve div, .court, .case, .contact-grid > *, footer .wrap').forEach(function (el) {
    el.classList.add('reveal');
    var sibs = Array.from(el.parentNode.children).filter(function (c) { return c.classList && c.classList.contains('reveal'); });
    el.style.setProperty('--rd', Math.min(sibs.length, 8) * 60 + 'ms');
    io.observe(el);
  });
  // Failsafe: never leave on-screen content hidden
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.visible), .sec-head:not(.visible)').forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add('visible');
    });
  }, 2500);
  // Animated counters (skip the year 2016)
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; cio.unobserve(e.target);
      var el = e.target, raw = el.textContent.trim();
      if (raw === '2016') return;
      var target = parseInt(raw, 10), suffix = raw.replace(/[0-9]/g, '');
      var t0 = performance.now(), dur = 1400;
      (function tick(t) {
        var p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick); else el.classList.add('pop');
      })(t0);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat .num').forEach(function (c) { cio.observe(c); });
  // Header shadow on scroll
  addEventListener('scroll', function () {
    var h = document.querySelector('header');
    if (h) h.classList.toggle('scrolled', scrollY > 10);
  }, { passive: true });
  // Practice-area search (practice page only)
  var searchForm = document.getElementById('searchForm');
  var input = document.getElementById('areaSearch');
  var noResults = document.getElementById('noResults');
  if (searchForm && input && noResults) {
    var cards = document.querySelectorAll('#areas .area');
    function runSearch(q) {
      q = q.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var hit = !q || c.dataset.search.includes(q);
        c.style.display = hit ? '' : 'none';
        if (hit) shown++;
      });
      noResults.style.display = shown === 0 ? 'block' : 'none';
      document.querySelectorAll('#chips .chip').forEach(function (ch) {
        ch.classList.toggle('active', ch.dataset.q.toLowerCase() === q);
      });
    }
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      runSearch(input.value);
      document.getElementById('practice').scrollIntoView({ behavior: 'smooth' });
    });
    input.addEventListener('input', function () { runSearch(input.value); });
    document.querySelectorAll('#chips .chip').forEach(function (ch) {
      ch.addEventListener('click', function () {
        input.value = ch.dataset.q === 'All' ? '' : ch.dataset.q;
        runSearch(input.value);
        document.getElementById('practice').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }
  // Contact form -> WhatsApp (contact page only)
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('f-name').value.trim();
      var phone = document.getElementById('f-phone').value.trim();
      var email = document.getElementById('f-email').value.trim();
      var area = document.getElementById('f-area').value;
      var msg = document.getElementById('f-msg').value.trim();
      var text = encodeURIComponent('New Website Enquiry\n\nName: ' + name + '\nPhone: ' + phone + '\nEmail: ' + email + '\nPractice Area: ' + area + '\n\nMessage:\n' + msg);
      window.open('https://wa.me/923456976866?text=' + text, '_blank');
      document.getElementById('formNote').textContent = 'WhatsApp opened with your message, please press Send there to deliver it to the firm.';
    });
  }
  // Booking form -> WhatsApp (booking page only)
  var bookForm = document.getElementById('bookForm');
  if (bookForm) {
    var lawyerSel = document.getElementById('b-lawyer');
    var wanted = new URLSearchParams(location.search).get('lawyer');
    if (wanted && lawyerSel) {
      Array.from(lawyerSel.options).forEach(function (o) { if (o.value === wanted) lawyerSel.value = wanted; });
    }
    bookForm.addEventListener('submit', function (e) {
      e.preventDefault();
      function v(id) { var n = document.getElementById(id); return n ? n.value.trim() : ''; }
      var lines = 'New Consultation Booking\n\nName: ' + v('b-name') +
        '\nPhone: ' + v('b-phone') +
        '\nEmail: ' + (v('b-email') || 'Not given') +
        '\nAdvocate: ' + v('b-lawyer') +
        '\nPractice Area: ' + v('b-area') +
        '\nPreferred Date: ' + (v('b-date') || 'Not specified') +
        '\nPreferred Time: ' + v('b-time') +
        '\n\nMatter Details:\n' + v('b-msg');
      window.open('https://wa.me/923456976866?text=' + encodeURIComponent(lines), '_blank');
      var note = document.getElementById('bookNote');
      if (note) note.textContent = 'WhatsApp opened with your booking details, please press Send there. The firm will confirm your consultation time.';
    });
  }
})();
