<<<<<<< HEAD:core/src/components/components.ts
import { AddAgent } from './entities/AddAgent'
import { AgentTextCompletion } from './entities/AgentTextCompletion'
import { CacheManagerDelete } from './entities/CacheManagerDelete'
import { CacheManagerGet } from './entities/CacheManagerGet'
import { CacheManagerSet } from './entities/CacheManagerSet'
import { CreateOrGetAgent } from './entities/CreateOrGetAgent'
import { EventRecall } from './entities/EventRecall'
import { EventStore } from './entities/EventStore'
import { InputDestructureComponent } from './entities/InputDestructure'
import { InputRestructureComponent } from './entities/InputRestructure'
import { Request } from './entities/Request'
import { InputComponent } from './io/Input'
import { Output } from './io/Output'
import { TriggerIn } from './io/TriggerIn'
import { TriggerOut } from './io/TriggerOut'
import { BooleanGate } from './logic/BooleanGate'
import { Coallesce } from './logic/Coallesce'
import { Code } from './logic/Code'
import { ForEach } from './logic/ForEach'
import { IsNullOrUndefined } from './logic/IsNullOrUndefined'
import { IsVariableTrue } from './logic/IsVariableTrue'
import { LogicalOperator } from './logic/LogicalOperator'
import { SwitchGate } from './logic/SwitchGate'
import { WaitForAll } from './logic/WaitForAll'
import { WhileLoop } from './logic/WhileLoop'
import { ActionTypeComponent } from './ml/ActionType'
import { Classifier } from './ml/Classifier'
import { DifficultyDetectorComponent } from './ml/DifficultyDetector'
import { EntityDetector } from './ml/EntityDetector'
import { Generator } from './ml/Generator'
import { HuggingfaceComponent } from './ml/Huggingface'
import { ItemTypeComponent } from './ml/ItemDetector'
import { KeywordExtractor } from './ml/KeywordExtractor'
import { NamedEntityRecognition } from './ml/NamedEntityRecognition'
import { ProseToScript } from './ml/ProseToScript'
import { SafetyVerifier } from './ml/SafetyVerifier'
import { SentenceMatcher } from './ml/SentenceMatcher'
import { SummarizeFacts } from './ml/SummarizeFacts'
import { TenseTransformer } from './ml/TenseTransformer'
import { TextToSpeech } from './ml/TextToSpeech'
import { TimeDetectorComponent } from './ml/TimeDetector'
import { DocumentDelete } from './search/DocumentDelete'
import { DocumentEdit } from './search/DocumentEdit'
import { DocumentGet } from './search/DocumentGet'
import { DocumentSet } from './search/DocumentSet'
import { DocumentStoreGet } from './search/DocumentStoreGet'
import { Search } from './search/Search'
import { VectorSearch } from './search/VectorSearch'
import { SpellComponent } from './Spell'
import { StateRead } from './state/StateRead'
import { StateWrite } from './state/StateWrite'
import { ComplexStringMatcher } from './strings/ComplexStringMatcher'
import { JoinListComponent } from './strings/JoinList'
import { ProfanityFilter } from './strings/ProfanityFilter'
import { RandomStringFromList } from './strings/RandomStringFromList'
import { StringAdder } from './strings/StringAdder'
import { StringCombiner } from './strings/StringCombiner'
import { StringEvaluator } from './strings/StringEvaluator'
import { StringProcessor } from './strings/StringProcessor'
import { Alert } from './utility/AlertMessage'
=======
import { ActionTypeComponent } from './deprecated/ActionType'
import { Alert } from './utility/AlertMessage'
import { BooleanGate } from './BooleanGate'
import { InRange } from './InRange'
import { Code } from './Code'
import { InputFieldComponent } from './deprecated/InputField'
import { ModuleInput } from './deprecated/ModuleInput'
import { ModuleOutput } from './deprecated/ModuleOutput'
import { PlaytestInput } from './deprecated/PlaytestInput'
import { PlaytestPrint } from './deprecated/PlaytestPrint'
import { RunInputComponent } from './deprecated/RunInput'
import { DifficultyDetectorComponent } from './DifficultyDetector'
import { EnkiTask } from './EnkiTask'
import { EntityDetector } from './deprecated/EntityDetector'
import { ForEach } from './ForEach'
import { Generator } from './Generator'
import { HuggingfaceComponent } from './Huggingface'
import { InputComponent } from './Input'
import { ItemTypeComponent } from './deprecated/ItemDetector'
import { JoinListComponent } from './JoinList'
import { Output } from './Output'
import { ProseToScript } from './deprecated/ProseToScript'
import { SafetyVerifier } from './deprecated/SafetyVerifier'
import { SpellComponent } from './Spell'
import { StateRead } from './StateRead'
import { StateWrite } from './StateWrite'
import { StringProcessor } from './StringProcessor'
import { SwitchGate } from './SwitchGate'
import { TenseTransformer } from './deprecated/TenseTransformer'
import { TimeDetectorComponent } from './deprecated/TimeDetector'
import { TriggerIn } from './TriggerIn'
import { TriggerOut } from './TriggerOut'
import { VisualGeneration } from './VisualGeneration'
>>>>>>> latitude/0.0.68:packages/core/src/components/components.ts
import { Echo } from './utility/Echo'
import { InputsToJSON } from './utility/InputsToJSON'
import { ArrayVariable } from './variable/ArrayVariable'
import { BooleanVariable } from './variable/BooleanVariable'
import { FewshotVariable } from './variable/FewshotVariable'
import { NumberVariable } from './variable/NumberVariable'
import { StringVariable } from './variable/StringVariable'

// Here we load up all components of the builder into our editor for usage.
// We might be able to programatically generate components from enki

// NOTE: PLEASE KEEP THESE IN ALPHABETICAL ORDER
// todo some kind of custom build parser perhaps to take car of keeping these in alphabetical order

export const components = {
  actionTypeComponent: () => new ActionTypeComponent(),
  alert: () => new Alert(),
  booleanGate: () => new BooleanGate(),
<<<<<<< HEAD:core/src/components/components.ts
  coallesce: () => new Coallesce(),
=======
  inRange: () => new InRange(),
>>>>>>> latitude/0.0.68:packages/core/src/components/components.ts
  code: () => new Code(),
  sentenceMatcher: () => new SentenceMatcher(),
  difficultyDetectorComponent: () => new DifficultyDetectorComponent(),
  // enkiTask: () => new EnkiTask(),
  entityDetector: () => new EntityDetector(),
  complexStringMatcher: () => new ComplexStringMatcher(),
  echo: () => new Echo(),
  SummarizeFacts: () => new SummarizeFacts(),
  textToSpeech: () => new TextToSpeech(),
  agentTextCompletion: () => new AgentTextCompletion(),
  keywordExtractor: () => new KeywordExtractor(),
  namedEntityRecognition: () => new NamedEntityRecognition(),
  createOrGetAgent: () => new CreateOrGetAgent(),
  Classifier: () => new Classifier(),
  isNullOrUndefined: () => new IsNullOrUndefined(),
  isVariableTrue: () => new IsVariableTrue(),
  conversationStore: () => new EventStore(),
  conversationRecall: () => new EventRecall(),
  request: () => new Request(),
  search: () => new Search(),
  vectorSearch: () => new VectorSearch(),
  documentGet: () => new DocumentGet(),
  documentEdit: () => new DocumentEdit(),
  documentDelete: () => new DocumentDelete(),
  documentSet: () => new DocumentSet(),
  documentStoreGet: () => new DocumentStoreGet(),
  forEach: () => new ForEach(),
  whileLoop: () => new WhileLoop(),
  cacheManagerGet: () => new CacheManagerGet(),
  cacheManagerDelete: () => new CacheManagerDelete(),
  cacheManagerSet: () => new CacheManagerSet(),
  stringEvaluator: () => new StringEvaluator(),
  stringCombiner: () => new StringCombiner(),
  randomStringFromList: () => new RandomStringFromList(),
  stringVariable: () => new StringVariable(),
  fewshotVariable: () => new FewshotVariable(),
  stringAdder: () => new StringAdder(),
  profanityFilter: () => new ProfanityFilter(),
  numberVariable: () => new NumberVariable(),
  booleanVariable: () => new BooleanVariable(),
  arrayVariable: () => new ArrayVariable(),
  addAgent: () => new AddAgent(),
  logicalOperator: () => new LogicalOperator(),
  generator: () => new Generator(),
  huggingfaceComponent: () => new HuggingfaceComponent(),
  inputComponent: () => new InputComponent(),
  inputDestructureComponent: () => new InputDestructureComponent(),
  inputRestructureComponent: () => new InputRestructureComponent(),
  inputsToJson: () => new InputsToJSON(),
  itemTypeComponent: () => new ItemTypeComponent(),
  joinListComponent: () => new JoinListComponent(),
  moduleComponent: () => new SpellComponent(),
  output: () => new Output(),
  proseToScript: () => new ProseToScript(),
  safetyVerifier: () => new SafetyVerifier(),
  stateWrite: () => new StateWrite(),
  stateRead: () => new StateRead(),
  stringProcessor: () => new StringProcessor(),
  switchGate: () => new SwitchGate(),
  tenseTransformer: () => new TenseTransformer(),
  timeDetectorComponent: () => new TimeDetectorComponent(),
  triggerIn: () => new TriggerIn(),
  triggerOut: () => new TriggerOut(),
  waitForAll: () => new WaitForAll(),
}

export const getComponents = () => {
  return Object.values(components).map(component => component())
}
