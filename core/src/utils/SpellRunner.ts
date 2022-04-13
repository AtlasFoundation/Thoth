import {
  EngineContext,
  ChainData,
  ModuleComponent,
  Spell as SpellType,
} from '../../types'
import { getComponents } from '../components/components'
import { extractNodes, initSharedEngine, ThothEngine } from '../engine'
import { Module } from '../plugins/modulePlugin/module'
import { extractModuleInputKeys } from './chainHelpers'

type RunSpellConstructor = {
  thothInterface: EngineContext
}

class SpellRunner {
  engine: ThothEngine
  currentSpell!: SpellType
  module: Module
  thothInterface: EngineContext
  ranSpells: string[]

  constructor({ thothInterface }: RunSpellConstructor) {
    // Initialize the engine
    this.engine = initSharedEngine({
      name: 'demo@0.1.0',
      components: getComponents(),
      server: true,
      modules: {},
    }) as ThothEngine

    // Set up the module to interface with the runtime processes
    this.module = new Module()

    // Set the interface that this runner will use when running workers
    this.thothInterface = thothInterface

    // We should probably load up here all the "modules" the spell needds to run
    // This would basicallyt be an array of spells pulled from the DB
  }

  // getter method for all triggers ins of the loaded spell
  get triggerIns() {
    return this.engine.moduleManager.triggerIns
  }

  get context() {
    return {
      module: this.module,
      thoth: this.thothInterface,
      silent: true,
    }
  }

  get inputKeys(): string[] {
    return extractModuleInputKeys(this.currentSpell.chain)
  }

  get outputData() {
    const rawOutputs = {}
    this.module.write(rawOutputs)
    return this._formatOutputs(rawOutputs)
  }

  /**
   * Used to format inputs into the format the moduel runner expects.
   * Takes a normal object of type { key: value } and returns an object
   * of shape { key: [value]}.  This shape isa required when running the spell
   * since that is the shape that rete inputs take when processing the graph.
   */
  private _formatInputs(inputs: Record<string, unknown>) {
    return this.inputKeys.reduce((inputList, inputKey) => {
      inputList[inputKey] = [inputs[inputKey]]
      return inputList
    }, {} as Record<string, unknown[]>)
  }

  private _getComponent(componentName: string) {
    return this.engine.components.get(componentName)
  }

  private _loadInputs(inputs: Record<string, unknown>) {
    this.module.read(this._formatInputs(inputs))
  }

  private _formatOutputs(rawOutputs: Record<string, any>) {
    const outputs = {} as Record<string, unknown>
    const graph = this.currentSpell.chain

    Object.values(graph.nodes)
      .filter((node: any) => {
        return node.name.includes('Output')
      })
      .forEach((node: any) => {
        outputs[(node as any).data.name as string] =
          rawOutputs[(node as any).data.socketKey as string]
      })

    return outputs
  }

  /**
   * temporary method until we have a better way to target specific nodes
   * this is basically just using a "Default" trigger in
   * and does not support multipel triggers in to a spell yet
   */
  private _getFirstNodeTrigger() {
    const extractedNodes = extractNodes(
      this.currentSpell.chain.nodes,
      this.triggerIns
    )
    return extractedNodes[0]
  }

  private _resetTasks() {
    this.engine.tasks.forEach(t => t.reset())
  }

  async loadSpell(spell: SpellType) {
    this.currentSpell = spell

    // We process the graph for the new spell which will set up all the task workers
    await this.engine.process(spell.chain as ChainData, null, this.context)
  }

  /**
   * Main spell runner.  Processes inputs, gets the right component that starts the
   * running.  Would be even better iof we just took a node identifier, got its
   * component, and ran the one triggered rather than this slightly hacky hard coded
   * method.
   */
  async runComponent(
    inputs: Record<string, any>,
    componentName: string,
    runSubspell: boolean = false
  ) {
    if (runSubspell && this.ranSpells.includes(this.currentSpell.name))
      throw new Error('Infinite loop detected.  Exiting.')

    // ensaure we run from a clean sloate
    this._resetTasks()

    // laod the inputs into module memory
    this._loadInputs(inputs)

    const component = this._getComponent(componentName) as ModuleComponent
    const triggeredNode = this._getFirstNodeTrigger()

    // this running is where the main "work" happens.
    // I do wonder whether we could make this even more elegant by having the node
    // subscribe to a run pubsub and then we just use that.  This would treat running
    // from a trigger in node like any other data stream. Or even just pass in socket IO.
    try {
      await component.run(triggeredNode)

      if (runSubspell) this.ranSpells.push(this.currentSpell.name)
      return this.outputData
    } catch (err) {
      console.log('err', err)
    }
  }

  /**
   * temporary function to be backwards compatible with current use of run spell
   */
  async defaultRun(inputs: Record<string, any>, runSubspell: boolean = false) {
    return this.runComponent(inputs, 'Module Trigger In', runSubspell)
  }
}

export default SpellRunner
