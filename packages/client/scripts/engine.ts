import thothCore from '@thothai/thoth-core/server'

const {
  components: any
} = thothCore

export const components = [
  // new ActionTypeComponent(),
  // new Alert(),
  // new BooleanGate(),
  // new Code(),
  // new DifficultyDetectorComponent(),
  // new EntityDetector(),
  // new ForEach(),
  // new Generator(),
  // new InputComponent(),
  // new ItemTypeComponent(),
  // new JoinListComponent(),
  // new ModuleComponent(),
  moduleInput(),
  moduleOutput(),
  // new PlaytestPrint(),
  // new PlaytestInput(),
  // new RunInputComponent(),
  // new SafetyVerifier(),
  // new StateWrite(),
  // new StateRead(),
  // new StringProcessor(),
  // new SwitchGate(),
  tenseTransformer(),
  // new TimeDetectorComponent(),
]
