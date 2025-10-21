export function deBounce(callback: any, timeout = 500) {
  let timer: number;

  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback(...args);
    }, timeout) as unknown as number;
  };
}
