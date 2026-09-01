import { LOGO_PATHS } from "@/lib/logoPaths";

export default function LogoIcon({ width = 52, height = 38 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 97 70" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {LOGO_PATHS.map((d, i) => (
        <path key={i} fillRule="evenodd" clipRule="evenodd" d={d} />
      ))}
    </svg>
  );
}
