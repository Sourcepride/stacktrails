import { useRef, useSyncExternalStore } from "react";

type ScrollStore = {
  distanceFromBottom: number;
  isNearBottom: boolean;
  scrollTop: number;
};

// Create a store for scroll position
function createScrollStore(element: HTMLElement | null, threshold = 100) {
  let listeners: Array<() => void> = [];
  let currentState: ScrollStore = {
    distanceFromBottom: 0,
    isNearBottom: true,
    scrollTop: 0,
  };

  const updateState = () => {
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    currentState = {
      distanceFromBottom,
      isNearBottom: distanceFromBottom <= threshold,
      scrollTop,
    };

    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  };

  const getSnapshot = () => currentState;

  const getServerSnapshot = () => currentState;

  // Attach scroll listener to element
  if (element) {
    element.addEventListener("scroll", updateState);
    // Initial state
    updateState();
  }

  return {
    subscribe,
    getSnapshot,
    getServerSnapshot,
    cleanup: () => {
      if (element) {
        element.removeEventListener("scroll", updateState);
      }
      listeners = [];
    },
  };
}

export function useScrollPosition(
  containerRef: React.RefObject<HTMLElement | null>,
  threshold = 100
) {
  const element = containerRef.current;
  const valueRef = useRef({
    distanceFromBottom: 0,
    isNearBottom: true,
    scrollTop: 0,
  });

  // Create store instance
  const storeRef = useSyncExternalStore(
    (callback) => {
      if (!element) return () => {};

      const store = createScrollStore(element, threshold);
      const unsubscribe = store.subscribe(callback);

      return () => {
        unsubscribe();
        store.cleanup();
      };
    },
    () => {
      const storedValue = valueRef.current;
      if (!element) {
        return storedValue;
      }

      const { scrollTop, scrollHeight, clientHeight } = element;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      if (
        storedValue.distanceFromBottom === distanceFromBottom &&
        storedValue.scrollTop === scrollTop &&
        storedValue.isNearBottom === distanceFromBottom <= threshold
      ) {
        return storedValue;
      }

      valueRef.current = {
        distanceFromBottom,
        isNearBottom: distanceFromBottom <= threshold,
        scrollTop,
      };

      return valueRef.current;
    },
    () => ({
      distanceFromBottom: 0,
      isNearBottom: true,
      scrollTop: 0,
    })
  );

  return storeRef;
}
