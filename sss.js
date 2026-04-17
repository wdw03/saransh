const spans = document.querySelectorAll(".herolftimain h1 span");
const hoverImg = document.querySelector(".hover-image");


// 👇 sabse pehle
gsap.registerPlugin(ScrollTrigger);

const loco = new LocomotiveScroll({
    el: document.querySelector("#main"),
    smooth: true
});

loco.on("scroll", ScrollTrigger.update);

ScrollTrigger.scrollerProxy("#main", {
    scrollTop(value) {
        return arguments.length
            ? loco.scrollTo(value, 0, 0)
            : loco.scroll.instance.scroll.y;
    },
    getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    }
});

ScrollTrigger.addEventListener("refresh", () => loco.update());
ScrollTrigger.refresh();


if (hoverImg && spans.length && typeof gsap !== "undefined") {
    gsap.set(hoverImg, {
        xPercent: -50,
        yPercent: -50,
        opacity: 0,
        scale: 0.8
    });

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let pos = { x: mouse.x, y: mouse.y };

    gsap.ticker.add(() => {
        pos.x += (mouse.x - pos.x) * 0.12;
        pos.y += (mouse.y - pos.y) * 0.12;

        gsap.set(hoverImg, {
            x: pos.x,
            y: pos.y
        });
    });

    spans.forEach((span) => {
        span.addEventListener("mouseenter", () => {
            const img = span.getAttribute("data-img");

            hoverImg.style.backgroundImage = `url(${img})`;

            gsap.to(hoverImg, {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                ease: "power3.out"
            });
        });

        span.addEventListener("mousemove", (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
        });

        span.addEventListener("mouseleave", () => {
            gsap.to(hoverImg, {
                opacity: 0,
                scale: 0.7,
                duration: 0.3,
                ease: "power3.in"
            });
        });
    });
}

const slider = document.querySelector(".slider");
const sliderWindow = document.querySelector(".sliderwindow");
const slidesTrack = document.querySelector(".slides");
const nextBtn = document.querySelector(".next");
const prevBtn = document.querySelector(".prev");
const leftHoverZone = document.querySelector(".sliderhover-left");
const rightHoverZone = document.querySelector(".sliderhover-right");
const playIcon = document.querySelector(".playicons");
const pauseIcon = document.querySelector(".pauseincons");

if (slider && sliderWindow && slidesTrack && nextBtn && prevBtn && typeof gsap !== "undefined") {
    const originalSlides = Array.from(slidesTrack.querySelectorAll(".slide"));

    if (originalSlides.length >= 2) {
        const autoplayDelay = 1000;
        const slideDuration = 1.35;

        const createClone = (slide) => {
            const clone = slide.cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            return clone;
        };

        const leadingClones = originalSlides.slice(-2).map(createClone);
        const trailingClones = originalSlides.slice(0, 2).map(createClone);

        slidesTrack.replaceChildren(...leadingClones, ...originalSlides, ...trailingClones);

        let currentIndex = 2;
        let isAnimating = false;
        let autoplayId = null;
        let isHoverPaused = false;

        function showPlayIcon() {
            if (playIcon && pauseIcon) {
                playIcon.style.opacity = "1";
                pauseIcon.style.opacity = "0";
            }
        }

        function showPauseIcon() {
            if (playIcon && pauseIcon) {
                playIcon.style.opacity = "0";
                pauseIcon.style.opacity = "1";
            }
        }

        function pausePagination() {
            slider.classList.add("is-paused");
        }

        function resumePagination() {
            slider.classList.remove("is-paused");
        }

        function stopSliderOnHover() {
            isHoverPaused = true;
            stopAutoplay();
            pausePagination();
            showPauseIcon();
        }

        function startSliderOnLeave() {
            isHoverPaused = false;
            resumePagination();
            showPlayIcon();
            startAutoplay();
        }

        const getGap = () => {
            const styles = window.getComputedStyle(slidesTrack);
            return parseFloat(styles.gap) || 0;
        };

        const syncSliderMetrics = () => {
            const gap = getGap();
            const visibleWidth = sliderWindow.clientWidth;
            const slideWidth = (visibleWidth - gap * 3) / 3;

            slider.style.setProperty("--slide-width", `${slideWidth}px`);
        };

        const getSlideWidth = () => {
            const firstSlide = slidesTrack.querySelector(".slide");
            return firstSlide ? firstSlide.getBoundingClientRect().width : 0;
        };

        const getStep = () => {
            return getSlideWidth() + getGap();
        };

        const getOffset = (index) => {
            const slideWidth = getSlideWidth();
            const gap = getGap();
            return index * getStep() - (slideWidth / 2 + gap);
        };

        const jumpToCurrent = () => {
            gsap.set(slidesTrack, { x: -getOffset(currentIndex) });
        };

        const normalizeIndex = () => {
            if (currentIndex <= 1) {
                currentIndex += originalSlides.length;
                jumpToCurrent();
            } else if (currentIndex >= originalSlides.length + 2) {
                currentIndex -= originalSlides.length;
                jumpToCurrent();
            }
        };

        const stopAutoplay = () => {
            if (autoplayId !== null) {
                clearTimeout(autoplayId);
                autoplayId = null;
            }
        };

        const startAutoplay = () => {
            if (autoplayId !== null || isHoverPaused) {
                return;
            }

            autoplayId = setTimeout(() => {
                autoplayId = null;
                moveSlides(1);
            }, autoplayDelay);
        };

        const restartAutoplay = () => {
            stopAutoplay();

            if (!isHoverPaused) {
                showPlayIcon();
                resumePagination();
                startAutoplay();
            }
        };

        const moveSlides = (direction) => {
            if (isAnimating) {
                return;
            }

            stopAutoplay();
            currentIndex += direction;

            const targetOffset = getOffset(currentIndex);
            isAnimating = true;

            gsap.to(slidesTrack, {
                x: -targetOffset,
                duration: slideDuration,
                ease: "power4.inOut",
                overwrite: "auto",
                onComplete: () => {
                    normalizeIndex();
                    isAnimating = false;

                    if (!isHoverPaused) {
                        showPlayIcon();
                        resumePagination();
                        startAutoplay();
                    }
                }
            });
        };

        const bindHoverButtonMotion = (zone, direction) => {
            if (!zone) {
                return;
            }

            const resetMotion = () => {
                gsap.to(zone, {
                    duration: 0.35,
                    ease: "power3.out",
                    overwrite: "auto",
                    "--float-x": "0px",
                    "--float-y": "0px",
                    "--float-rotate": "0deg"
                });
            };

            zone.addEventListener("pointermove", (event) => {
                const rect = zone.getBoundingClientRect();
                const relativeX = event.clientX - rect.left;
                const relativeY = event.clientY - rect.top;
                const normalizedX = relativeX / rect.width - 0.5;
                const normalizedY = relativeY / rect.height - 0.5;
                const offsetX = normalizedX * 26;
                const offsetY = normalizedY * 18;
                const rotation = normalizedX * 18 * direction;

                gsap.to(zone, {
                    duration: 0.18,
                    ease: "power2.out",
                    overwrite: "auto",
                    "--float-x": `${offsetX}px`,
                    "--float-y": `${offsetY}px`,
                    "--float-rotate": `${rotation}deg`
                });
            });

            zone.addEventListener("pointerleave", resetMotion);
            zone.addEventListener("pointercancel", resetMotion);
        };

        syncSliderMetrics();
        jumpToCurrent();
        bindHoverButtonMotion(leftHoverZone, -1);
        bindHoverButtonMotion(rightHoverZone, 1);
        showPlayIcon();
        resumePagination();

        nextBtn.addEventListener("click", (event) => {
            moveSlides(1);
            event.currentTarget.blur();
        });

        prevBtn.addEventListener("click", (event) => {
            moveSlides(-1);
            event.currentTarget.blur();
        });

        sliderWindow.addEventListener("mouseenter", () => {
            stopSliderOnHover();
        });

        sliderWindow.addEventListener("mouseleave", () => {
            startSliderOnLeave();
        });

        window.addEventListener("resize", () => {
            if (!isAnimating) {
                syncSliderMetrics();
                jumpToCurrent();
            }
            restartAutoplay();
        });

        startAutoplay();
    }
}


const slides = document.querySelectorAll(".slide");

function slideshober() {
    slides.forEach((slide) => {
        slide.addEventListener("mouseenter", () => {
            gsap.to(slide, {
                backgroundPosition: "50% 0%",
                duration: 0.8,
                ease: "power3.out",
                overwrite: "auto"
            })
        })
        slide.addEventListener("mouseleave", () => {
            gsap.to(slide, {
                backgroundPosition: "50% 100%",
                duration: 0.8,
                ease: "power3.out",
                overwrite: "auto"
            })
        })
    });
}

slideshober()