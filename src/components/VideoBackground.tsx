export function VideoBackground() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Base dark */}
      <div className="absolute inset-0 bg-[#040608]" />
      {/* Green/teal accent glow - like the Bloom planet effect */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 70% 50% at 75% 50%, rgba(16, 185, 129, 0.12), transparent 70%)",
            "radial-gradient(ellipse 40% 60% at 85% 30%, rgba(6, 182, 212, 0.08), transparent 60%)",
            "radial-gradient(ellipse 50% 40% at 60% 70%, rgba(16, 185, 129, 0.06), transparent 50%)",
            "radial-gradient(ellipse 30% 30% at 30% 60%, rgba(6, 95, 70, 0.1), transparent 50%)",
          ].join(", "),
        }}
      />
      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />
    </div>
  );
}
