
(function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Navbar links active state on scroll
   */
  let navbarlinks = select('#navbar .scrollto', true);
const navbarlinksActive = () => {
  let position = window.scrollY + 200;
  navbarlinks.forEach(navbarlink => {
    // Determine if the current navbarlink is a dropdown or a direct link
    let targetLink = navbarlink.classList.contains('dropdown') ? navbarlink.querySelector('a') : navbarlink;
    
    if (!targetLink.hash) return;
    let section = select(targetLink.hash);
    if (!section) return;
    
    if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
      // Add 'active' class to the parent li if it's a dropdown
      if (navbarlink.classList.contains('dropdown')) {
        navbarlink.classList.add('active');
      } else {
        targetLink.classList.add('active');
      }
    } else {
      // Remove 'active' class from the parent li if it's a dropdown
      if (navbarlink.classList.contains('dropdown')) {
        navbarlink.classList.remove('active');
      } else {
        targetLink.classList.remove('active');
      }
    }
  });
}
window.addEventListener('load', navbarlinksActive);
onscroll(document, navbarlinksActive);


  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Toggle .header-scrolled class to #header when page is scrolled
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    const headerScrolled = () => {
      if (window.scrollY > 100) {
        selectHeader.classList.add('header-scrolled')
      } else {
        selectHeader.classList.remove('header-scrolled')
      }
    }
    window.addEventListener('load', headerScrolled)
    onscroll(document, headerScrolled)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault()
      this.nextElementSibling.classList.toggle('dropdown-active')
    }
  }, true)

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        // Close any open dropdowns
        let activeDropdowns = navbar.querySelectorAll('.dropdown-active')
        activeDropdowns.forEach(dd => dd.classList.remove('dropdown-active'))
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener('load', () => {
    let portfolioContainer = select('.portfolio-container');
    if (portfolioContainer) {
      let portfolioIsotope = new Isotope(portfolioContainer, {
        itemSelector: '.portfolio-item',
      });

      let portfolioFilters = select('#portfolio-flters li', true);

      on('click', '#portfolio-flters li', function(e) {
        e.preventDefault();
        portfolioFilters.forEach(function(el) {
          el.classList.remove('filter-active');
        });
        this.classList.add('filter-active');

        portfolioIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        portfolioIsotope.on('arrangeComplete', function() {
          AOS.refresh()
        });
      }, true);
    }

  });

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Portfolio details slider
   */
  new Swiper('.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Testimonials slider
   */
  new Swiper('.testimonials-slider', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 20
      },

      1200: {
        slidesPerView: 3,
        spaceBetween: 20
      }
    }
  });

  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  });

  const isInViewport = (el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  

  /**
   * Function to start the bar animation
   */
  const startBarAnimation = () => {
    $('.bar').each(function(i) {  
      let $bar = $(this);
      // Ensure the count span is only added once
      if ($bar.find('.count').length === 0) {
          $bar.append('<span class="count"></span>');
      }

      setTimeout(function() {
        // Parse the value to a float, ensuring it considers decimal places
        let value = parseFloat($bar.attr('data-percent'));
        // Calculate the width percentage (value of 5 equals 100% width)
        let percentageWidth = (value / 5) * 100;

        // Set the bar width according to the calculated percentage
        $bar.css('width', percentageWidth + '%');      
      }, i * 100);
    });

    $('.count').each(function() {
        let $this = $(this);
        $this.prop('Counter', 0).animate({
            Counter: $this.parent('.bar').attr('data-percent')
        }, {
            duration: 2000,
            easing: 'swing',
            step: function(now) {
                // Update to display the value with two decimal places
                $this.text(now.toFixed(2));
            }
        });
    });
}

let animated = false;

const onScrollAnimateBars = () => {
    const barsSection = select('.wrap'); // Assuming '.wrap' is the section containing the bars
    if (barsSection && isInViewport(barsSection) && !animated) {
      startBarAnimation();
      animated = true; // Ensure animation only starts once
    }
}

// Listen for scroll events
window.addEventListener('scroll', onScrollAnimateBars);

// Call on load in case the section is already in view on page load
window.addEventListener('load', onScrollAnimateBars);
``


})()

