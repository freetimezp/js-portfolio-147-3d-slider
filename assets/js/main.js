import { slides } from "./slides.js";

console.log(slides);

const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);


const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.PlaneGeometry(2, 2);
const uniforms = {
    iTime: { value: 0 },
    iResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
    },
    scrollOffset: { value: 0 }
};

const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

let lastTime = 0;
function animateTunnel(time) {
    const deltaTime = time - lastTime;
    lastTime = time;
    uniforms.iTime.value += deltaTime * 0.001;
    renderer.render(scene, camera);

    requestAnimationFrame(animateTunnel);
}

animateTunnel(0);

window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    uniforms.iResolution.value.set(width, height);
});

gsap.registerPlugin(ScrollTrigger);

const totalSlides = 10;
const zStep = 2500;
const initialZ = -22500;

function generateSlides() {
    const slider = document.querySelector(".slider");
    slider.innerHTML = "";

    for (let i = 1; i <= totalSlides; i++) {
        const slide = document.createElement("div");
        slide.className = "slide";
        slide.id = `slide-${i}`;

        const slideImg = document.createElement("div");
        slideImg.className = "slide-img";

        const img = document.createElement("img");
        img.src = `./assets/images/item${i}.jpg`;
        img.alt = "";

        const slideCopy = document.createElement("div");
        slideCopy.className = "slide-copy";
        slideCopy.innerHTML = `<p>${slides[i - 1].title}</p><p>${slides[i - 1].id}</p>`;

        slideImg.appendChild(img);
        slide.appendChild(slideImg);
        slide.appendChild(slideCopy);
        slider.appendChild(slide);

        const zPosition = initialZ + (i - 1) * zStep;
        const xPosition = i % 2 === 0 ? "30%" : "70%";
        const opacity = i === totalSlides ? 1 : i === totalSlides - 1 ? 0 : 0;

        gsap.set(slide, {
            top: "50%",
            left: xPosition,
            xPercent: -50,
            yPercent: -50,
            z: zPosition,
            opacity: opacity
        });
    }
}

window.addEventListener("load", function () {
    generateSlides();

    const slides = gsap.utils.toArray(".slide");

    function getInitialTranslateZ(slide) {
        return gsap.getProperty(slide, "z");
    }

    function mapRange(value, inMin, inMax, outMin, outMax) {
        return (
            ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
        );
    }

    ScrollTrigger.create({
        trigger: ".container",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
            uniforms.scrollOffset.value = self.progress;
        }
    });

    slides.forEach((slide, index) => {
        const initialZ = getInitialTranslateZ(slide);

        ScrollTrigger.create({
            trigger: ".container",
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;
                const zIncrement = progress * 22500;
                const currentZ = initialZ + zIncrement;

                let opacity;
                if (currentZ >= -2500) {
                    opacity = mapRange(currentZ, -2500, 0, 0, 1);
                } else {
                    opacity = mapRange(currentZ, -5000, -2500, 0, 0);
                }

                slide.style.opacity = opacity;
                slide.style.transform = `translateX(-50%) translateY(-50%) translateZ(${currentZ}px)`;
            }
        });
    });
});













