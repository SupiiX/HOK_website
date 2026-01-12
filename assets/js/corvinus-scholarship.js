
(function () {
  'use strict';

  // Globális változók
  let scholarshipData = null;    // JSON adatok (corvinus-scholarship.json)
  let currentChart = null;       // Chart.js instance
  let initialized = false;       // Inicializálás flag (csak egyszer fut le)

  // DOM elemek referenciák (performance optimalizálás)
  const elements = {
    levelRadios: null,           // Alapképzés/Mesterképzés toggle
    courseSelect: null,          // Szakválasztó dropdown
    chartCanvas: null,           // Canvas elem a chart-hoz
    infoBox: null,               // Info box az adatforrásról
    loadingSpinner: null,        // Loading spinner
    errorMessage: null           // Hibaüzenet elem
  };
  function showLoading() {
    if (elements.loadingSpinner) {
      elements.loadingSpinner.classList.remove('d-none');
    }
    if (elements.courseSelect) {
      elements.courseSelect.disabled = true;
    }
    if (elements.levelRadios) {
      elements.levelRadios.forEach(radio => radio.disabled = true);
    }
  }

  function hideLoading() {
    if (elements.loadingSpinner) {
      elements.loadingSpinner.classList.add('d-none');
    }
    if (elements.courseSelect) {
      elements.courseSelect.disabled = false;
    }
    if (elements.levelRadios) {
      elements.levelRadios.forEach(radio => radio.disabled = false);
    }
  }

  function showError(message) {
    if (elements.errorMessage) {
      elements.errorMessage.textContent = message;
      elements.errorMessage.classList.remove('d-none');
    }
  }

  function hideError() {
    if (elements.errorMessage) {
      elements.errorMessage.classList.add('d-none');
    }
  }
  async function init() {
    if (initialized) return;
    initialized = true;

    // Chart.js ellenőrzése (CDN betöltődött-e)
    if (typeof Chart === 'undefined') {
      showError('A diagram megjelenítéshez szükséges könyvtár nem töltődött be. Kérjük, frissítsd az oldalt!');
      console.error('Chart.js library not loaded');
      return;
    }

    // DOM elemek kiválasztása
    elements.levelRadios = document.querySelectorAll('input[name="corvinus-level"]');
    elements.courseSelect = document.getElementById('corvinus-course-select');
    elements.chartCanvas = document.getElementById('corvinus-chart');
    elements.infoBox = document.getElementById('corvinus-info');
    elements.loadingSpinner = document.getElementById('corvinus-loading');
    elements.errorMessage = document.getElementById('corvinus-error');

    // JSON adatok betöltése fetch API-val
    showLoading();
    hideError();

    try {
      const response = await fetch('assets/js/corvinus-scholarship.json');

      // HTTP response validáció (404, 500, stb.)
      if (!response.ok) {
        throw new Error(`HTTP hiba: ${response.status} - ${response.statusText}`);
      }

      scholarshipData = await response.json();

      // Alapértelmezett szaklista: alapképzés
      updateCourseList('alapképzés');

      // Event listener: képzési szint váltás (alapképzés ↔ mesterképzés)
      elements.levelRadios.forEach(radio => {
        radio.addEventListener('change', handleLevelChange);
      });

      // Event listener: szakválasztás (dropdown change)
      elements.courseSelect.addEventListener('change', handleCourseChange);

      hideLoading();

    } catch (error) {
      hideLoading();
      console.error('Hiba az adatok betöltésekor:', error);

      // Felhasználóbarát hibaüzenet generálás
      let userMessage = 'Hiba történt az adatok betöltésekor. ';
      if (error.message.includes('HTTP')) {
        userMessage += 'A szerver nem érhető el. ';
      } else if (error.message.includes('JSON')) {
        userMessage += 'Az adatok formátuma hibás. ';
      } else if (error.message.includes('network')) {
        userMessage += 'Nincs internetkapcsolat. ';
      } else {
        userMessage += error.message + ' ';
      }
      userMessage += 'Kérjük, frissítsd az oldalt vagy próbáld újra később!';

      showError(userMessage);
    }
  }
  function handleLevelChange(event) {
    const selectedLevel = event.target.value;
    updateCourseList(selectedLevel);

    // Meglévő chart törlése (új szint új szakok)
    if (currentChart) {
      currentChart.destroy();
      currentChart = null;
    }
    elements.infoBox.classList.add('d-none');
  }
  function updateCourseList(level) {
    // Map használata: szak név alapján deduplikálás
    const courses = new Map();

    scholarshipData.periods.forEach(period => {
      period.courses.forEach(course => {
        if (course.level === level) {
          if (!courses.has(course.name)) {
            courses.set(course.name, course);
          }
        }
      });
    });

    // Dropdown reset
    elements.courseSelect.innerHTML = '<option value="">-- Válassz szakot --</option>';

    // ABC rendezés (magyar locale: á, é, ö, stb. helyes sorrendben)
    const sortedCourses = Array.from(courses.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'hu')
    );

    // Option elemek generálása
    sortedCourses.forEach(course => {
      const option = document.createElement('option');
      option.value = course.name;
      option.textContent = course.name;
      elements.courseSelect.appendChild(option);
    });
  }

  function handleCourseChange(event) {
    const courseName = event.target.value;

    if (!courseName) {
      // Nincs kiválasztott szak → chart törlése
      if (currentChart) {
        currentChart.destroy();
        currentChart = null;
      }
      elements.infoBox.classList.add('d-none');
      return;
    }

    // Loading state (spinner + disabled controls)
    showLoading();

    // Adatok gyűjtése a kiválasztott szakhoz
    const selectedLevel = document.querySelector('input[name="corvinus-level"]:checked').value;
    const chartData = prepareChartData(courseName, selectedLevel);

    // Smooth UX: requestAnimationFrame (optimalizált rendering)
    requestAnimationFrame(() => {
      renderChart(chartData, courseName);
      elements.infoBox.classList.remove('d-none');
      hideLoading();
    });
  }

  function prepareChartData(courseName, level) {
    const periods = [];
    const scholarshipRatios = [];

    scholarshipData.periods.forEach(period => {
      const course = period.courses.find(c =>
        c.name === courseName && c.level === level
      );

      if (course) {
        // Periódus formázás: "2020/2021/1"  "2020/21"
        const periodLabel = period.period.split('/').slice(0, 2).join('/');
        periods.push(periodLabel);
        scholarshipRatios.push(course.scholarship_ratio);
      }
    });

    return {
      labels: periods,
      values: scholarshipRatios
    };
  }

  function renderChart(data, courseName) {
    // Meglévő chart törlése (destroy() memória felszabadítás)
    if (currentChart) {
      currentChart.destroy();
    }

    const ctx = elements.chartCanvas.getContext('2d');

    currentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,  // ["2020/21", "2021/22", ...]
        datasets: [{
          label: 'Ösztöndíjas helyek aránya (%)',
          data: data.values,  // [80, 85, 90, ...]
          backgroundColor: 'rgba(214, 57, 76, 0.6)',  // Corvinus red (transzparens)
          borderColor: 'rgba(214, 57, 76, 1)',        // Corvinus red (solid)
          borderWidth: 2,
          borderRadius: 5,  // Lekerekített oszlopok
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
          title: {
            display: true,
            text: courseName,  // Szak neve a chart tetején
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.parsed.y + '%';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,  // 0-100% skála
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            },
            title: {
              display: true,
              text: 'Ösztöndíjas helyek aránya (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Tanév'
            }
          }
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    const tabLinks = document.querySelectorAll('[data-bs-toggle="tab"]');

    // Bootstrap tab váltás figyelése
    tabLinks.forEach(tab => {
      tab.addEventListener('shown.bs.tab', function (event) {
        if (event.target.getAttribute('href') === '#tab-4') {
          // Tab 4 aktiválva → ellenőrizzük a sub-tab-ot
          const statsRadio = document.getElementById('tools-stats');
          if (statsRadio && statsRadio.checked) {
            init();
          }
        }
      });
    });

    // Sub-tab váltás figyelése (Kalkulátor ↔ Statisztikák)
    const toolsRadios = document.querySelectorAll('input[name="tools-type"]');
    toolsRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.value === 'stats' && !initialized) {
          // Statisztikák sub-tab → init (csak először)
          requestAnimationFrame(() => {
            init();
          });
        }
      });
    });
  });

  // Globális scope-ba export (navigateToCorvinusChart() használja)
  window.initCorvinusChart = init;

})();
