const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelector("[data-nav-links]");
const navItems = [...document.querySelectorAll(".nav-links a")];
const revealItems = [...document.querySelectorAll(".reveal")];
const experienceYearItems = [...document.querySelectorAll("[data-experience-years]")];
const projectGalleries = [...document.querySelectorAll("[data-project-gallery]")];
const projectCodeLinks = [...document.querySelectorAll("[data-project-code]")];
const form = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const experienceStartYear = 2019;

const updateExperienceYears = () => {
  const currentYear = new Date().getFullYear();

  experienceYearItems.forEach((item) => {
    const startYear = Number(item.dataset.startYear) || experienceStartYear;
    const years = Math.max(currentYear - startYear, 0);

    item.textContent = String(years);
  });
};

updateExperienceYears();

projectGalleries.forEach((gallery) => {
  const preview = gallery.querySelector("[data-project-preview]");
  const buttons = [...gallery.querySelectorAll("[data-preview-src]")];

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.getAttribute("aria-pressed") === "true") return;

      preview.classList.add("is-switching");

      window.setTimeout(() => {
        preview.src = button.dataset.previewSrc;
        preview.alt = button.dataset.previewAlt;

        buttons.forEach((item) => {
          item.setAttribute("aria-pressed", String(item === button));
        });

        requestAnimationFrame(() => preview.classList.remove("is-switching"));
      }, 140);
    });
  });
});

projectCodeLinks.forEach((link) => {
  try {
    const url = new URL(link.href, window.location.href);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const isPublicGithub =
      url.protocol === "https:" &&
      ["github.com", "www.github.com"].includes(url.hostname) &&
      pathParts.length >= 2;

    link.hidden = !isPublicGithub;
  } catch {
    link.hidden = true;
  }
});

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.classList.toggle("is-open");
  navLinks.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    menuToggle.classList.remove("is-open");
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index * 42, 260)}ms`;
  revealObserver.observe(item);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navItems.forEach((item) => {
        const linkTarget = item.getAttribute("href").replace("#", "");
        item.classList.toggle("is-active", linkTarget === entry.target.id);
      });
    });
  },
  { rootMargin: "-42% 0px -50% 0px", threshold: 0 }
);

document.querySelectorAll("main section[id]").forEach((section) => {
  sectionObserver.observe(section);
});

const validators = {
  name: (value) => (value.trim().length >= 2 ? "" : "Informe seu nome."),
  email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Informe um e-mail válido."),
  subject: (value) => (value.trim().length >= 3 ? "" : "Informe o assunto."),
  message: (value) => (value.trim().length >= 12 ? "" : "Escreva uma mensagem com mais detalhes."),
};

const setError = (field, message) => {
  const error = form.querySelector(`[data-error-for="${field.name}"]`);
  field.setAttribute("aria-invalid", message ? "true" : "false");
  if (error) error.textContent = message;
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const fields = [...form.querySelectorAll("input, textarea")];
  const errors = fields.map((field) => {
    const message = validators[field.name](field.value);
    setError(field, message);
    return message;
  });

  if (errors.some(Boolean)) {
    formStatus.textContent = "Revise os campos destacados antes de enviar.";
    return;
  }

  const data = new FormData(form);
  const subject = encodeURIComponent(data.get("subject"));
  const body = encodeURIComponent(
    `Nome: ${data.get("name")}\nE-mail: ${data.get("email")}\n\n${data.get("message")}`
  );

  formStatus.textContent = "Mensagem pronta no seu cliente de e-mail.";
  window.location.href = `mailto:contato@rhuancarlos.dev?subject=${subject}&body=${body}`;
});
