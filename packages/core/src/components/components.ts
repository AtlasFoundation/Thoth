import { ThothComponent } from '../../types'
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
import { Classifier } from './ml/Classifier'
import { Generator } from './ml/Generator'
import { KeywordExtractor } from './ml/KeywordExtractor'
import { NamedEntityRecognition } from './ml/NamedEntityRecognition'
import { SentenceMatcher } from './ml/SentenceMatcher'
import { SummarizeFacts } from './ml/SummarizeFacts'
import { TextToSpeech } from './ml/TextToSpeech'
import { DocumentDelete } from './search/DocumentDelete'
import { DocumentEdit } from './search/DocumentEdit'
import { DocumentGet } from './search/DocumentGet'
import { DocumentSet } from './search/DocumentSet'
import { DocumentStoreGet } from './search/DocumentStoreGet'
import { Search } from './search/Search'
import { VectorSearch } from './search/VectorSearch'
import { SpellComponent } from './services/Spell'
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
import { Echo } from './utility/Echo'
import { InRange } from './utility/InRange'
import { InputsToJSON } from './utility/InputsToJSON'
import { ArrayVariable } from './variable/ArrayVariable'
import { BooleanVariable } from './variable/BooleanVariable'
import { FewshotVariable } from './variable/FewshotVariable'
import { NumberVariable } from './variable/NumberVariable'
import { StringVariable } from './variable/StringVariable'
import { DocumentSetMass } from './search/DocumentSetMass'
import { RSSGet } from './search/RSSGet'
import { CustomTextCompletion } from './entities/CustomTextCompletion'
import { IsQuery } from './logic/IsQuery'
import { VariableReplacer } from './utility/VariableReplacer'

// Here we load up all components of the builder into our editor for usage.
// We might be able to programatically generate components from enki

// NOTE: PLEASE KEEP THESE IN ALPHABETICAL ORDER
// todo some kind of custom build parser perhaps to take car of keeping these in alphabetical order

export const components = {
  alert: () => new Alert(),
  booleanGate: () => new BooleanGate(),
  coallesce: () => new Coallesce(),
  inRange: () => new InRange(),
  code: () => new Code(),
  sentenceMatcher: () => new SentenceMatcher(),
  complexStringMatcher: () => new ComplexStringMatcher(),
  echo: () => new Echo(),
  variableReplacer: () => new VariableReplacer(),
  SummarizeFacts: () => new SummarizeFacts(),
  textToSpeech: () => new TextToSpeech(),
  agentTextCompletion: () => new AgentTextCompletion(),
  customTextCompletion: () => new CustomTextCompletion(),
  keywordExtractor: () => new KeywordExtractor(),
  namedEntityRecognition: () => new NamedEntityRecognition(),
  createOrGetAgent: () => new CreateOrGetAgent(),
  Classifier: () => new Classifier(),
  isNullOrUndefined: () => new IsNullOrUndefined(),
  isQuery: () => new IsQuery(),
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
  documentSetMass: () => new DocumentSetMass(),
  rssGet: () => new RSSGet(),
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
  inputComponent: () => new InputComponent(),
  inputDestructureComponent: () => new InputDestructureComponent(),
  inputRestructureComponent: () => new InputRestructureComponent(),
  inputsToJson: () => new InputsToJSON(),
  joinListComponent: () => new JoinListComponent(),
  moduleComponent: () => new SpellComponent(),
  output: () => new Output(),
  stateWrite: () => new StateWrite(),
  stateRead: () => new StateRead(),
  stringProcessor: () => new StringProcessor(),
  switchGate: () => new SwitchGate(),
  triggerIn: () => new TriggerIn(),
  triggerOut: () => new TriggerOut(),
  waitForAll: () => new WaitForAll(),
}

function compare(a: ThothComponent<unknown>, b: ThothComponent<unknown>) {
  if ((a.displayName || a.name) < (b.displayName || b.name)) {
    return -1
  }
  if ((a.displayName || a.name) > (b.displayName || b.name)) {
    return 1
  }
  return 0
}

export const getComponents = () => {
  const sortedComponents = Object.keys(components)
    .sort()
    .reduce(function (acc, key: keyof typeof components) {
      acc[key] = components[key]
      return acc
    }, {} as Record<string, any>)

  return Object.values(sortedComponents)
    .map(component => component())
    .sort(compare)
}
