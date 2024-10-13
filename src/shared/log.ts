let verbose = false;


function log(level = 'info', ...msg: any[]) {
  const date = new Date();
  console.log(
    ` 🚀 「LeekFund」${date.toLocaleDateString()} ${date.toLocaleTimeString()} [${level || "info"
    }] `, ...msg
  );
}


const Log = {
  info: (...rest: any[]) => log("info", ...rest),
  warn: (msg: string) => log("warn", msg),
  error: (msg: string) => log("error", msg),
  debug: (msg: string) => verbose && log("debug", msg),
  log,
};

export default Log;
