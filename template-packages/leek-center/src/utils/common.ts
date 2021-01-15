let vscode:
  | undefined
  | {
      postMessage(message: any): Thenable<boolean>;
      getState: () => void;
      setState: (newState: object) => void;
    };
const NODF = () => {};

export let isInVSCode = false;

function getVscode() {
  if (!vscode) {
    try {
      vscode = acquireVsCodeApi();
      isInVSCode = true;
    } catch (err) {
      console.warn('runingttime is not in vscode');
      vscode = {
        getState: NODF,
        postMessage: (message) => Promise.resolve(true),
        setState: NODF,
      };
    }
  }
  return vscode;
}
getVscode();

export function postMessage(command: string, data: any = {}) {
  console.log('post command: ', command, data);
  getVscode()?.postMessage({
    command,
    data,
  });
}

export function updownClassName(updown: number) {
  if (updown > 0) {
    return 'red';
  } else if (updown < 0) {
    return 'green';
  } else {
    return '';
  }
}

export const formatNumber = (
  val: number | string = 0,
  fixed: number = 2,
  format = true
): string => {
  const num = parseInt(val.toString());
  if (format) {
    if (num > 1000 * 10000) {
      return (num / (10000 * 10000)).toFixed(fixed) + '亿';
    } else if (num > 1000) {
      return (num / 10000).toFixed(fixed) + '万';
    }
  }
  return `${num.toFixed(fixed)}`;
};

export async function fetchTryHandler<S>(fn: (...args: any[]) => Promise<S>, ...args: any[]) {
  let result: S | undefined = void 0;
  try {
    if (!fn) return result;
    result = await fn.apply(void 0, args);
  } catch (err) {
    console.error(err);
  } finally {
    return result;
  }
}
