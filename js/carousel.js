class AdCarousel extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            position: relative;
            width: 100%;
            max-width: 600px;
            height: 250px;
            overflow: hidden;
            border-radius: 10px;
            border: 2px solid #ccc;
            box-sizing: border-box;
            font-family: sans-serif;
          }
          .track {
            display: flex;
            width: 100%;
            height: 100%;
            transition: transform 0.5s ease-in-out;
          }
          ::slotted(div) {
            flex: 0 0 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2em;
            background: #f4f4f4;
            box-sizing: border-box;
            padding: 1em;
            user-select: none;
          }
          .nav {
            position: absolute;
            top: 50%;
            width: 100%;
            display: flex;
            justify-content: space-between;
            transform: translateY(-50%);
            pointer-events: none;
          }
          button {
            background: rgba(0, 0, 0, 0.4);
            color: white;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            padding: 0.2em 0.6em;
            pointer-events: auto;
            transition: background 0.3s;
            user-select: none;
          }
          button:hover {
            background: rgba(0, 0, 0, 0.6);
          }
          .dots {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 0.5rem;
          }
          .dot {
            width: 12px;
            height: 12px;
            background: #ccc;
            border-radius: 50%;
            cursor: pointer;
            transition: background 0.3s;
            user-select: none;
          }
          .dot.active {
            background: #333;
          }
        </style>
        <div class="track">
          <slot></slot>
        </div>
        <div class="nav">
          <button class="prev"><</button>
          <button class="next">></button>
        </div>
        <div class="dots"></div>
      `;

      this._track = this.shadowRoot.querySelector('.track');
      this._slot = this.shadowRoot.querySelector('slot');
      this._prevBtn = this.shadowRoot.querySelector('.prev');
      this._nextBtn = this.shadowRoot.querySelector('.next');
      this._dotsContainer = this.shadowRoot.querySelector('.dots');

      this._currentIndex = 0;
      this._intervalId = null;
    }

    connectedCallback() {
      requestAnimationFrame(() => {
        this._updateSlides();
        this._setupEvents();
        this._startAutoSlide();
      });
    }

    disconnectedCallback() {
      this._stopAutoSlide();
    }

    _updateSlides() {
      this._slides = this._slot.assignedElements().filter(el => el.nodeType === 1);
      this._slideCount = this._slides.length;

      this._track.style.transform = 'translateX(0)';
      this._dotsContainer.innerHTML = '';

      this._dots = [];

      for (let i = 0; i < this._slideCount; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
          this._goToSlide(i);
          this._resetAutoSlide();
        });
        this._dotsContainer.appendChild(dot);
        this._dots.push(dot);
      }
    }

    _setupEvents() {
      this._prevBtn.addEventListener('click', () => {
        this._goToSlide(this._currentIndex - 1);
        this._resetAutoSlide();
      });

      this._nextBtn.addEventListener('click', () => {
        this._goToSlide(this._currentIndex + 1);
        this._resetAutoSlide();
      });

      this.addEventListener('mouseenter', () => this._stopAutoSlide());
      this.addEventListener('mouseleave', () => this._startAutoSlide());

      this._slot.addEventListener('slotchange', () => {
        this._updateSlides();
        this._goToSlide(0);
      });
    }

    _goToSlide(index) {
      if (this._slideCount === 0) return;

      this._currentIndex = (index + this._slideCount) % this._slideCount;
      this._track.style.transform = `translateX(-${this._currentIndex * 100}%)`;

      this._dots.forEach(dot => dot.classList.remove('active'));
      if (this._dots[this._currentIndex]) {
        this._dots[this._currentIndex].classList.add('active');
      }
    }

    _startAutoSlide() {
      if (this._intervalId || this._slideCount <= 1) return;

      const interval = parseInt(this.getAttribute('interval')) || 4000;
      this._intervalId = setInterval(() => {
        this._goToSlide(this._currentIndex + 1);
      }, interval);
    }

    _stopAutoSlide() {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }

    _resetAutoSlide() {
      this._stopAutoSlide();
      this._startAutoSlide();
    }
  }

  customElements.define('ad-carousel', AdCarousel);
/* how to use <ad-carousel>:
<ad-carousel interval="5000" style="max-width: 500px; height: 500px;">
  <div> <p>Ad 1 text</p> </div>
  <div> <img src="img.png" alt="Ad 2 image" /> </div>
  <div> <div> various html content here </div> </div>
</ad-carousel>
*/
