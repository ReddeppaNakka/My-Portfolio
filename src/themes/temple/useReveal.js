import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Word-by-word heading reveals, staggered supporting elements and a soft
// fade/blur hand-off as each chapter leaves. All scoped to the theme root and
// fully reverted on unmount (theme switch / StrictMode double mount).
export function useReveal(rootRef, reduced) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return undefined;
    // heavy WebGL frames must not stall the reveals; restored on unmount
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // hero: plays on load
      const heroWords = root.querySelectorAll(".tp-hero .tp-wi");
      const heroBits = root.querySelectorAll(".tp-hero [data-reveal], .tp-hero .tp-scrollcue");
      gsap
        .timeline({ delay: 0.25 })
        .from(heroWords, { yPercent: 115, rotate: 2, duration: 1.5, ease: "expo.out", stagger: 0.12 })
        .from(heroBits, { autoAlpha: 0, y: 18, duration: 1, ease: "power3.out", stagger: 0.09 }, "-=1.0");

      root.querySelectorAll(".tp-chapter:not(.tp-hero) .tp-words").forEach((h) => {
        gsap.from(h.querySelectorAll(".tp-wi"), {
          yPercent: 115,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: h, start: "top 88%", once: true },
        });
      });

      const items = gsap.utils.toArray(root.querySelectorAll(".tp-chapter:not(.tp-hero) [data-reveal]"));
      gsap.set(items, { autoAlpha: 0, y: 28 });
      ScrollTrigger.batch(items, {
        start: "top 90%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1.05, ease: "power3.out", stagger: 0.08, overwrite: true }),
      });

      // chapter hand-off: the upper part of a chapter softly dims/blurs as it exits
      root.querySelectorAll(".tp-chapter").forEach((sec) => {
        if (sec.classList.contains("tp-footer")) return;
        const inner = sec.querySelector(".tp-chapter-inner");
        gsap.fromTo(
          inner,
          { opacity: 1, filter: "blur(0px)" },
          {
            opacity: 0.08,
            filter: "blur(6px)",
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: sec,
              start: "bottom 22%",
              end: "bottom -8%",
              scrub: true,
              // a lingering filter would break the panels' backdrop blur
              onLeaveBack: () => gsap.set(inner, { clearProps: "filter,opacity" }),
            },
          }
        );
        const kanji = sec.querySelector(".tp-kanji-inner");
        if (kanji) {
          gsap.fromTo(
            kanji,
            { autoAlpha: 0, y: 40, filter: "blur(10px)" },
            {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 1.6,
              ease: "power2.out",
              scrollTrigger: { trigger: sec, start: "top 70%", toggleActions: "play none none reverse" },
            }
          );
        }
      });
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    const t = window.setTimeout(refresh, 1200);

    return () => {
      window.clearTimeout(t);
      ctx.revert();
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, [rootRef, reduced]);
}
