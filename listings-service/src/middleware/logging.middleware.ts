import chalk from "chalk";

const logger = (req: any, res: any, next: any) => {
  let method = req.method;
  let url = req.url;
  const start = process.hrtime();
  next();
  res.on("finish", () => {
    const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);
    let status = res.statusCode;
    let log = `${method} '${url}' ${status} ${durationInMilliseconds.toLocaleString()} ms`;
    console.debug(new Date().toISOString() + chalk.cyan(` [TRACE] ${log}`));
  });
};

const getActualRequestDurationInMilliseconds = (start: any) => {
  const NS_PER_SEC = 1e9; //  convert to nanoseconds
  const NS_TO_MS = 1e6; // convert to milliseconds
  const diff = process.hrtime(start);
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

export { logger };