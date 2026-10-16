(function () {
  "use strict";
  var box = document.getElementById("quiz");
  if (!box) return;
  /* Question bank: general knowledge and competition basics. [question, [options], index of answer, explanation] */
  var bank = [
    ["Which Indian mission made India the first country to land near the Moon's south pole?", ["Chandrayaan-2", "Chandrayaan-3", "Mangalyaan", "Aditya-L1"], 1, "Chandrayaan-3's Vikram lander touched down on 23 August 2023."],
    ["Which spacecraft is India's first dedicated solar observatory mission?", ["Aditya-L1", "Astrosat", "Gaganyaan", "NISAR"], 0, "Aditya-L1 studies the Sun from the L1 Lagrange point."],
    ["Who was the first Indian to win an individual Olympic gold medal?", ["Neeraj Chopra", "Abhinav Bindra", "P. V. Sindhu", "Leander Paes"], 1, "Abhinav Bindra won the 10 m air rifle at Beijing 2008."],
    ["In which year did India adopt its Constitution?", ["1947", "1949", "1950", "1952"], 1, "It was adopted on 26 November 1949 and came into force on 26 January 1950."],
    ["What is the chemical symbol for gold?", ["Go", "Gd", "Au", "Ag"], 2, "Au comes from the Latin word aurum."],
    ["Which planet has the most known moons as of the mid-2020s?", ["Jupiter", "Saturn", "Uranus", "Neptune"], 1, "Saturn overtook Jupiter after a large batch of new moons was confirmed in 2023 and 2025."],
    ["Who wrote 'Gitanjali', which won the Nobel Prize in Literature in 1913?", ["Sarojini Naidu", "Rabindranath Tagore", "R. K. Narayan", "Premchand"], 1, "Tagore was the first non-European Nobel laureate in literature."],
    ["What does 'GSoC' stand for in the coding world?", ["Global Society of Coders", "Google Summer of Code", "GitHub Source of Code", "Grand Series of Contests"], 1, "Google Summer of Code pays contributors to work on open-source projects."],
    ["How many players are on each team in an ICPC contest?", ["1", "2", "3", "5"], 2, "ICPC teams are three students sharing one computer."],
    ["Which Indian scientist won the 1930 Nobel Prize in Physics?", ["Homi Bhabha", "C. V. Raman", "S. N. Bose", "Meghnad Saha"], 1, "Raman won for his work on the scattering of light."],
    ["What is the largest desert in India?", ["Thar", "Rann of Kutch", "Cold Desert of Ladakh", "Deccan"], 0, "The Thar Desert lies mostly in Rajasthan."],
    ["Which organ in the human body produces insulin?", ["Liver", "Kidney", "Pancreas", "Spleen"], 2, "Beta cells in the pancreas produce insulin."],
    ["Which is the longest river flowing entirely within India?", ["Yamuna", "Godavari", "Ganga", "Krishna"], 2, "The Ganga is the longest river within India; the Godavari is the longest in peninsular India."],
    ["What is the binary representation of the number 10?", ["1010", "1001", "1100", "0110"], 0, "8 + 2 = 10, so 1010."],
    ["Which Indian city is known as the 'Silicon Valley of India'?", ["Hyderabad", "Pune", "Bengaluru", "Chennai"], 2, "Bengaluru hosts many of India's largest tech companies."],
    ["The Fields Medal is awarded in which subject?", ["Physics", "Mathematics", "Chemistry", "Economics"], 1, "It's awarded every four years to mathematicians under 40."],
    ["Who is known as the 'Missile Man of India'?", ["Vikram Sarabhai", "A. P. J. Abdul Kalam", "Satish Dhawan", "K. Sivan"], 1, "Dr Kalam led India's missile development programmes."],
    ["Which gas makes up most of Earth's atmosphere?", ["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"], 2, "Nitrogen is about 78% of the atmosphere."],
    ["How many bits are in one byte?", ["4", "8", "16", "32"], 1, "One byte is eight bits."],
    ["Which Indian state has the longest coastline?", ["Tamil Nadu", "Andhra Pradesh", "Gujarat", "Maharashtra"], 2, "Gujarat has the longest mainland coastline of any Indian state."],
    ["What is the national aquatic animal of India?", ["Olive ridley turtle", "Gangetic river dolphin", "Dugong", "Mahseer"], 1, "The Gangetic river dolphin was declared national aquatic animal in 2009."],
    ["Which classical dance form originates from Kerala?", ["Kathak", "Kathakali", "Odissi", "Manipuri"], 1, "Kathakali is a story-play dance from Kerala."],
    ["Who painted the Mona Lisa?", ["Michelangelo", "Raphael", "Leonardo da Vinci", "Rembrandt"], 2, "Leonardo da Vinci painted it in the early 1500s."],
    ["What is the speed of light in a vacuum, approximately?", ["3 × 10^5 m/s", "3 × 10^8 m/s", "3 × 10^10 m/s", "3 × 10^6 m/s"], 1, "About 299,792 km per second."],
    ["Which Mughal emperor built the Taj Mahal?", ["Akbar", "Jahangir", "Shah Jahan", "Aurangzeb"], 2, "Shah Jahan built it in memory of Mumtaz Mahal."],
    ["Which programming language is most associated with the pandas data library?", ["Java", "Python", "C++", "Ruby"], 1, "pandas is a Python library for data analysis."],
    ["The Dronacharya Award honours excellence in what?", ["Sports coaching", "Teaching science", "Film direction", "Literature"], 0, "It recognises outstanding sports coaches."],
    ["What is the smallest prime number?", ["0", "1", "2", "3"], 2, "2 is the only even prime."],
    ["Which Indian state is the largest by area?", ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Uttar Pradesh"], 2, "Rajasthan is the largest state by area."],
    ["What does 'UPI' stand for in Indian payments?", ["Universal Payment Index", "Unified Payments Interface", "United Pay India", "Unique Payment ID"], 1, "UPI was launched by NPCI in 2016."]
  ];
  var N = 10, order = [], i = 0, score = 0;
  var qEl = box.querySelector(".quiz-q"), opts = box.querySelector(".quiz-opts"), meta = box.querySelector(".quiz-meta"), note = box.querySelector(".quiz-note"), next = box.querySelector(".quiz-next");
  function shuffle(a) { for (var k = a.length - 1; k > 0; k--) { var j = Math.floor(Math.random() * (k + 1)); var t = a[k]; a[k] = a[j]; a[j] = t; } return a; }
  function start() { order = shuffle(bank.map(function (_, k) { return k; })).slice(0, N); i = 0; score = 0; show(); }
  function show() {
    var q = bank[order[i]];
    meta.textContent = "Question " + (i + 1) + " of " + N + "  |  Score " + score;
    qEl.textContent = q[0]; note.textContent = ""; next.hidden = true;
    opts.innerHTML = "";
    q[1].forEach(function (o, k) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = o;
      b.addEventListener("click", function () { pick(k, b); });
      opts.appendChild(b);
    });
  }
  function pick(k, b) {
    var q = bank[order[i]], btns = opts.querySelectorAll("button");
    btns.forEach(function (x) { x.disabled = true; });
    btns[q[2]].classList.add("right");
    if (k === q[2]) { score++; note.textContent = "Correct. " + q[3]; } else { b.classList.add("wrong"); note.textContent = "Not this one. " + q[3]; }
    meta.textContent = "Question " + (i + 1) + " of " + N + "  |  Score " + score;
    next.hidden = false; next.textContent = i === N - 1 ? "See result" : "Next question"; next.focus();
  }
  var done = false;
  next.addEventListener("click", function () {
    if (done) { done = false; start(); return; }
    if (i < N - 1) { i++; show(); return; }
    done = true;
    var best = 0; try { best = parseInt(localStorage.getItem("iwin-quiz-best") || "0", 10); if (score > best) localStorage.setItem("iwin-quiz-best", score); } catch (e) {}
    qEl.textContent = "You scored " + score + " out of " + N + ".";
    opts.innerHTML = ""; meta.textContent = "Personal best: " + Math.max(best, score) + " / " + N;
    note.innerHTML = score >= 8 ? "Strong result. You're ready for live quiz contests on MyGov and Unstop." : "Play again for a fresh set of questions.";
    next.textContent = "Play again";
  });
  start();
})();
