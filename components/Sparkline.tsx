interface SparklineProps {
  positive?: boolean;
}

export default function Sparkline({ positive = true }: SparklineProps) {
  const positivePoints = "0,24 10,20 20,22 30,16 40,18 50,12 60,14 70,8 80,10";
  const negativePoints = "0,10 10,12 20,8 30,14 40,10 50,16 60,14 70,20 80,18";
  const color = positive ? "#16A34A" : "#D97706";
  const points = positive ? positivePoints : negativePoints;

  return (
    <svg width="80" height="32" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
