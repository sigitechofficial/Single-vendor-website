import { useState, useEffect } from "react";

const Timer = ({ startTimeInMinutes }) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = localStorage.getItem("eta_minutes");
    return savedTime ? JSON.parse(savedTime) : startTimeInMinutes;
  });

  useEffect(() => {
    if (timeLeft <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        localStorage.setItem("eta_minutes", JSON.stringify(newTime));
        return newTime;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  return (
    <div>
      <h1>{timeLeft}</h1>
    </div>
  );
};

export default Timer;
