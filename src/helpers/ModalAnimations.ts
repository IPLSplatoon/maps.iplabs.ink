import { gsap } from "gsap";

export function getModalOpenTimeline(modalElement: HTMLElement) : GSAPTimeline {
    const reducedMotion = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;
    const tl = gsap.timeline({paused: true});

    tl.fromTo(modalElement,{
        opacity: 0,
    }, {
        opacity: 1,
        duration: .15,
        display: 'flex',
        ease: 'power2.out',
    })

    if (!reducedMotion) {
        tl.fromTo(modalElement.children,{
            opacity: 0,
            x: 30,
        }, {
            opacity: 1,
            x: 0,
            duration: .25,
            ease: 'power2.out',
        })
    } else {
        tl.fromTo(modalElement.children,{
            opacity: 0,
        }, {
            opacity: 1,
            duration: .25,
            ease: 'power2.out',
        })
    }

    return tl;
}

export function getModalCloseTimeline(modalElement: HTMLElement, options: GSAPTimelineVars) : GSAPTimeline {
    const reducedMotion = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;
    const tl = gsap.timeline({paused: true, ...options});

    tl.to(modalElement.children, {
        opacity: 0,
        duration: .12,
        ease: 'power2.in',
        x: reducedMotion ? 0 : -20,
    })

    tl.to(modalElement, {
        opacity: 0,
        display: 'none',
        duration: .12,
        ease: 'power2.in'
    })

    return tl;
}