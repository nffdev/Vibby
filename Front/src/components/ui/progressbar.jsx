
export default function ProgressBar({ currentStep, totalSteps }) {
  return (
    <div className="absolute inset-x-0 top-0 z-20 h-0.5 bg-white/10">
      <div
        className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500 transition-all duration-500 ease-out"
        style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
      ></div>
    </div>
  );
}
