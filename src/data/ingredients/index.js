import { IngredientRepository } from '../../services/IngredientRepository'
import { fatsCocoaGroup } from './fatsCocoaIngredients'
import { fortificationPreservativeGroup } from './fortificationPreservativeIngredients'
import { sweetenersGroup } from './sweetenersIngredients'
import { processingAdditivesGroup } from './processingAdditivesIngredients'
import { colorsSulfitesGroup } from './colorsSulfitesIngredients'
import { sugarsPolyolsGroup } from './sugarsPolyolsIngredients'
import { propionatesNaturalColorsGroup } from './propionatesNaturalColorsIngredients'
import { personalCareIngredientsGroup } from './personalCareIngredients'
import { personalCareExtraGroup } from './personalCareExtraIngredients'
import { cleaningIngredientsGroup } from './cleaningIngredients'
import { householdHazardsGroup } from './householdHazardsIngredients'
import { commonFoodIngredientsGroup } from './commonFoodIngredients'
import { foodExtraGroup } from './foodExtraIngredients'
import { microIngredientsGroup } from './microIngredients'
import { vitaminsContaminantsGroup } from './vitaminsContaminantsIngredients'

export var ingredientGroups = [
  fatsCocoaGroup,
  fortificationPreservativeGroup,
  sweetenersGroup,
  processingAdditivesGroup,
  colorsSulfitesGroup,
  sugarsPolyolsGroup,
  propionatesNaturalColorsGroup,
  personalCareIngredientsGroup,
  personalCareExtraGroup,
  cleaningIngredientsGroup,
  householdHazardsGroup,
  commonFoodIngredientsGroup,
  foodExtraGroup,
  microIngredientsGroup,
  vitaminsContaminantsGroup
]

export var ingredientRepository = new IngredientRepository(ingredientGroups)
