/**
 * Events Calendar - Timeline megjelenítés
 * Féléves eseménynaptár megjelenítése timeline nézetben
 */

(function () {
  'use strict';

  let eventsData = null;
  let currentLanguage = 'hu'; // 'hu' vagy 'en'

  // Nyelv detektálás az URL alapján
  function detectLanguage() {
    const path = window.location.pathname;
    return path.includes('index_en.html') ? 'en' : 'hu';
  }

  // JSON betöltése
  async function loadEventsData() {
    try {
      const response = await fetch('assets/js/events-calendar.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      eventsData = await response.json();
      return eventsData;
    } catch (error) {
      console.error('Hiba az események betöltésekor:', error);
      return null;
    }
  }

  // Dátum összehasonlítás (csak nap pontossággal)
  function compareDates(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return d1.getTime() - d2.getTime();
  }

  // Mai dátum (YYYY-MM-DD formátum)
  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Esemény státusz meghatározása
  function getEventStatus(event) {
    const today = getTodayDate();
    const eventEndDate = event.endDate || event.date;

    if (compareDates(eventEndDate, today) < 0) {
      return 'past'; // múltbeli
    }
    return 'upcoming'; // jövőbeli vagy mai
  }

  // Következő esemény megkeresése (első olyan esemény ami még nem zajlott le)
  function findNextEvent(events) {
    const today = getTodayDate();

    for (let event of events) {
      const eventEndDate = event.endDate || event.date;
      if (compareDates(eventEndDate, today) >= 0) {
        return event.id;
      }
    }

    return null;
  }

  // Dátum formázás: 2024.10.15
  function formatDate(dateString) {
    return dateString.replace(/-/g, '.');
  }

  // Nap neve (opcionális)
  function getDayName(dateString, lang) {
    const date = new Date(dateString);
    const daysHu = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
    const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const days = lang === 'en' ? daysEn : daysHu;
    return days[date.getDay()];
  }

  // Kategória adatok lekérése ID alapján
  function getCategoryById(categoryId) {
    if (!eventsData || !eventsData.categories) return null;
    return eventsData.categories.find(cat => cat.id === categoryId);
  }

  // Timeline renderelés
  function renderTimeline(filteredEvents) {
    const container = document.getElementById('events-timeline-container');
    if (!container) return;

    const nextEventId = findNextEvent(filteredEvents);
    const lang = currentLanguage;

    let html = '';

    filteredEvents.forEach((event, index) => {
      const status = getEventStatus(event);
      const isNext = event.id === nextEventId;
      const category = getCategoryById(event.category);
      const categoryColor = category ? category.color : '#666';

      // Címek és szövegek nyelvesítve
      const title = lang === 'en' ? event.titleEn : event.title;
      const description = lang === 'en' ? event.descriptionEn : event.description;
      const location = lang === 'en' ? event.locationEn : event.location;

      // Dátum megjelenítés
      let dateDisplay = formatDate(event.date);
      if (event.endDate) {
        dateDisplay += ' - ' + formatDate(event.endDate);
      }

      // Kör típusa: teli (●) ha következő, különben üres (○)
      const circleClass = isNext ? 'timeline-circle-filled' : 'timeline-circle-empty';

      // Link
      const hasLink = event.link && event.link.trim() !== '';
      const linkStart = hasLink ? `<a href="${event.link}" class="event-link">` : '';
      const linkEnd = hasLink ? '</a>' : '';

      html += `
        <div class="timeline-event" data-category="${event.category}" data-status="${status}">
          <div class="timeline-marker">
            <div class="timeline-circle ${circleClass}" style="border-color: ${categoryColor}; background-color: ${isNext ? categoryColor : 'transparent'};"></div>
          </div>
          <div class="timeline-content" style="color: ${categoryColor};">
            <div class="event-date-title">
              ${linkStart}
              <span class="event-date">${dateDisplay}</span>
              <span class="event-title-text"> - ${title}</span>
              ${linkEnd}
            </div>
            ${description ? `<div class="event-description">${description}</div>` : ''}
            ${location ? `<div class="event-meta"><span class="event-location">📍 ${location}</span></div>` : ''}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // Szűrés kategóriák szerint
  function filterEvents() {
    if (!eventsData || !eventsData.events) return;

    const checkboxes = document.querySelectorAll('.event-filter-checkbox');
    const selectedCategories = [];

    checkboxes.forEach(cb => {
      if (cb.checked) {
        selectedCategories.push(cb.value);
      }
    });

    // Ha minden ki van pipálva, vagy egyik sincs, mutassunk mindent
    const filteredEvents = selectedCategories.length === 0
      ? eventsData.events
      : eventsData.events.filter(event => selectedCategories.includes(event.category));

    renderTimeline(filteredEvents);
  }

  // Szűrő checkboxok renderelése
  function renderFilters() {
    const container = document.getElementById('events-filter-container');
    if (!container || !eventsData || !eventsData.categories) return;

    const lang = currentLanguage;
    let html = '';

    eventsData.categories.forEach(category => {
      const name = lang === 'en' ? category.nameEn : category.name;
      html += `
        <label class="event-filter-label">
          <input type="checkbox" class="event-filter-checkbox" value="${category.id}" checked>
          <span class="filter-color-indicator" style="background-color: ${category.color};"></span>
          <span class="filter-name">${name}</span>
        </label>
      `;
    });

    container.innerHTML = html;

    // Checkbox eseménykezelők
    const checkboxes = container.querySelectorAll('.event-filter-checkbox');
    checkboxes.forEach(cb => {
      cb.addEventListener('change', filterEvents);
    });
  }

  // Inicializálás
  async function init() {
    currentLanguage = detectLanguage();

    const data = await loadEventsData();
    if (!data) {
      console.error('Nem sikerült betölteni az eseményeket');
      return;
    }

    renderFilters();
    filterEvents(); // Kezdeti megjelenítés (összes esemény)
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
