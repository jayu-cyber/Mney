export function fixDecimals(data) {
  if (!data) return data;

  return JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (value && typeof value === "object" && typeof value.toNumber === "function") {
        return value.toNumber();
      }
      return value;
    })
  );
}

