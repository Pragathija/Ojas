import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Orbit,
  Brain,
  Telescope,
  Compass,
  HeartPulse,
  RotateCcw,
  Sparkles,
  Trophy,
  ShieldCheck,
  Gamepad2,
} from 'lucide-react';
import { gamificationService } from '../../services';

interface CardItem {
  id: number;
  pairId: number;
  iconName: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const PAIRS = [
  { id: 1, name: 'Rocket', icon: Rocket },
  { id: 2, name: 'Orbit', icon: Orbit },
  { id: 3, name: 'Brain', icon: Brain },
  { id: 4, name: 'Telescope', icon: Telescope },
  { id: 5, name: 'Compass', icon: Compass },
  { id: 6, name: 'HeartPulse', icon: HeartPulse },
];

export const MemoryOrbitGame: React.FC = () => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  const initializeGame = () => {
    const deck: CardItem[] = [];
    let cardId = 0;

    PAIRS.forEach((p) => {
      deck.push({ id: cardId++, pairId: p.id, iconName: p.name, isFlipped: false, isMatched: false });
      deck.push({ id: cardId++, pairId: p.id, iconName: p.name, isFlipped: false, isMatched: false });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setIsWon(false);
    setSeconds(0);
    setIsTimerRunning(false);
    setXpClaimed(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && !isWon) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isWon]);

  const handleCardClick = (index: number) => {
    if (!isTimerRunning) setIsTimerRunning(true);
    if (flippedIndices.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      if (cards[firstIdx].pairId === cards[secondIdx].pairId) {
        // Matched
        setTimeout(() => {
          newCards[firstIdx].isMatched = true;
          newCards[secondIdx].isMatched = true;
          setCards([...newCards]);
          setFlippedIndices([]);
          setMatches((m) => {
            const nextMatches = m + 1;
            if (nextMatches === PAIRS.length) {
              setIsWon(true);
              setIsTimerRunning(false);
              gamificationService.claimQuest('memory-orbit-complete', 'Memory Orbit Challenge', 50)
                .then(() => setXpClaimed(true))
                .catch(() => setXpClaimed(true));
            }
            return nextMatches;
          });
        }, 500);
      } else {
        // Not matched
        setTimeout(() => {
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const renderIcon = (name: string) => {
    const pair = PAIRS.find((p) => p.name === name);
    if (!pair) return null;
    const IconComponent = pair.icon;
    return <IconComponent className="h-7 w-7 text-[#7656D9]" />;
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 border-b border-[#E9E4F2] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8E0FF] text-[#7656D9] flex items-center justify-center shadow-xs">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-[#252039]">Memory Orbit</h3>
            <p className="text-xs text-[#716B83] font-sans">
              Match orbital symbols to promote mental focus and cognitive agility during transit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-[#F8F6FF] border border-[#E9E4F2]">
            <span className="text-[#716B83]">Moves: </span>
            <strong className="text-[#252039] font-bold">{moves}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#F8F6FF] border border-[#E9E4F2]">
            <span className="text-[#716B83]">Matched: </span>
            <strong className="text-[#7656D9] font-bold">{matches}/{PAIRS.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#F8F6FF] border border-[#E9E4F2]">
            <span className="text-[#716B83]">Time: </span>
            <strong className="text-[#252039] font-bold">{seconds}s</strong>
          </div>
          <button
            onClick={initializeGame}
            className="p-2 rounded-xl border border-[#E9E4F2] text-[#716B83] hover:text-[#7656D9] transition-colors cursor-pointer"
            title="Reset Game"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Victory Banner */}
      {isWon && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#E8E0FF] to-[#FAF9FF] border border-[#7656D9]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-[#7656D9] shrink-0" />
            <div>
              <span className="font-heading font-extrabold text-base text-[#252039] block">
                Orbit Cleared in {moves} Moves ({seconds}s)!
              </span>
              <p className="text-xs text-[#716B83]">
                Excellent pattern recognition and visual memory.
              </p>
            </div>
          </div>
          {xpClaimed && (
            <span className="px-3 py-1.5 rounded-full bg-[#7656D9] text-white font-mono text-xs font-bold">
              +50 XP Claimed
            </span>
          )}
        </div>
      )}

      {/* 4x3 Cards Grid */}
      <div className="grid grid-cols-3 tablet:grid-cols-4 gap-3.5 max-w-xl mx-auto py-4">
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(idx)}
            disabled={card.isMatched || isWon}
            className={`h-24 rounded-2xl border flex items-center justify-center transition-all duration-300 cursor-pointer ${
              card.isFlipped || card.isMatched
                ? 'bg-[#FAF9FF] border-[#7656D9]/50 shadow-soft rotate-0'
                : 'bg-white border-[#E9E4F2] hover:border-[#7656D9]/40 hover:bg-[#F8F6FF] shadow-xs'
            }`}
          >
            {card.isFlipped || card.isMatched ? (
              renderIcon(card.iconName)
            ) : (
              <Orbit className="h-6 w-6 text-[#D8D0EB]" />
            )}
          </button>
        ))}
      </div>

      {/* Non-clinical Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#F8F6FF] border border-[#E9E4F2] flex items-center gap-2.5 text-[11px] text-[#716B83]">
        <ShieldCheck className="h-4 w-4 text-[#7656D9] shrink-0" />
        <span>
          Game scores are for enjoyment and non-clinical engagement. They are never interpreted as clinical mental assessments.
        </span>
      </div>
    </div>
  );
};
