import semver from "semver";

// returns if current version >= target version
export function ServerVersionGTE(current?: string, target?: string): boolean {
  if (!target || !current) {
    return false;
  }
  if (current === "development") {
    return true;
  }
  if (target.includes("-beta") && !current.includes("-beta") && !current.includes("-staging")) {
    return true;
  }
  target = target.replace("v", "")
  target = target.replace("-beta", "");
  target = target.replace("-staging", "")
  
  current = current.replace("v", "")
  current = current.replace("-beta", "");
  current = current.replace("-staging", "");
  return semver.gte(current, target);
}