(function () {
  'use strict';

  let scholarshipData = null;
  let currentChart = null;
  let initialized = false;

  const elements = {
    levelRadios: null,
    courseSelect: null,
    chartCanvas: null,
    infoBox: null
  };

  // Inicializálás
  async function init() {
    if (initialized) return;
    initialized = true;

    // Elemek kiválasztása
    elements.levelRadios = document.querySelectorAll('input[name="corvinus-level"]');
    elements.courseSelect = document.getElementById('corvinus-course-select');
    elements.chartCanvas = document.getElementById('corvinus-chart');
    elements.infoBox = document.getElementById('corvinus-info');

    // JSON betöltése
    try {
      const response = await fetch('assets/js/corvinus-scholarship.json');
      scholarshipData = await response.json();

      // Alapképzés szakok betöltése alapértelmezettként
      updateCourseList('alapképzés');

      // Event listeners
      elements.levelRadios.forEach(radio => {
        radio.addEventListener('change', handleLevelChange);
      });

      elements.courseSelect.addEventListener('change', handleCourseChange);

    } catch (error) {
      console.error('Hiba az adatok betöltésekor:', error);
      alert('Hiba történt az adatok betöltésekor. Kérjük, frissítsd az oldalt!');
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

    // Adatok gyűjtése a kiválasztott szakhoz
    const selectedLevel = document.querySelector('input[name="corvinus-level"]:checked').value;
    const chartData = prepareChartData(courseName, selectedLevel);

    // Chart megjelenítése
    renderChart(chartData, courseName);
    elements.infoBox.classList.remove('d-none');
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
          init();
        }
      });
    });
  });

})();
