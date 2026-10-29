export function AppleLoader({ label = "Loading" }: { label?: string }) {
  return (
    <span className="inline-flex items-center justify-center" role="status" aria-label={label}>
      <span className="apple-loader" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <span
            key={index}
            className="apple-loader__bar"
            style={{ transform: `rotate(${index * 45}deg) translateY(-7px)`, animationDelay: `${index * 0.1}s` }}
          />
        ))}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
