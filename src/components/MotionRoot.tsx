"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

type Props = {
  children: ReactNode;
};

const MOTION_SELECTOR = "[data-motion]";
const STAGGER_SELECTOR = "[data-motion-stagger]";

export default function MotionRoot({ children }: Props) {
  const pathname = usePathname();

  useScrollReveal(pathname);
  usePageTransitions(pathname);

  return (
    <div data-page-transition>
      {children}
    </div>
  );
}

function useScrollReveal(pathname: string) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const { document, matchMedia } = window;
    const reduceQuery = matchMedia("(prefers-reduced-motion: reduce)");

    const prepareStagger = (scope: ParentNode = document) => {
      const groupsSet = new Set<HTMLElement>();

      if (scope instanceof HTMLElement && scope.matches(STAGGER_SELECTOR)) {
        groupsSet.add(scope);
      }

      if ("querySelectorAll" in scope) {
        const found = scope.querySelectorAll<HTMLElement>(STAGGER_SELECTOR);
        found.forEach((group) => groupsSet.add(group));
      }

      groupsSet.forEach((group) => {
        const stepAttr = group.getAttribute("data-motion-stagger");
        const step = Number.parseInt(stepAttr ?? "80", 10);
        const items = Array.from(group.querySelectorAll<HTMLElement>(MOTION_SELECTOR)).filter(
          (item) => item.closest(STAGGER_SELECTOR) === group
        );

        items.forEach((item, index) => {
          if (item.hasAttribute("data-motion-delay")) {
            applyDelayAttr(item);
            return;
          }
          item.style.setProperty("--motion-delay", `${index * step}ms`);
        });
      });
    };

    const revealNow = (el: HTMLElement) => {
      el.setAttribute("data-motion-visible", "true");
    };

    const hide = (el: HTMLElement) => {
      el.removeAttribute("data-motion-visible");
    };

    const applyDelayAttr = (el: HTMLElement) => {
      const attr = el.getAttribute("data-motion-delay");
      if (!attr) return;
      const trimmed = attr.trim();
      if (!trimmed) return;
      const normalised = /ms$|s$/i.test(trimmed) ? trimmed : `${Number.parseFloat(trimmed) || 0}ms`;
      el.style.setProperty("--motion-delay", normalised);
    };

    prepareStagger();

    const elements = Array.from(document.querySelectorAll<HTMLElement>(MOTION_SELECTOR));
    if (!elements.length) return;

    if (reduceQuery.matches) {
      elements.forEach(revealNow);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const repeat = target.dataset.motionRepeat === "true";
          if (entry.isIntersecting) {
            revealNow(target);
            if (!repeat) observer.unobserve(target);
          } else if (repeat) {
            hide(target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    elements.forEach((el) => {
      applyDelayAttr(el);
      observer.observe(el);
    });

    const mutationObserver = new MutationObserver((mutations) => {
      const groupsToRefresh = new Set<HTMLElement>();

      mutations.forEach((mutation) => {
        if (mutation.target instanceof HTMLElement) {
          const ownerGroup = mutation.target.closest<HTMLElement>(STAGGER_SELECTOR);
          if (ownerGroup) groupsToRefresh.add(ownerGroup);
        }

        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          if (node.matches(STAGGER_SELECTOR)) {
            groupsToRefresh.add(node);
          }

          const nestedGroups = node.querySelectorAll<HTMLElement>(STAGGER_SELECTOR);
          nestedGroups.forEach((group) => groupsToRefresh.add(group));

          const parentGroup = node.closest<HTMLElement>(STAGGER_SELECTOR);
          if (parentGroup) groupsToRefresh.add(parentGroup);

          if (node.matches(MOTION_SELECTOR)) {
            applyDelayAttr(node);
            observer.observe(node);
          }

          const motionNodes = Array.from(node.querySelectorAll<HTMLElement>(MOTION_SELECTOR));
          motionNodes.forEach((motionNode) => {
            applyDelayAttr(motionNode);
            observer.observe(motionNode);
          });
        });
      });

      groupsToRefresh.forEach((group) => {
        prepareStagger(group);
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const handleReduceChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      observer.disconnect();
      mutationObserver.disconnect();
      const all = Array.from(document.querySelectorAll<HTMLElement>(MOTION_SELECTOR));
      all.forEach(revealNow);
    };

    reduceQuery.addEventListener("change", handleReduceChange);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      reduceQuery.removeEventListener("change", handleReduceChange);
    };
  }, [pathname]);
}

function usePageTransitions(pathname: string) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { document, matchMedia } = window;
    const reduceQuery = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceQuery.matches) return;

    const html = document.documentElement;
    html.dataset.transition = "entering";

    const timer = window.setTimeout(() => {
      if (html.dataset.transition === "entering") {
        html.removeAttribute("data-transition");
      }
    }, 600);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { document, location, matchMedia } = window;
    const reduceQuery = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceQuery.matches) return;

    const html = document.documentElement;

    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.dataset.disableTransition === "true") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, location.href);
      } catch {
        return;
      }

      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search && url.hash === location.hash) return;

      html.dataset.transition = "leaving";
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);
}
