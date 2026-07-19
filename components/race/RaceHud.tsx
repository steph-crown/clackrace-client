type RaceHudProps = {
  wpm: number;
  accuracy: number;
};

export function RaceHud({ wpm, accuracy }: RaceHudProps) {
  return (
    <div className="flex gap-4 font-mono text-sm">
      <span className="text-cyan">{Math.round(wpm)} WPM</span>
      <span className="text-chalk-muted">{Math.round(accuracy)}%</span>
    </div>
  );
}
