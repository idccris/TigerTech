export default function PrinterVisual({ tone }: { tone: string }) {
  return <div className={`product-visual ${tone}`} aria-hidden="true">
    <div className="orbit orbit-one" /><div className="orbit orbit-two" />
    <div className="machine"><div className="machine-top"><span /></div>
      <div className="machine-window"><div className="printed-shape" /></div>
      <div className="machine-base" />
    </div>
  </div>;
}
