(function () {
  'use strict';

  let scholarshipData = null;
  let currentChart = null;
  let initialized = false;

  const elements = {
    levelRadios: null,
    courseSelect: null,
    chartCanvas: null,
    infoBox: null,
    loadingSpinner: null,
    errorMessage: null
  };

  // UX - Loading state megjelenítése
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

  // UX - Loading state elrejtése
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

  // UX - Error message megjelenítése
  function showError(message) {
    if (elements.errorMessage) {
      elements.errorMessage.textContent = message;
      elements.errorMessage.classList.remove('d-none');
    }
  }

  // UX - Error message elrejtése
  function hideError() {
    if (elements.errorMessage) {
      elements.errorMessage.classList.add('d-none');
    }
  }

  // Inicializálás
  async function init() {
    if (initialized) return;
    initialized = true;

    // Chart.js ellenőrzése
    if (typeof Chart === 'undefined') {
      showError('A diagram megjelenítéshez szükséges könyvtár nem töltődött be. Kérjük, frissítsd az oldalt!');
      console.error('Chart.js library not loaded');
      return;
    }

    // Elemek kiválasztása
    elements.levelRadios = document.querySelectorAll('input[name="corvinus-level"]');
    elements.courseSelect = document.getElementById('corvinus-course-select');
    elements.chartCanvas = document.getElementById('corvinus-chart');
    elements.infoBox = document.getElementById('corvinus-info');
    elements.loadingSpinner = document.getElementById('corvinus-loading');
    elements.errorMessage = document.getElementById('corvinus-error');

    // JSON betöltése
    showLoading();
    hideError();

    try {
      const response = await fetch('assets/js/corvinus-scholarship.json');

      // HTTP response validáció
      if (!response.ok) {
        throw new Error(`HTTP hiba: ${response.status} - ${response.statusText}`);
      }

      scholarshipData = await response.json();

      // Alapképzés szakok betöltése alapértelmezettként
      updateCourseList('alapképzés');

      // Event listeners
      elements.levelRadios.forEach(radio => {
        radio.addEventListener('change', handleLevelChange);
      });

      elements.courseSelect.addEventListener('change', handleCourseChange);

      hideLoading();

    } catch (error) {
      hideLoading();
      console.error('Hiba az adatok betöltésekor:', error);

      // Részletes hibaüzenet a felhasználónak
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

  // Képzési szint változás kezelése
  function handleLevelChange(event) {
    const selectedLevel = event.target.value;
    updateCourseList(selectedLevel);

    // Chart törlése
    if (currentChart) {
      currentChart.destroy();
      currentChart = null;
    }
    elements.infoBox.classList.add('d-none');
  }

  // Szak lista frissítése
  function updateCourseList(level) {
    // Összes szak gyűjtése az adott szintről
    const courses = new Map();

    scholarshipData.periods.forEach(period => {
      period.courses.forEach(course => {
        if (course.level === level) {
          // Használjuk a szak nevét kulcsként, hogy ne legyenek duplikációk
          if (!courses.has(course.name)) {
            courses.set(course.name, course);
          }
        }
      });
    });

    // Dropdown feltöltése
    elements.courseSelect.innerHTML = '<option value="">-- Válassz szakot --</option>';

    // Rendezzük ABC sorrendbe
    const sortedCourses = Array.from(courses.values()).sort((a, b) =>
      a.name.localeCompare(b.name, 'hu')
    );

    sortedCourses.forEach(course => {
      const option = document.createElement('option');
      option.value = course.name;
      option.textContent = course.name;
      elements.courseSelect.appendChild(option);
    });
  }

  // Szak változás kezelése
  function handleCourseChange(event) {
    const courseName = event.target.value;

    if (!courseName) {
      // Ha nincs kiválasztott szak, töröljük a chartot
      if (currentChart) {
        currentChart.destroy();
        currentChart = null;
      }
      elements.infoBox.classList.add('d-none');
      return;
    }

    // UX - Loading state chart készítéskor
    showLoading();

    // Adatok gyűjtése a kiválasztott szakhoz
    const selectedLevel = document.querySelector('input[name="corvinus-level"]:checked').value;
    const chartData = prepareChartData(courseName, selectedLevel);

    // Chart megjelenítése kis késleltetéssel (smooth UX)
    requestAnimationFrame(() => {
      renderChart(chartData, courseName);
      elements.infoBox.classList.remove('d-none');
      hideLoading();
    });
  }

  // Chart adatok előkészítése
  function prepareChartData(courseName, level) {
    const periods = [];
    const scholarshipRatios = [];

    scholarshipData.periods.forEach(period => {
      // Keressük meg az adott szakot ebben a periódusban
      const course = period.courses.find(c =>
        c.name === courseName && c.level === level
      );

      if (course) {
        // Periódus formázása (pl. "2020/2021/1" -> "2020/21")
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

  // Chart megjelenítése
  function renderChart(data, courseName) {
    // Töröljük a régi chartot ha van
    if (currentChart) {
      currentChart.destroy();
    }

    const ctx = elements.chartCanvas.getContext('2d');

    currentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Ösztöndíjas helyek aránya (%)',
          data: data.values,
          backgroundColor: 'rgba(214, 57, 76, 0.6)',
          borderColor: 'rgba(214, 57, 76, 1)',
          borderWidth: 2,
          borderRadius: 5,
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
            text: courseName,
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
            max: 100,
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

  // Bootstrap tab esemény figyelése
  document.addEventListener('DOMContentLoaded', function() {
    const tabLinks = document.querySelectorAll('[data-bs-toggle="tab"]');

    tabLinks.forEach(tab => {
      tab.addEventListener('shown.bs.tab', function (event) {
        if (event.target.getAttribute('href') === '#tab-4') {
          // Check if stats sub-tab is active
          const statsRadio = document.getElementById('tools-stats');
          if (statsRadio && statsRadio.checked) {
            init();
          }
        }
      });
    });

    // Listen to sub-tab changes
    const toolsRadios = document.querySelectorAll('input[name="tools-type"]');
    toolsRadios.forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.value === 'stats' && !initialized) {
          // Initialize when switching to stats for the first time
          requestAnimationFrame(() => {
            init();
          });
        }
      });
    });
  });

  // Expose init function globally so it can be called from navigation
  window.initCorvinusChart = init;

})();
