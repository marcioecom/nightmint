export function VideoBackground() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Base dark gradient */}
      <div className="absolute inset-0 bg-[#050508]" />
      {/* Subtle radial glow for depth */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(15, 25, 40, 0.8), transparent), " +
            "radial-gradient(ellipse 50% 40% at 20% 80%, rgba(10, 15, 30, 0.6), transparent)",
        }}
      />
      {/* Noise texture overlay for glass effect */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />
    </div>
  );
}
