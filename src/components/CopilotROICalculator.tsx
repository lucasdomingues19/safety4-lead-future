import { useState } from "react";
import { Clock, TrendingUp } from "lucide-react";

const formatMoney = (n: number) =>
  `£${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;

export const CopilotROICalculator = () => {
  const [teamSize, setTeamSize] = useState(20);
  const [hoursPerWeek, setHoursPerWeek] = useState(1);
  const [hourlyRate, setHourlyRate] = useState(35);

  const weeklyValue = teamSize * hoursPerWeek * hourlyRate;
  const annualValue = weeklyValue * 52;

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-6 md:p-10">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        <div className="space-y-6">
          <div>
            <label htmlFor="roi-team" className="text-sm font-medium text-slate-700 mb-2 block">
              Team size
            </label>
            <input
              id="roi-team"
              type="number"
              min={1}
              value={teamSize}
              onChange={(e) => setTeamSize(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-base focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="roi-hours" className="text-sm font-medium text-slate-700 mb-2 block">
              Hours saved per person, per week
            </label>
            <input
              id="roi-hours"
              type="number"
              min={0}
              step={0.5}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-base focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Conservative default — Copilot users typically report saving an hour or more per week once trained to use it well.
            </p>
          </div>
          <div>
            <label htmlFor="roi-rate" className="text-sm font-medium text-slate-700 mb-2 block">
              Loaded hourly rate (£)
            </label>
            <input
              id="roi-rate"
              type="number"
              min={0}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 text-base focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
              <Clock className="w-4 h-4 text-primary" />
              Value recovered per week
            </div>
            <div className="text-3xl font-bold text-slate-900">{formatMoney(weeklyValue)}</div>
          </div>
          <div className="rounded-xl border border-primary bg-primary/5 p-6">
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Value recovered per year
            </div>
            <div className="text-3xl font-bold text-primary">{formatMoney(annualValue)}</div>
          </div>
          <p className="text-xs text-slate-400">
            Illustrative only, based on your own inputs. Actual savings vary by role and adoption.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CopilotROICalculator;
