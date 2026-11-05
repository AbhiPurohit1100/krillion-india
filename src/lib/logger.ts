type LogLevel = "info" | "warn" | "error" | "debug";

export function logEvent(
  level: LogLevel,
  message: string,
  meta?: Record<string, any>
): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    service: "krillion-india",
    message,
    ...(meta || {}),
  };

  const jsonStr = JSON.stringify(payload);
  switch (level) {
    case "error":
      console.error(jsonStr);
      break;
    case "warn":
      console.warn(jsonStr);
      break;
    case "debug":
      if (process.env.NODE_ENV !== "production") console.debug(jsonStr);
      break;
    default:
      console.log(jsonStr);
      break;
  }
}

