import React, { useState } from 'react';
import { Telescope, CheckCircle2, XCircle, RotateCcw, Trophy, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { gamificationService } from '../../services';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What physiological fluid shift typically occurs during the first week of microgravity insertion?",
    options: [
      "Pooling of blood in the lower limbs",
      "Cephalad fluid redistribution toward the head and chest",
      "Immediate total loss of blood volume",
      "Permanent decrease in cardiac stroke volume"
    ],
    correctIndex: 1,
    explanation: "In microgravity, hydrostatic gradients vanish, causing approximately 1.5 to 2 liters of fluid to shift upward toward the head and upper torso (cephalad shift)."
  },
  {
    id: 2,
    question: "What did the SpaceX Inspiration4 mission (NASA OSDR OSD-575/569) reveal about pro-inflammatory cytokines?",
    options: [
      "Cytokines remained permanently elevated years after flight",
      "No immunological changes occurred during the mission",
      "Transient cytokine shifts during flight normalized to baseline shortly after landing",
      "Civilian astronauts were incapable of immunological adaptation"
    ],
    correctIndex: 2,
    explanation: "Inspiration4 multi-omic profiling demonstrated that acute immunological changes (IL-6, TNF-alpha) during flight were transient and stabilized rapidly back to baseline upon terrestrial recovery."
  },
  {
    id: 3,
    question: "Why is scheduled phototherapy and lighting control used on the International Space Station?",
    options: [
      "To save battery power on solar arrays",
      "To prevent circadian rhythm desynchronization caused by 16 daily sunrises",
      "To increase carbon dioxide scrubbing speed",
      "To stimulate artificial gravity generation"
    ],
    correctIndex: 1,
    explanation: "Orbiting in low-Earth orbit produces 16 orbital dawns every 24 hours. Tuned blue-enriched morning light and warm evening light maintain circadian melatonin alignment."
  },
  {
    id: 4,
    question: "How does the Advanced Resistive Exercise Device (ARED) protect astronaut physiology?",
    options: [
      "By maintaining bone mineral density and mitigating microgravity muscle atrophy",
      "By cooling the spacecraft air conditioning radiators",
      "By purifying cabin drinking water",
      "By generating emergency oxygen reserves"
    ],
    correctIndex: 0,
    explanation: "ARED provides high-load resistive mechanical loading (up to 600 lbs) to stimulate osteoblast activity, minimizing cancellous bone demineralization in weightlessness."
  },
  {
    id: 5,
    question: "What is the primary psychological phenomenon known as the 'Overview Effect' reported by astronauts?",
    options: [
      "Spatial disorientation during space navigation",
      "A profound cognitive shift and deep interconnectedness when viewing Earth from space",
      "Temporary memory lapses caused by cosmic radiation",
      "Severe operational fatigue from long communications delays"
    ],
    correctIndex: 1,
    explanation: "Coined by Frank White in 1987, the Overview Effect describes the awe, fragility awareness, and deep connection with humanity experienced when viewing Earth against the cosmic void."
  }
];

export const SpacePuzzlesGame: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [xpClaimed, setXpClaimed] = useState(false);

  const q = QUESTIONS[currentIdx];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === q.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      gamificationService.claimQuest('space-puzzles-complete', 'Space Science Puzzle Mastery', 50)
        .then(() => setXpClaimed(true))
        .catch(() => setXpClaimed(true));
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setXpClaimed(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E9E4F2] shadow-soft p-6 tablet:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col tablet:flex-row tablet:items-center justify-between gap-4 border-b border-[#E9E4F2] pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8E0FF] text-[#7656D9] flex items-center justify-center shadow-xs">
            <Telescope className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-[#252039]">Space Puzzles &amp; Science Trivia</h3>
            <p className="text-xs text-[#716B83] font-sans">
              Engage your mind with authentic human spaceflight physiology and orbital science puzzles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl bg-[#F8F6FF] border border-[#E9E4F2] text-[#716B83]">
            Question: <strong className="text-[#252039]">{isFinished ? QUESTIONS.length : currentIdx + 1}/{QUESTIONS.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-[#F8F6FF] border border-[#E9E4F2] text-[#716B83]">
            Score: <strong className="text-[#7656D9]">{score}</strong>
          </span>
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-[#7656D9] uppercase tracking-wider block">
              PUZZLE #{q.id}
            </span>
            <h4 className="font-heading font-extrabold text-lg tablet:text-xl text-[#252039] leading-snug">
              {q.question}
            </h4>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            {q.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === q.correctIndex;

              let btnStyle = 'border-[#E9E4F2] hover:border-[#7656D9]/50 bg-white text-[#252039]';
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'border-rose-400 bg-rose-50 text-rose-800';
                } else {
                  btnStyle = 'border-[#E9E4F2] opacity-60 bg-white text-[#716B83]';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between text-xs tablet:text-sm transition-all cursor-pointer ${btnStyle}`}
                >
                  <span>{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-[#F2EDFF] border border-[#7656D9]/25 text-xs text-[#252039] space-y-1">
              <span className="font-heading font-bold text-[#7656D9] block">Science Context:</span>
              <p className="leading-relaxed font-sans">{q.explanation}</p>
            </div>
          )}

          {/* Action button */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#7656D9] text-white font-heading font-bold text-xs shadow-soft flex items-center gap-2 hover:bg-[#6444C9] cursor-pointer"
              >
                <span>{currentIdx + 1 < QUESTIONS.length ? 'Next Question' : 'Complete Challenge'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Finished State */
        <div className="text-center py-8 space-y-4 max-w-md mx-auto">
          <Trophy className="h-10 w-10 text-[#7656D9] mx-auto" />
          <h4 className="font-heading font-extrabold text-2xl text-[#252039]">Challenge Completed!</h4>
          <p className="text-sm text-[#716B83]">
            You answered <strong className="text-[#7656D9]">{score} out of {QUESTIONS.length}</strong> questions correctly.
          </p>
          {xpClaimed && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#E8E0FF] text-[#7656D9] font-mono text-xs font-bold">
              +50 XP Claimed for Habit Progress
            </span>
          )}
          <div className="pt-4">
            <button
              onClick={handleRestart}
              className="px-7 py-3 rounded-xl bg-[#7656D9] text-white font-heading font-bold text-sm shadow-soft hover:bg-[#6444C9] cursor-pointer flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retry Challenge</span>
            </button>
          </div>
        </div>
      )}

      {/* Non-clinical Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[#F8F6FF] border border-[#E9E4F2] flex items-center gap-2.5 text-[11px] text-[#716B83]">
        <ShieldCheck className="h-4 w-4 text-[#7656D9] shrink-0" />
        <span>
          Educational space exploration quizzes. Designed for leisure, cognitive engagement, and scientific curiosity.
        </span>
      </div>
    </div>
  );
};
