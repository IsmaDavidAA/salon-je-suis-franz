const TZ = "America/La_Paz";

const schedule = {
  0: { start: 9 * 60 + 30, end: 16 * 60 },
  1: { start: 9 * 60, end: 19 * 60 + 30 },
  2: { start: 9 * 60, end: 19 * 60 + 30 },
  3: { start: 9 * 60, end: 19 * 60 + 30 },
  4: { start: 9 * 60, end: 19 * 60 + 30 },
  5: { start: 9 * 60, end: 19 * 60 + 30 },
  6: { start: 8 * 60 + 30, end: 19 * 60 + 30 },
};

const dayNames = [
  "el domingo",
  "el lunes",
  "el martes",
  "el miércoles",
  "el jueves",
  "el viernes",
  "el sábado",
];

const clock = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const nowInLaPaz = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    day: days[value.weekday],
    minutes: Number(value.hour) * 60 + Number(value.minute),
  };
};

const statusFor = ({ day, minutes }) => {
  const today = schedule[day];
  if (minutes >= today.start && minutes < today.end) {
    return { open: true, text: `Abierto ahora · hasta las ${clock(today.end)}` };
  }
  if (minutes < today.start) {
    return { open: false, text: `Cerrado · abre hoy a las ${clock(today.start)}` };
  }
  const next = (day + 1) % 7;
  return {
    open: false,
    text: `Cerrado · abre ${dayNames[next]} a las ${clock(schedule[next].start)}`,
  };
};

const renderStatus = () => {
  const current = nowInLaPaz();
  if (current.day === undefined || Number.isNaN(current.minutes)) return;
  const status = statusFor(current);
  document.querySelectorAll("[data-status]").forEach((node) => {
    node.textContent = status.text;
    node.dataset.open = status.open ? "true" : "false";
  });
  document.querySelectorAll("[data-day], [data-days]").forEach((row) => {
    const days = (row.dataset.days || row.dataset.day).split(",").map(Number);
    row.classList.toggle("is-today", days.includes(current.day));
  });
};

const setupMenu = () => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#menu");
  if (!toggle || !menu) return;

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", open ? "false" : "true");
    menu.classList.toggle("is-open", !open);
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) close();
  });
};

const setupFloat = () => {
  const button = document.querySelector(".call-float");
  const hero = document.querySelector(".hero");
  if (!button || !hero) return;
  const sync = () => {
    button.classList.toggle("is-visible", hero.getBoundingClientRect().bottom < 72);
  };
  sync();
  window.addEventListener("scroll", sync, { passive: true });
};

const setupHeader = () => {
  const top = document.querySelector(".top");
  const toggle = document.querySelector(".nav-toggle");
  if (!top) return;
  const sync = () => {
    const menuOpen = toggle?.getAttribute("aria-expanded") === "true";
    top.classList.toggle("is-solid", menuOpen || window.scrollY > 20);
  };
  sync();
  window.addEventListener("scroll", sync, { passive: true });
  toggle?.addEventListener("click", () => requestAnimationFrame(sync));
};

renderStatus();
setupMenu();
setupFloat();
setupHeader();
setInterval(renderStatus, 60000);
