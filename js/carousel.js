class AdCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

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
          transition: transform 0.5s ease-in-out;
          height: 100%;
        }

        .slide {
          flex: 0 0 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2em;
          box-sizing: border-box;
          padding: 1em;
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
        }

        .dot.active {
          background: #333;
        }
      </style>
      <div class="track"></div>
      <div class="nav">
        <button class="prev">&lt;</button>
        <button class="next">&gt;</button>
      </div>
      <div class="dots"></div>
    `;

    this.track = this.shadowRoot.querySelector(".track");
    this.prevBtn = this.shadowRoot.querySelector(".prev");
    this.nextBtn = this.shadowRoot.querySelector(".next");
    this.dotsContainer = this.shadowRoot.querySelector(".dots");
    this.interval = parseInt(this.getAttribute("interval") || 4000, 10);

    this.currentIndex = 0;
    this.intervalId = null;
    this.realSlides = [];
  }

  connectedCallback() {
    const children = Array.from(this.children);
    this.realSlideCount = children.length;

    // Move light DOM children into shadow DOM
    this.realSlides = children.map(child => {
      const slide = document.createElement("div");
      slide.classList.add("slide");
      slide.appendChild(child.cloneNode(true));
      this.track.appendChild(slide);
      return slide;
    });

    // Add a cloned first slide at the end for seamless looping
    const firstClone = this.realSlides[0].cloneNode(true);
    this.track.appendChild(firstClone);
    this.slides = [...this.realSlides, firstClone];

    // Remove original light DOM
    this.innerHTML = "";

    this._createDots();
    this._updateDots(0);
    this._goTo(0, false);

    this.prevBtn.addEventListener("click", () => {
      this._goTo(this.currentIndex - 1);
      this._resetAutoSlide();
    });

    this.nextBtn.addEventListener("click", () => {
      this._goTo(this.currentIndex + 1);
      this._resetAutoSlide();
    });

    this.addEventListener("mouseenter", () => this._stopAutoSlide());
    this.addEventListener("mouseleave", () => this._startAutoSlide());

    this._startAutoSlide();
  }

  disconnectedCallback() {
    this._stopAutoSlide();
  }

  _createDots() {
    this.dots = [];
    this.dotsContainer.innerHTML = "";

    for (let i = 0; i < this.realSlideCount; i++) {
      const dot = document.createElement("div");
      dot.className = "dot";
      dot.addEventListener("click", () => {
        this._goTo(i);
        this._resetAutoSlide();
      });
      this.dotsContainer.appendChild(dot);
      this.dots.push(dot);
    }
  }

  _updateDots(index) {
    this.dots.forEach(dot => dot.classList.remove("active"));
    if (this.dots[index]) this.dots[index].classList.add("active");
  }

  _goTo(index, animate = true) {
    const maxIndex = this.slides.length - 1;

    if (animate) {
      this.track.style.transition = "transform 0.5s ease-in-out";
    } else {
      this.track.style.transition = "none";
    }

    this.currentIndex = index;
    this.track.style.transform = `translateX(-${index * 100}%)`;

    // If we're going to the cloned last slide, schedule a jump
    if (index === this.slides.length - 1) {
      this._updateDots(0); // Show first dot
      this.track.addEventListener("transitionend", () => {
        this.track.style.transition = "none";
        this.track.style.transform = "translateX(0)";
        this.currentIndex = 0;
      }, { once: true });
    } else {
      this._updateDots(index);
    }
  }

  _startAutoSlide() {
    if (this.intervalId || this.realSlideCount <= 1) return;
    this.intervalId = setInterval(() => {
      this._goTo(this.currentIndex + 1);
    }, this.interval);
  }

  _stopAutoSlide() {
    clearInterval(this.intervalId);
    this.intervalId = null;
  }

  _resetAutoSlide() {
    this._stopAutoSlide();
    this._startAutoSlide();
  }
}

customElements.define("ad-carousel", AdCarousel);

/* how to use <ad-carousel>:
<ad-carousel interval="5000" style="max-width: 500px; height: 500px;">
  <div> <p>Ad 1 text</p> </div>
  <div> <img src="img.png" alt="Ad 2 image" /> </div>
  <div> <div> various html content here </div> </div>
</ad-carousel>
*/
