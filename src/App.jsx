import { useEffect, useState } from 'react';
import { loadSave, writeSave, totals, getRecord, resetProgress } from './storage.js';
import { setSoundEnabled, sfx } from './sound.js';
import { LEVELS } from './config.js';
import Welcome from './screens/Welcome.jsx';
import ModeSelect from './screens/ModeSelect.jsx';
import LevelSelect from './screens/LevelSelect.jsx';
import Game from './screens/Game.jsx';
import Result from './screens/Result.jsx';

export default function App() {
  const [save, setSave] = useState(loadSave);
  const [screen, setScreen] = useState('welcome');
  const [mode, setMode] = useState('add');
  const [levelIdx, setLevelIdx] = useState(0);
  const [round, setRound] = useState(0); // đổi key để chơi lại level
  const [result, setResult] = useState(null);

  useEffect(() => {
    writeSave(save);
    setSoundEnabled(save.sound);
  }, [save]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const toggleSound = () => {
    setSave((s) => ({ ...s, sound: !s.sound }));
    if (!save.sound) setTimeout(sfx.click, 0);
  };

  const startLevel = (m, i) => {
    setMode(m);
    setLevelIdx(i);
    setRound((r) => r + 1);
    setScreen('game');
  };

  const finishLevel = ({ correct, score, stars }) => {
    const nextIdx = levelIdx + 1;
    const nextWasLocked = nextIdx < LEVELS.length && getRecord(save, mode, levelIdx).stars === 0;
    const old = getRecord(save, mode, levelIdx);
    setSave((s) => ({
      ...s,
      progress: {
        ...s.progress,
        [mode]: {
          ...s.progress[mode],
          [levelIdx]: { stars: Math.max(old.stars, stars), score: Math.max(old.score, score) },
        },
      },
    }));
    setResult({ correct, score, stars, unlocked: nextWasLocked && stars > 0 });
    setScreen('result');
  };

  const t = totals(save);
  const bar = { stars: t.stars, score: t.score, sound: save.sound, onToggleSound: toggleSound };

  return (
    <>
      {screen === 'welcome' && <Welcome onStart={() => setScreen('modes')} />}
      {screen === 'modes' && (
        <ModeSelect
          {...bar}
          save={save}
          onHome={() => setScreen('welcome')}
          onPick={(m) => {
            setMode(m);
            setScreen('levels');
          }}
          onReset={() => setSave((s) => resetProgress(s))}
        />
      )}
      {screen === 'levels' && (
        <LevelSelect {...bar} save={save} mode={mode} onBack={() => setScreen('modes')} onPlay={(i) => startLevel(mode, i)} />
      )}
      {screen === 'game' && (
        <Game
          key={round}
          {...bar}
          mode={mode}
          levelIdx={levelIdx}
          onQuit={() => setScreen('levels')}
          onFinish={finishLevel}
        />
      )}
      {screen === 'result' && result && (
        <Result
          {...result}
          mode={mode}
          levelIdx={levelIdx}
          onNext={() => startLevel(mode, levelIdx + 1)}
          onRetry={() => startLevel(mode, levelIdx)}
          onLevels={() => setScreen('levels')}
        />
      )}
    </>
  );
}
