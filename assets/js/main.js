(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]; }); };

  /* Theme */
  var root = document.documentElement;
  var savedTheme = store.get("iwin-theme", null);
  if (savedTheme) root.setAttribute("data-theme", savedTheme);
  $$(".theme-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var dark = root.getAttribute("data-theme") === "dark" ||
        (!root.getAttribute("data-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
      var next = dark ? "light" : "dark";
      root.setAttribute("data-theme", next); store.set("iwin-theme", next);
    });
  });

  /* Menu */
  var menuBtn = $(".menu-btn"), nav = $(".nav");
  if (menuBtn && nav) menuBtn.addEventListener("click", function () {
    var open = nav.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", open);
  });

  $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* Cookie notice */
  var cookie = $(".cookie");
  if (cookie && !store.get("iwin-cookie", false)) {
    cookie.classList.add("show");
    $$("[data-cookie-ok]", cookie).forEach(function (b) {
      b.addEventListener("click", function () { store.set("iwin-cookie", true); cookie.classList.remove("show"); });
    });
  }

  /* Sticky mobile CTA */
  var sticky = $(".sticky-cta");
  if (sticky) window.addEventListener("scroll", function () {
    sticky.classList.toggle("show", window.scrollY > 700 && !store.get("iwin-subscribed", false));
  }, { passive: true });

  /* Exit-intent alert offer: desktop, once per session, never on form pages */
  var modal = $("#alert-modal");
  if (modal && !document.body.hasAttribute("data-no-exit")) {
    var shown = false;
    try { shown = sessionStorage.getItem("iwin-exit") === "1"; } catch (e) {}
    document.addEventListener("mouseout", function (e) {
      if (shown || e.relatedTarget || e.clientY > 10 || window.innerWidth < 981 || store.get("iwin-subscribed", false)) return;
      shown = true; try { sessionStorage.setItem("iwin-exit", "1"); } catch (e2) {}
      modal.classList.add("show"); var f = $("input[type=email]", modal); if (f) f.focus();
    });
    modal.addEventListener("click", function (e) { if (e.target === modal || e.target.classList.contains("modal-close")) modal.classList.remove("show"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") modal.classList.remove("show"); });
  }

  /* Forms: every form with data-iwin-form posts to the site inbox */
  $$("form[data-iwin-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = $(".form-status", form);
      var hp = $(".hp input", form);
      if (hp && hp.value) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) {
        if (k === "_hp") return;
        data[k] = data[k] ? data[k] + ", " + v : v;
      });
      data._subject = "iwin.in: " + (form.getAttribute("data-iwin-form") || "Form") + " submission";
      data._template = "table";
      data._captcha = "false";
      data.page = location.href;
      var btn = $("button[type=submit]", form); var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      fetch("https://formsubmit.co/ajax/" + window.IWIN_CONFIG.inbox(), {
        method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(data)
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok || res.j.success === "false" || res.j.success === false) throw new Error("send");
          status.className = "form-status ok";
          status.textContent = form.getAttribute("data-success") || "Sent. We'll reply within two working days.";
          form.reset();
          if (form.hasAttribute("data-subscribe")) store.set("iwin-subscribed", true);
          if (modal) modal.classList.remove("show");
          if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { form: form.getAttribute("data-iwin-form") });
        })
        .catch(function () {
          status.className = "form-status err";
          status.textContent = "Your message wasn't sent. Check your connection and try again, or use the contact page.";
        })
        .then(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
    });
  });

  /* Multi-step alert sign-up */
  $$(".stepper").forEach(function (st) {
    var steps = $$(".step", st), bar = $(".progress span", st), i = 0;
    var show = function (n) {
      steps.forEach(function (s, k) { s.classList.toggle("on", k === n); });
      if (bar) bar.style.width = ((n + 1) / steps.length * 100) + "%";
      i = n;
    };
    $$("[data-next]", st).forEach(function (b) {
      b.addEventListener("click", function () {
        var fields = $$("input,select,textarea", steps[i]).filter(function (f) { return !f.checkValidity(); });
        if (fields.length) { fields[0].reportValidity(); return; }
        if (steps[i].hasAttribute("data-need-pick") && !$$("input:checked", steps[i]).length) {
          var p = $(".pick-msg", steps[i]); if (p) p.textContent = "Pick at least one to continue."; return;
        }
        show(Math.min(i + 1, steps.length - 1));
      });
    });
    $$("[data-back]", st).forEach(function (b) { b.addEventListener("click", function () { show(Math.max(i - 1, 0)); }); });
    show(0);
  });

  /* Opportunity tickets */
  var saved = store.get("iwin-saved", []);
  function ticket(o) {
    var on = saved.indexOf(o.id) > -1;
    return '<article class="ticket">' +
      '<div class="ticket-main">' +
        '<div class="tags"><span class="tag cat">' + esc(o.cat) + '</span><span class="tag free">Free entry</span><span class="tag">' + esc(o.region) + '</span><span class="tag">' + esc(o.level) + '</span></div>' +
        '<h3><a href="' + esc(o.url) + '" target="_blank" rel="noopener">' + esc(o.title) + '</a></h3>' +
        '<p class="org">' + esc(o.org) + '</p>' +
        '<p class="prize">' + esc(o.prize) + '</p>' +
        '<div class="tags">' + o.tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join("") + '</div>' +
      '</div>' +
      '<div class="ticket-stub"><span class="stub-label">Entry window</span><span class="stub-big">' + esc(o.cycle) + '</span>' +
        '<button class="save-btn" type="button" data-save="' + esc(o.id) + '" aria-pressed="' + on + '">' + (on ? "Saved" : "Save") + '</button></div>' +
    '</article>';
  }
  function bindSave(scope) {
    $$("[data-save]", scope).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-save"), k = saved.indexOf(id);
        if (k > -1) saved.splice(k, 1); else saved.push(id);
        store.set("iwin-saved", saved);
        b.setAttribute("aria-pressed", k === -1); b.textContent = k === -1 ? "Saved" : "Save";
        var sc = $("#saved-count"); if (sc) sc.textContent = saved.length;
      });
    });
  }
  window.IWIN_renderTickets = function (el, items) { el.innerHTML = items.map(ticket).join(""); bindSave(el); };

  /* Static ticket lists: data-tickets="Scholarship,Fellowship" data-limit="6" */
  $$("[data-tickets]").forEach(function (el) {
    var cats = el.getAttribute("data-tickets").split(",");
    var lim = parseInt(el.getAttribute("data-limit") || "99", 10);
    var ids = el.getAttribute("data-ids");
    var items = (window.IWIN_DATA || []).filter(function (o) {
      return ids ? ids.split(",").indexOf(o.id) > -1 : (cats[0] === "*" || cats.indexOf(o.cat) > -1);
    }).slice(0, lim);
    window.IWIN_renderTickets(el, items);
  });

  /* Directory with filters */
  var dir = $("#directory");
  if (dir && window.IWIN_DATA) {
    var q = $("#f-q"), c = $("#f-cat"), l = $("#f-level"), r = $("#f-region"), s = $("#f-saved"), count = $("#result-count");
    window.IWIN_CATS.forEach(function (x) { c.insertAdjacentHTML("beforeend", '<option>' + esc(x) + '</option>'); });
    var params = new URLSearchParams(location.search);
    if (params.get("q")) q.value = params.get("q");
    if (params.get("cat")) c.value = params.get("cat");
    var run = function () {
      var term = q.value.trim().toLowerCase();
      var out = window.IWIN_DATA.filter(function (o) {
        var hay = (o.title + " " + o.org + " " + o.cat + " " + o.tags.join(" ") + " " + o.prize).toLowerCase();
        if (term && hay.indexOf(term) === -1) return false;
        if (c.value && o.cat !== c.value) return false;
        if (l.value === "school" && !/school/i.test(o.level)) return false;
        if (l.value === "college" && !/college|graduate|18\+/i.test(o.level)) return false;
        if (l.value === "pro" && !/professional|founder|adult|open/i.test(o.level)) return false;
        if (r.value && o.region !== r.value) return false;
        if (s.checked && saved.indexOf(o.id) === -1) return false;
        return true;
      });
      count.textContent = out.length + (out.length === 1 ? " opportunity" : " opportunities");
      if (!out.length) { dir.innerHTML = '<div class="empty"><p><strong>Nothing matches those filters.</strong></p><p class="muted">Clear a filter, or tell us what you\'re looking for and we\'ll add it.</p><a class="btn btn-line btn-sm" href="alerts.html">Get matched alerts</a></div>'; return; }
      window.IWIN_renderTickets(dir, out);
    };
    [q, c, l, r, s].forEach(function (x) { x.addEventListener("input", run); x.addEventListener("change", run); });
    var reset = $("#f-reset"); if (reset) reset.addEventListener("click", function () { q.value = ""; c.value = ""; l.value = ""; r.value = ""; s.checked = false; run(); });
    $("#saved-count").textContent = saved.length;
    run();
  }

  /* Hero finder */
  var hf = $("#hero-find");
  if (hf) hf.addEventListener("submit", function (e) {
    e.preventDefault(); var v = $("input", hf).value.trim();
    location.href = "opportunities.html" + (v ? "?q=" + encodeURIComponent(v) : "");
  });

  /* Video facades: data-yt="VIDEO_ID" */
  $$("[data-yt]").forEach(function (v) {
    var id = v.getAttribute("data-yt"), title = v.getAttribute("data-title") || "Video";
    v.innerHTML = '<button type="button" aria-label="Play: ' + esc(title) + '" style="background-image:url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)"><span>Play video</span></button>';
    $("button", v).addEventListener("click", function () {
      v.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0" title="' + esc(title) + '" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    });
  });

  /* Support tiers */
  var tiers = $$(".tier");
  if (tiers.length) {
    var amt = $("#support-amount");
    tiers.forEach(function (t) {
      t.addEventListener("click", function () {
        tiers.forEach(function (x) { x.setAttribute("aria-pressed", x === t); });
        if (amt) amt.value = t.getAttribute("data-amount");
      });
    });
    var pay = window.IWIN_CONFIG.payments, box = $("#pay-direct");
    if (box) {
      var links = [["upi", "Pay by UPI"], ["razorpay", "Pay with Razorpay"], ["paypal", "Pay with PayPal"], ["buymeacoffee", "Buy us a coffee"]]
        .filter(function (p) { return pay[p[0]]; })
        .map(function (p) { return '<a class="btn btn-gold" href="' + esc(pay[p[0]]) + '" target="_blank" rel="noopener">' + p[1] + '</a>'; });
      if (links.length) { box.innerHTML = '<p><strong>Pay directly:</strong></p><div class="chips">' + links.join("") + '</div>'; box.hidden = false; }
    }
  }

  /* Prize tax estimator (Income-tax Act 2025, s.393(3), from 1 April 2026) */
  var tax = $("#tax-form");
  if (tax) {
    var calc = function () {
      var v = parseFloat($("#tax-value").value) || 0, out = $("#tax-out");
      if (v <= 0) { out.innerHTML = '<p class="muted">Enter the cash value or fair market value of the prize.</p>'; return; }
      var base = 0.30, sur = v > 10000000 ? 0.15 : v > 5000000 ? 0.10 : 0;
      var t = v > 10000 ? v * base : 0, s = t * sur, cess = (t + s) * 0.04, total = t + s + cess;
      var f = function (n) { return "₹" + Math.round(n).toLocaleString("en-IN"); };
      out.innerHTML = v <= 10000 ?
        '<p><strong>No TDS is deducted</strong> on a single winning of ₹10,000 or less. The amount is still taxable at 30% when you file your return.</p>' :
        '<table><tr><th>Item</th><th>Amount</th></tr>' +
        '<tr><td>Tax at 30%</td><td>' + f(t) + '</td></tr>' +
        '<tr><td>Surcharge' + (sur ? " (" + sur * 100 + "%)" : "") + '</td><td>' + f(s) + '</td></tr>' +
        '<tr><td>Health & education cess (4%)</td><td>' + f(cess) + '</td></tr>' +
        '<tr><th>Estimated tax</th><th>' + f(total) + '</th></tr>' +
        '<tr><th>You keep</th><th>' + f(v - total) + '</th></tr></table>' +
        '<p class="muted">For prizes in kind, the tax must be paid before the prize is released. Surcharge here is a simplified estimate for an individual.</p>';
    };
    tax.addEventListener("input", calc); calc();
  }

  /* Scam checker */
  var sc = $("#scam-form");
  if (sc) sc.addEventListener("change", function () {
    var n = $$("input:checked", sc).length, out = $("#scam-out");
    out.className = "notice";
    out.innerHTML = n === 0 ? "No red flags ticked. Still confirm the organiser on its official website before sharing documents." :
      n === 1 ? "<strong>1 red flag.</strong> Slow down. Verify the organiser independently before you share anything." :
      "<strong>" + n + " red flags.</strong> Treat this as a likely scam. Don't pay, don't share OTPs or bank details, and report it at cybercrime.gov.in or by calling 1930.";
  });

  /* Deadline planner */
  var pf = $("#plan-form");
  if (pf) {
    var plans = store.get("iwin-plans", []), list = $("#plan-list");
    var draw = function () {
      if (!plans.length) { list.innerHTML = '<div class="empty"><p>No deadlines yet. Add the first one from an official page.</p></div>'; return; }
      plans.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      var today = new Date(); today.setHours(0, 0, 0, 0);
      list.innerHTML = plans.map(function (p, k) {
        var d = Math.round((new Date(p.date + "T00:00:00") - today) / 864e5);
        var lbl = d < 0 ? "Closed" : d === 0 ? "Today" : d + " days left";
        return '<div class="planner-row"><div><strong>' + esc(p.name) + '</strong><br><span class="muted">' + esc(p.date) + '</span></div>' +
          '<span class="days' + (d >= 0 && d <= 7 ? " soon" : "") + '">' + lbl + '</span>' +
          '<span><button class="btn btn-line btn-sm" type="button" data-ics="' + k + '">Add to calendar</button> <button class="btn btn-line btn-sm" type="button" data-del="' + k + '">Remove</button></span></div>';
      }).join("");
      $$("[data-del]", list).forEach(function (b) { b.onclick = function () { plans.splice(+b.getAttribute("data-del"), 1); store.set("iwin-plans", plans); draw(); }; });
      $$("[data-ics]", list).forEach(function (b) {
        b.onclick = function () {
          var p = plans[+b.getAttribute("data-ics")], d = p.date.replace(/-/g, "");
          var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//iwin.in//planner//EN", "BEGIN:VEVENT", "UID:" + Date.now() + "@iwin.in",
            "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z", "DTSTART;VALUE=DATE:" + d,
            "SUMMARY:Deadline: " + p.name.replace(/[,;]/g, " "), "BEGIN:VALARM", "TRIGGER:-P3D", "ACTION:DISPLAY", "DESCRIPTION:Deadline in 3 days", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
          var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
          a.download = "deadline.ics"; a.click();
        };
      });
    };
    pf.addEventListener("submit", function (e) {
      e.preventDefault(); plans.push({ name: $("#plan-name").value.trim(), date: $("#plan-date").value }); store.set("iwin-plans", plans); pf.reset(); draw();
    });
    draw();
  }
})();
