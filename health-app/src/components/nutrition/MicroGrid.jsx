import { MICRO_LABELS, RDV } from '../../utils/usdaApi';
import ProgressBar from '../shared/ProgressBar';

const units = {
  calcium_mg: 'mg', iron_mg: 'mg', magnesium_mg: 'mg', phosphorus_mg: 'mg',
  potassium_mg: 'mg', sodium_mg: 'mg', zinc_mg: 'mg',
  vitA_mcg: 'mcg', vitC_mg: 'mg', vitD_mcg: 'mcg', vitE_mg: 'mg',
  vitK_mcg: 'mcg', vitB1_mg: 'mg', vitB2_mg: 'mg', vitB3_mg: 'mg',
  vitB6_mg: 'mg', vitB12_mcg: 'mcg', folate_mcg: 'mcg',
};

export default function MicroGrid({ totals }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-3">Micronutrients</h3>
      <div className="space-y-3">
        {Object.entries(MICRO_LABELS).map(([key, label]) => {
          const val = totals[key] ?? 0;
          const rdv = RDV[key] ?? 1;
          const unit = units[key] ?? '';
          return (
            <ProgressBar
              key={key}
              value={val}
              max={rdv}
              color="bg-teal-500"
              label={label}
              sublabel={`${val}/${rdv} ${unit}`}
            />
          );
        })}
      </div>
    </div>
  );
}
