document.addEventListener("DOMContentLoaded", () => {
  // Prefer an available English male-sounding voice. Browser voice lists vary by device/OS.
  const getPreferredMaleVoice = () => {
    if (!("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter((voice) => /^en([_-]|$)/i.test(voice.lang || ""));
    const maleNameHints = /\b(male|man|david|mark|guy|daniel|james|alex|fred|tom|george|richard|aaron|ryan|matthew|oliver|arthur|lee|jason|thomas|andrew|brian|christopher|eric|john|michael|paul|sam)\b/i;
    return englishVoices.find((voice) => maleNameHints.test(voice.name || ""))
      || englishVoices.find((voice) => /natural|enhanced|google|microsoft/i.test(voice.name || ""))
      || englishVoices[0]
      || voices[0]
      || null;
  };
  const body = document.body;
  const rootElement = document.documentElement;
  const homeThemeButton = document.querySelector(".theme-toggle");

  const getThemeFromUrl = () => {
    const value = new URLSearchParams(window.location.search).get("theme");
    return value === "light" || value === "dark" ? value : null;
  };

  // Carry the selected theme in every internal page link. This also works
  // when the project is previewed as local files rather than through a server.
  const syncInternalLinks = (theme) => {
    document.querySelectorAll('a[href]').forEach((link) => {
      const raw = link.getAttribute("href");
      if (!raw || raw.startsWith("#") || /^(https?:|mailto:|tel:|javascript:|data:)/i.test(raw)) return;
      try {
        const target = new URL(raw, window.location.href);
        if (!/\.html?$/i.test(target.pathname)) return;
        target.searchParams.set("theme", theme);
        link.setAttribute("href", target.href);
      } catch (error) {}
    });
  };

  // About page only: character typing synchronized line-by-line with speech.
  const typeTargets = Array.from(document.querySelectorAll(".about-page [data-type-speak]"));
  if (typeTargets.length) {
    const items = typeTargets.map((el) => {
      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      el.classList.add("is-typing-target");
      const typedSpan = document.createElement("span");
      typedSpan.className = "type-typed-text";
      const caretSpan = document.createElement("span");
      caretSpan.className = "type-caret";
      caretSpan.setAttribute("aria-hidden", "true");
      el.textContent = "";
      el.append(typedSpan, caretSpan);
      return { el, typedSpan, caretSpan, text };
    }).filter((item) => item.text);

    const playBtn = document.getElementById("aboutNarrateToggle");
    const pauseBtn = document.getElementById("aboutNarratePause");
    const replayBtn = document.getElementById("aboutNarrateReplay");
    const statusEl = document.getElementById("aboutNarrateStatus");
    const hasSpeech = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    let timer = null, active = false, paused = false, runId = 0;

    const clearTimer = () => { if (timer) window.clearTimeout(timer); timer = null; };
    const status = (message) => { if (statusEl) statusEl.textContent = message; };
    const showAll = () => items.forEach((it) => { it.typedSpan.textContent = it.text; it.caretSpan.style.display = "none"; });
    const stop = (message = "Stopped", revealAll = true) => {
      runId++; active = false; paused = false; clearTimer();
      if (hasSpeech) window.speechSynthesis.cancel();
      if (revealAll) showAll();
      if (playBtn) { playBtn.textContent = "▶ Play"; playBtn.setAttribute("aria-pressed", "false"); }
      if (pauseBtn) { pauseBtn.textContent = "Ⅱ Pause"; pauseBtn.disabled = true; }
      status(message);
    };

    const run = () => {
      stop("Preparing introduction...", false);
      const id = runId;
      active = true; paused = false;
      items.forEach((it) => { it.typedSpan.textContent = ""; it.caretSpan.style.display = "none"; });
      if (playBtn) { playBtn.textContent = "■ Stop"; playBtn.setAttribute("aria-pressed", "true"); }
      if (pauseBtn) { pauseBtn.textContent = "Ⅱ Pause"; pauseBtn.disabled = !hasSpeech; }
      let lineIndex = 0, resumeTypingCurrent = null;

      const nextLine = () => {
        if (!active || paused || id !== runId) return;
        if (lineIndex >= items.length) {
          active = false;
          items.forEach((it) => it.caretSpan.style.display = "none");
          if (playBtn) { playBtn.textContent = "▶ Play"; playBtn.setAttribute("aria-pressed", "false"); }
          if (pauseBtn) pauseBtn.disabled = true;
          status("Completed");
          return;
        }
        const item = items[lineIndex];
        item.typedSpan.textContent = "";
        item.caretSpan.style.display = "inline-block";
        let charIndex = 0, typingDone = false, speechDone = !hasSpeech;
        const finishLineIfReady = () => {
          if (typingDone && speechDone && active && !paused && id === runId) {
            item.caretSpan.style.display = "none";
            lineIndex++;
            timer = window.setTimeout(nextLine, 220);
          }
        };
        const typeChar = () => {
          if (!active || paused || id !== runId) return;
          charIndex++;
          if (charIndex > item.text.length) {
            typingDone = true;
            finishLineIfReady();
            return;
          }
          if (item.typedSpan.textContent.length < charIndex) {
            item.typedSpan.textContent = item.text.slice(0, charIndex);
          }
          const ch = item.text[charIndex - 1];
          timer = window.setTimeout(typeChar, /[.!?]/.test(ch) ? 120 : /[,;]/.test(ch) ? 70 : 27);
        };

        resumeTypingCurrent = typeChar;
        if (hasSpeech) {
          const utterance = new SpeechSynthesisUtterance(item.text);
          const maleVoice = getPreferredMaleVoice();
          if (maleVoice) { utterance.voice = maleVoice; utterance.lang = maleVoice.lang || "en-US"; }
          else { utterance.lang = "en-US"; }
          utterance.rate = 0.94;
          utterance.onboundary = (event) => {
            if (!active || paused || id !== runId || typeof event.charIndex !== "number") return;
            const text = item.text;
            let end = event.charIndex;
            while (end < text.length && !/\s/.test(text[end])) end++;
            if (item.typedSpan.textContent.length < end) item.typedSpan.textContent = text.slice(0, end);
          };
          utterance.onend = () => { speechDone = true; finishLineIfReady(); };
          utterance.onerror = () => { speechDone = true; finishLineIfReady(); };
          window.speechSynthesis.speak(utterance);
        }
        typeChar();
      };

      status(hasSpeech ? "Speaking and typing..." : "Voice is not supported in this browser; typing introduction...");
      nextLine();
    };

    // Keep the complete introduction readable before playback begins.
    showAll();
    playBtn?.addEventListener("click", () => {
      if (active) stop("Stopped", true);
      else run();
    });
    pauseBtn?.addEventListener("click", () => {
      if (!active) return;
      if (!paused) {
        paused = true; clearTimer();
        if (hasSpeech) window.speechSynthesis.pause();
        pauseBtn.textContent = "▶ Resume";
        status("Paused");
      } else {
        paused = false;
        if (hasSpeech) window.speechSynthesis.resume();
        pauseBtn.textContent = "Ⅱ Pause";
        status("Resumed");
        if (resumeTypingCurrent) resumeTypingCurrent();
      }
    });
    replayBtn?.addEventListener("click", run);
    window.addEventListener("beforeunload", () => stop("Stopped", false));
  }

  // CV page: optional spoken résumé, using the same preferred male-sounding voice.
  const cvPlay = document.getElementById("cvNarratePlay");
  const cvPause = document.getElementById("cvNarratePause");
  const cvReplay = document.getElementById("cvNarrateReplay");
  const cvStatus = document.getElementById("cvNarrateStatus");
  const cvResume = document.querySelector(".cv-page .resume");
  if (cvPlay && cvResume) {
    const cvText = (cvResume.innerText || cvResume.textContent || "").replace(/\s+/g, " ").trim();
    const cvHasSpeech = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    let cvUtterance = null;
    const setCvStatus = (message) => { if (cvStatus) cvStatus.textContent = message; };
    const stopCvSpeech = () => { if (cvHasSpeech) window.speechSynthesis.cancel(); cvUtterance = null; if (cvPause) cvPause.disabled = true; cvPlay.textContent = "▶ Play CV"; };
    const speakCv = () => {
      if (!cvHasSpeech) { setCvStatus("Voice playback is not supported in this browser."); return; }
      window.speechSynthesis.cancel();
      cvUtterance = new SpeechSynthesisUtterance(cvText);
      const maleVoice = getPreferredMaleVoice();
      if (maleVoice) { cvUtterance.voice = maleVoice; cvUtterance.lang = maleVoice.lang || "en-US"; }
      else { cvUtterance.lang = "en-US"; }
      cvUtterance.rate = 0.92;
      cvUtterance.onstart = () => { cvPlay.textContent = "■ Stop CV"; if (cvPause) cvPause.disabled = false; setCvStatus("Reading CV aloud..."); };
      cvUtterance.onend = () => { cvPlay.textContent = "▶ Play CV"; if (cvPause) cvPause.disabled = true; setCvStatus("CV narration completed."); };
      cvUtterance.onerror = () => { cvPlay.textContent = "▶ Play CV"; if (cvPause) cvPause.disabled = true; setCvStatus("Could not play voice. Check the voices available on this device."); };
      window.speechSynthesis.speak(cvUtterance);
    };
    cvPlay.addEventListener("click", () => {
      if (cvHasSpeech && window.speechSynthesis.speaking && !window.speechSynthesis.paused) { stopCvSpeech(); setCvStatus("CV narration stopped."); }
      else if (cvHasSpeech && window.speechSynthesis.paused) { window.speechSynthesis.resume(); }
      else speakCv();
    });
    cvPause?.addEventListener("click", () => {
      if (!cvHasSpeech || !window.speechSynthesis.speaking) return;
      if (window.speechSynthesis.paused) { window.speechSynthesis.resume(); cvPause.textContent = "Ⅱ Pause"; setCvStatus("CV narration resumed."); }
      else { window.speechSynthesis.pause(); cvPause.textContent = "▶ Resume"; setCvStatus("CV narration paused."); }
    });
    cvReplay?.addEventListener("click", speakCv);
    window.addEventListener("beforeunload", stopCvSpeech);
    if (!cvHasSpeech) { cvPlay.disabled = true; setCvStatus("Voice playback is not supported in this browser."); }
  }

  const applyTheme = (theme, persist = true) => {
    const normalized = theme === "light" ? "light" : "dark";
    rootElement.setAttribute("data-theme", normalized);
    rootElement.classList.toggle("theme-light", normalized === "light");
    body.classList.toggle("light", normalized === "light");
    if (persist) {
      try { localStorage.setItem("awt-theme", normalized); } catch (error) {}
    }
    syncInternalLinks(normalized);
    if (homeThemeButton) {
      homeThemeButton.textContent = normalized === "light" ? "🌙 Switch to Dark" : "☀ Switch to Light";
      homeThemeButton.setAttribute("aria-pressed", normalized === "light" ? "true" : "false");
    }
  };

  // Home is the only page with a toggle. Other pages inherit the theme
  // from the URL carried by Home's links, with localStorage as a fallback.
  let initialTheme = getThemeFromUrl();
  if (!initialTheme) {
    try { initialTheme = localStorage.getItem("awt-theme"); } catch (error) {}
  }
  applyTheme(initialTheme || "dark", true);

  if (homeThemeButton) {
    homeThemeButton.addEventListener("click", () => {
      const next = rootElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next, true);
    });
  }

  // Synchronize already-open tabs on the same origin as well.
  window.addEventListener("storage", (event) => {
    if (event.key === "awt-theme" && event.newValue) {
      applyTheme(event.newValue, false);
    }
  });

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (menuButton && nav) menuButton.addEventListener("click", () => {
    nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", nav.classList.contains("open"));
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const skills = ["Web Development", "Graphic Designing", "Video Editing", "Digital Marketing", "IT Solutions", "Full-Stack Development"];
  const skillElement = document.getElementById("skillCycle");
  if (skillElement) {
    let index = 0;
    setInterval(() => {
      skillElement.style.opacity = "0";
      setTimeout(() => {
        index = (index + 1) % skills.length;
        skillElement.textContent = skills[index];
        skillElement.style.opacity = "1";
      }, 220);
    }, 2100);
  }


  // Reveal uploaded certificate scans when the matching file is present.
  document.querySelectorAll(".certificate-image-frame img").forEach((image) => {
    const markReady = () => image.closest(".certificate-image-frame")?.classList.add("has-image");
    image.addEventListener("load", markReady, { once: true });
    image.addEventListener("error", () => image.closest(".certificate-image-frame")?.classList.remove("has-image"), { once: true });
    if (image.complete && image.naturalWidth > 0) markReady();
  });

  // Rotate concise, field-specific value statements without changing card layout.
  const valueCopy = {
    innovation: [
      "Exploring modern ideas and technologies to create meaningful digital solutions.",
      "Combining web development and creative design to turn ideas into useful experiences.",
      "Experimenting with practical tools and fresh approaches to solve real problems."
    ],
    quality: [
      "Building clear, responsive and user-friendly websites with attention to detail.",
      "Keeping interfaces consistent, accessible and easy to use across devices.",
      "Writing maintainable code and checking details before a project is delivered."
    ],
    growth: [
      "Continuously learning, improving and developing new skills across technology and design.",
      "Growing through hands-on projects, feedback and continuous practice.",
      "Exploring new skills in full-stack development, branding and digital creativity."
    ]
  };
  document.querySelectorAll("[data-value-cycle]").forEach((element) => {
    const key = element.getAttribute("data-value-cycle");
    const statements = valueCopy[key];
    if (!statements || statements.length < 2) return;
    let current = 0;
    window.setInterval(() => {
      element.classList.add("is-changing");
      window.setTimeout(() => {
        current = (current + 1) % statements.length;
        element.textContent = statements[current];
        element.classList.remove("is-changing");
      }, 260);
    }, 4800);
  });

  const email = SITE_CONFIG.email;
  const whatsapp = SITE_CONFIG.whatsappNumber;
  const emailButton = document.getElementById("emailButton");
  if (emailButton) {
    emailButton.href = `mailto:${email}`;
    emailButton.querySelector("small").textContent = email;
  }
  const waButton = document.getElementById("whatsappButton");
  if (waButton) waButton.href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(SITE_CONFIG.whatsappMessage)}`;
  document.querySelectorAll(".whatsapp-link").forEach(link => link.href = `https://wa.me/${whatsapp}`);

  const form = document.getElementById("contactForm");
  if (form) form.addEventListener("submit", event => {
    event.preventDefault();
    const name = document.getElementById("senderName").value.trim();
    const sender = document.getElementById("senderEmail").value.trim();
    const subject = document.getElementById("messageSubject").value.trim();
    const message = document.getElementById("messageBody").value.trim();
    const bodyText = `Name: ${name}\nEmail: ${sender}\n\n${message}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  });

  // Accessible featured-project slider: one slide at a time, 5-second autoplay.
  const projectSlider = document.querySelector("[data-project-slider]");
  if (projectSlider) {
    const slides = Array.from(projectSlider.querySelectorAll("[data-project-slide]"));
    const dots = Array.from(projectSlider.querySelectorAll(".project-dot"));
    const previous = projectSlider.querySelector(".project-prev");
    const next = projectSlider.querySelector(".project-next");
    let activeIndex = 0;
    let autoplay = null;
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const showSlide = (index) => {
      if (!slides.length) return;
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === activeIndex;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
        slide.querySelectorAll("a, button").forEach(control => {
          if (active) control.removeAttribute("tabindex");
          else control.setAttribute("tabindex", "-1");
        });
      });
      dots.forEach((dot, i) => {
        const active = i === activeIndex;
        dot.classList.toggle("is-active", active);
        if (active) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    };
    const stopAutoplay = () => {
      if (autoplay) window.clearInterval(autoplay);
      autoplay = null;
    };
    const startAutoplay = () => {
      stopAutoplay();
      if (!reducedMotion && !document.hidden && !projectSlider.matches(":hover") && !projectSlider.contains(document.activeElement)) {
        autoplay = window.setInterval(() => showSlide(activeIndex + 1), 5000);
      }
    };
    previous?.addEventListener("click", () => { showSlide(activeIndex - 1); startAutoplay(); });
    next?.addEventListener("click", () => { showSlide(activeIndex + 1); startAutoplay(); });
    dots.forEach((dot, i) => dot.addEventListener("click", () => { showSlide(i); startAutoplay(); }));
    projectSlider.addEventListener("mouseenter", stopAutoplay);
    projectSlider.addEventListener("mouseleave", startAutoplay);
    projectSlider.addEventListener("focusin", stopAutoplay);
    projectSlider.addEventListener("focusout", () => window.setTimeout(startAutoplay, 0));
    document.addEventListener("visibilitychange", () => document.hidden ? stopAutoplay() : startAutoplay());
    showSlide(0);
    startAutoplay();
  }

  // Project URLs are intentionally editable in HTML. Empty placeholders never pretend to be live links.
  document.querySelectorAll("[data-project-link]").forEach((link) => {
    const target = (link.getAttribute("data-project-url") || "").trim();
    if (/^https?:\/\/\S+$/i.test(target)) {
      link.href = target;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.classList.remove("is-unconfigured");
      link.removeAttribute("aria-disabled");
    } else {
      link.href = "#";
      link.classList.add("is-unconfigured");
      link.setAttribute("aria-disabled", "true");
      link.addEventListener("click", (event) => event.preventDefault());
    }
  });

});
