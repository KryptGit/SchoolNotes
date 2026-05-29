const BASE = 'https://api.nal.usda.gov/fdc/v1';

// USDA nutrient ID → our field name
export const NUTRIENT_MAP = {
  1008: 'calories',
  1003: 'protein_g',
  1005: 'carbs_g',
  1004: 'fat_g',
  1079: 'fiber_g',
  1087: 'calcium_mg',
  1089: 'iron_mg',
  1090: 'magnesium_mg',
  1091: 'phosphorus_mg',
  1092: 'potassium_mg',
  1093: 'sodium_mg',
  1095: 'zinc_mg',
  1106: 'vitA_mcg',
  1162: 'vitC_mg',
  1114: 'vitD_mcg',
  1109: 'vitE_mg',
  1185: 'vitK_mcg',
  1165: 'vitB1_mg',
  1166: 'vitB2_mg',
  1167: 'vitB3_mg',
  1175: 'vitB6_mg',
  1178: 'vitB12_mcg',
  1177: 'folate_mcg',
};

export const MICRO_LABELS = {
  calcium_mg: 'Calcium',
  iron_mg: 'Iron',
  magnesium_mg: 'Magnesium',
  phosphorus_mg: 'Phosphorus',
  potassium_mg: 'Potassium',
  sodium_mg: 'Sodium',
  zinc_mg: 'Zinc',
  vitA_mcg: 'Vitamin A',
  vitC_mg: 'Vitamin C',
  vitD_mcg: 'Vitamin D',
  vitE_mg: 'Vitamin E',
  vitK_mcg: 'Vitamin K',
  vitB1_mg: 'B1 (Thiamine)',
  vitB2_mg: 'B2 (Riboflavin)',
  vitB3_mg: 'B3 (Niacin)',
  vitB6_mg: 'B6',
  vitB12_mcg: 'B12',
  folate_mcg: 'Folate',
};

// Recommended daily values (used for micro progress %)
export const RDV = {
  calcium_mg: 1300,
  iron_mg: 18,
  magnesium_mg: 420,
  phosphorus_mg: 1250,
  potassium_mg: 4700,
  sodium_mg: 2300,
  zinc_mg: 11,
  vitA_mcg: 900,
  vitC_mg: 90,
  vitD_mcg: 20,
  vitE_mg: 15,
  vitK_mcg: 120,
  vitB1_mg: 1.2,
  vitB2_mg: 1.3,
  vitB3_mg: 16,
  vitB6_mg: 1.7,
  vitB12_mcg: 2.4,
  folate_mcg: 400,
};

export const mapNutrients = (foodNutrients) => {
  const result = {};
  for (const n of foodNutrients) {
    const id = n.nutrient?.id ?? n.nutrientId;
    const key = NUTRIENT_MAP[id];
    if (key) result[key] = n.amount ?? n.value ?? 0;
  }
  return result;
};

export const searchFoods = async (query, apiKey) => {
  const url = `${BASE}/foods/search?query=${encodeURIComponent(query)}&api_key=${apiKey}&dataType=SR%20Legacy,Foundation&pageSize=10`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Search failed');
  const data = await res.json();
  return (data.foods ?? []).map((f) => ({
    fdcId: f.fdcId,
    name: f.description,
    brandOwner: f.brandOwner ?? null,
    servingSize: f.servingSize ?? 100,
    servingSizeUnit: f.servingSizeUnit ?? 'g',
    nutrients: mapNutrients(f.foodNutrients ?? []),
  }));
};
