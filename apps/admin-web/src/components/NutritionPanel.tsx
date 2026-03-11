interface NutritionPanelProps {
  nutritionForm: Record<string, string>;
  setNutritionForm: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  nutritionSaving: boolean;
  onSave: () => void;
  t: (key: string, fallback?: string) => string;
}

export function NutritionPanel({ nutritionForm, setNutritionForm, nutritionSaving, onSave, t }: NutritionPanelProps) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 15 }}>{t('nutrition.title', 'Nutrition Info')}</h4>
        <button className="btn btn-primary btn-sm" disabled={nutritionSaving} onClick={onSave}>
          {t('common.save', 'Save')}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {([
          ['calories_per_100g', t('nutrition.calories', 'Calories/100g')],
          ['protein_pct', t('nutrition.protein', 'Protein (%)')],
          ['fat_pct', t('nutrition.fat', 'Fat (%)')],
          ['fiber_pct', t('nutrition.fiber', 'Fiber (%)')],
          ['moisture_pct', t('nutrition.moisture', 'Moisture (%)')],
          ['ash_pct', t('nutrition.ash', 'Ash (%)')],
          ['calcium_pct', t('nutrition.calcium', 'Calcium (%)')],
          ['phosphorus_pct', t('nutrition.phosphorus', 'Phosphorus (%)')],
          ['omega3_pct', t('nutrition.omega3', 'Omega-3 (%)')],
          ['omega6_pct', t('nutrition.omega6', 'Omega-6 (%)')],
          ['carbohydrate_pct', t('nutrition.carbohydrate', 'Carbohydrate (%)')],
          ['serving_size_g', t('nutrition.serving_size', 'Serving Size (g)')],
        ] as const).map(([key, label]) => (
          <div key={key} className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: 11 }}>{label}</label>
            <input
              className="form-input"
              type="number"
              step="0.01"
              style={{ fontSize: 13 }}
              value={nutritionForm[key] || ''}
              onChange={e => setNutritionForm(p => ({ ...p, [key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <div className="form-group" style={{ marginTop: 8, marginBottom: 0 }}>
        <label className="form-label" style={{ fontSize: 11 }}>{t('nutrition.ingredients', 'Ingredients')}</label>
        <textarea
          className="form-input"
          rows={2}
          style={{ fontSize: 13 }}
          value={nutritionForm.ingredients_text || ''}
          onChange={e => setNutritionForm(p => ({ ...p, ingredients_text: e.target.value }))}
        />
      </div>
    </div>
  );
}
