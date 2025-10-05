document.addEventListener("DOMContentLoaded", function(event) { 
    AOS.init();

    grained('#accent-grain', {
        "animate": true,
        "patternWidth": 58.5,
        "patternHeight": 500,
        "grainOpacity": 0.07,
        "grainDensity": 1,
        "grainWidth": 1,
        "grainHeight": 1
    });

    window.addEventListener('scroll', function() {
        const accentLogo = document.querySelector('#accent-logo');
        let scrollPosition = window.pageYOffset;
        const parallaxSpeed = 0.125;
        accentLogo.style.transform = 'translateY(-' + (scrollPosition * parallaxSpeed) + 'px)';
    });

    const accentType = document.querySelector('#accent-type');
    let accentTypeIndex = 1;

    setInterval(() => {
        accentType.classList.add('hide');

        let text = "";
        switch (accentTypeIndex) {
            case 1:
                type = 'Coding ';
                break;
            case 2:
                type = 'Design ';
                break;
            default:
                type = 'Pinging ';
                break;
        }
        
        setTimeout(() => {
            accentType.innerHTML = type;
            accentType.classList.remove('hide');
        }, 750);

        accentTypeIndex = accentTypeIndex > 2 ? 1 : accentTypeIndex + 1;
    }, 5000);

    const accentPreloader = document.getElementById("accent-preloader");

    accentPreloader.classList.add("out");
    accentPreloader.addEventListener('transitionend', () => {
        setTimeout(() => {
            accentPreloader.remove();
        }, 500);
    });
});

function initCap(text) {
    return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}