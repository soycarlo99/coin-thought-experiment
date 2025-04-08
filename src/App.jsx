import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CoinStatus = {
  ACTIVE: "active",
  FLIPPING: "flipping",
  HEADS: "heads",
  TAILS: "tails",
  OUT: "out",
};

function App() {
  const [initialCoinCount, setInitialCoinCount] = useState(500);
  const [coins, setCoins] = useState([]);
  const [roundNumber, setRoundNumber] = useState(0);
  const [activeCoinCount, setActiveCoinCount] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [message, setMessage] = useState(
    "Set the number of coins and start the sequence.",
  );
  const [roundHistory, setRoundHistory] = useState([]);

  const simulationRef = useRef(null);

  const initializeCoins = (count) => {
    setMessage("Ready to start.");
    setRoundNumber(0);
    setActiveCoinCount(count);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      status: CoinStatus.ACTIVE,
    }));
  };

  useEffect(() => {
    if (!isSimulating) {
      setCoins(initializeCoins(initialCoinCount));
      setRoundHistory([]);
    }
  }, [initialCoinCount, isSimulating]);

  const handleNumberChange = (event) => {
    if (isSimulating) return;
    const value = parseInt(event.target.value, 10);
    setInitialCoinCount(isNaN(value) || value < 1 ? 1 : Math.min(value, 10000));
  };

  const runSimulation = useCallback(async () => {
    if (isSimulating) return;

    setIsSimulating(true);
    setRoundHistory([]);
    setMessage("Starting simulation...");
    let currentCoins = initializeCoins(initialCoinCount);
    setCoins(currentCoins);
    let currentRound = 0;
    simulationRef.current = true;

    await delay(500);
    let finalMessage = "";

    while (simulationRef.current) {
      const coinsToFlip = currentCoins.filter(
        (c) => c.status === CoinStatus.ACTIVE,
      );

      if (coinsToFlip.length === 0) {
        finalMessage = `Simulation Complete. No active coins after ${currentRound} rounds.`;
        setMessage(finalMessage);
        break;
      }

      currentRound++;
      setRoundNumber(currentRound);
      setActiveCoinCount(coinsToFlip.length);
      setMessage(
        `Round ${currentRound}: Flipping ${coinsToFlip.length} coin(s)...`,
      );

      let tempCoins = currentCoins.map((c) =>
        coinsToFlip.find((ctf) => ctf.id === c.id)
          ? { ...c, status: CoinStatus.FLIPPING }
          : c,
      );
      setCoins([...tempCoins]);
      await delay(200);
      let headsCount = 0;
      let tailsCount = 0;
      currentCoins = currentCoins.map((coin) => {
        if (coinsToFlip.find((ctf) => ctf.id === coin.id)) {
          const result =
            Math.random() < 0.5 ? CoinStatus.HEADS : CoinStatus.TAILS;
          if (result === CoinStatus.HEADS) headsCount++;
          else tailsCount++;
          return { ...coin, status: result };
        }
        return coin;
      });
      setCoins([...currentCoins]);
      setMessage(
        `Round ${currentRound} Results: ${headsCount} Heads, ${tailsCount} Tails.`,
      );

      const roundSummary = `Round ${currentRound}: Started with ${coinsToFlip.length}, Flipped ${headsCount} Heads, ${tailsCount} Tails.`;
      setRoundHistory((prevHistory) => [...prevHistory, roundSummary]);

      await delay(1200);
      if (!simulationRef.current) {
        finalMessage = "Simulation Reset.";
        break;
      }

      let nextActiveCount = 0;
      currentCoins = currentCoins.map((coin) => {
        if (coin.status === CoinStatus.HEADS) {
          nextActiveCount++;
          return { ...coin, status: CoinStatus.ACTIVE };
        } else if (coin.status === CoinStatus.TAILS) {
          return { ...coin, status: CoinStatus.OUT };
        }
        return coin;
      });

      setActiveCoinCount(nextActiveCount);
      setCoins([...currentCoins]);

      if (nextActiveCount === 0) {
        finalMessage = `Simulation Complete. No coins landed Heads in Round ${currentRound}.`;
        setMessage(finalMessage);
        setRoundHistory((prevHistory) => [
          ...prevHistory,
          `End: ${finalMessage}`,
        ]);
        break;
      } else {
        setMessage(`Preparing for Round ${currentRound + 1}...`);
      }

      await delay(800);
      if (!simulationRef.current) {
        finalMessage = "Simulation Reset.";
        break;
      }
    }
    if (simulationRef.current && finalMessage) {
      setRoundHistory((prevHistory) => {
        if (
          !prevHistory.length ||
          !prevHistory[prevHistory.length - 1]?.startsWith("End:")
        ) {
          return [...prevHistory, `End: ${finalMessage}`];
        }
        return prevHistory;
      });
    } else if (!simulationRef.current) {
      setMessage(finalMessage || "Simulation Reset.");
    }

    simulationRef.current = false;
    setIsSimulating(false);
  }, [initialCoinCount, isSimulating]);
  const handleReset = () => {
    simulationRef.current = false;
    setIsSimulating(false);
    setRoundHistory([]);
    setMessage("Simulation Reset. Set count and start again.");
    setCoins(initializeCoins(initialCoinCount));
  };

  const getCoinClassName = (status) => {
    let className = "coin";
    switch (status) {
      case CoinStatus.ACTIVE:
        className += " active";
        break;
      case CoinStatus.FLIPPING:
        className += " flipping active";
        break;
      case CoinStatus.HEADS:
        className += " heads";
        break;
      case CoinStatus.TAILS:
        className += " tails";
        break;
      case CoinStatus.OUT:
        className += " out";
        break;
    }
    return className;
  };

  return (
    <div className="App">
      {" "}
      <h1>Sequential Coin Flip</h1>
      <div class="title-coin"></div>
      <p className="subtitle">
        Simulates Neil deGrasse Tyson's thought experiment
      </p>
      <div className="controls">
        <label htmlFor="numberOfCoinsInput">Start with Coins:</label>
        <input
          type="number"
          id="numberOfCoinsInput"
          value={initialCoinCount}
          onChange={handleNumberChange}
          min="1"
          max="10000"
          disabled={isSimulating}
        />
        <button
          className="button-start"
          onClick={runSimulation}
          disabled={isSimulating}
        >
          {isSimulating ? "Simulating..." : "Start Sequence"}
        </button>
        <button
          className="button-reset"
          onClick={handleReset}
          disabled={!isSimulating && roundNumber === 0}
        >
          Reset
        </button>
      </div>
      <div className="status-display">
        <p>
          <strong>Round:</strong> {roundNumber}
        </p>
        <p>
          <strong>Active Coins:</strong> {activeCoinCount}
        </p>
        <p className="message">{message}</p>
      </div>
      <div className="coin-display-wrapper">
        <h3>Coins</h3>
        <div className="coin-container">
          {coins.map((coin) => (
            <div
              key={coin.id}
              className={getCoinClassName(coin.status)}
              title={`Coin ${coin.id + 1} - ${coin.status}`}
            >
              <span className="coin-label">
                {coin.status === CoinStatus.HEADS
                  ? "H"
                  : coin.status === CoinStatus.TAILS
                    ? "T"
                    : ""}
              </span>
            </div>
          ))}
          {coins.length === 0 && <p>No coins to display.</p>}
        </div>
        {initialCoinCount > 200 && (
          <p className="performance-note">
            Note: Visualizing many coins ({initialCoinCount}) might impact
            performance.
          </p>
        )}
      </div>
      {roundHistory.length > 0 && (
        <div className="history-display">
          <h3>Round History</h3>
          <ul>
            {roundHistory.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
