import { GuideRepository } from '../../services/GuideRepository'
import { produceGroup } from './produceGuides'
import { dairyProteinGroup } from './dairyProteinGuides'
import { staplesGroup } from './staplesGuides'
import { breakfastSnacksGroup } from './breakfastSnacksGuides'
import { personalCareGroup } from './personalCareGuides'
import { cleaningGroup } from './cleaningGuides'
import { kitchenHomeGroup } from './kitchenHomeGuides'

/**
 * Registry of all guide groups. Each group mirrors a family of the default
 * checklists. New parts are added by importing a group file and appending it
 * here; nothing else in the app needs to change.
 */
export var guideGroups = [
  produceGroup,
  dairyProteinGroup,
  staplesGroup,
  breakfastSnacksGroup,
  personalCareGroup,
  cleaningGroup,
  kitchenHomeGroup
]

export var guideRepository = new GuideRepository(guideGroups)
