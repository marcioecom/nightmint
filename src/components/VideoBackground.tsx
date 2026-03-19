export function VideoBackground() {
  return (
    <div className="fixed inset-0 z-0">
      {/* Gradient placeholder until video is sourced */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #0a0a12, #0d0d18, #080812)",
        }}
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
