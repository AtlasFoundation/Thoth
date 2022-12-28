import {
  buildThothInterface,
  extractModuleInputKeys,
  extractNodes,
} from './runSpell'
import { Graph, ModuleComponent } from './types'
import { initSharedEngine, getComponents } from '@thothai/thoth-core/server'
import { Module } from './module'
import { ModuleType } from '@thothai/thoth-core/types'
import { Task } from '@thothai/thoth-core/src/plugins/taskPlugin/task'

export const CreateSpellHandler = async (
  spell: any
) => {
  // TODO: create a proper engine interface with the proper methods types on it.
  const engine = initSharedEngine({
    name: 'demo@0.1.0',
    components: getComponents(),
    server: true,
    modules: {},
  }) as any

  // TODO use test spells if body option is given
  // const rootSpell = getTestSpell(spell)
  const graph = spell.graph as Graph

  console.log('graph is', graph)

  const modules = spell.modules as Module[]

  const gameState = {
    ...spell?.gameState,
  }

  const thoth = buildThothInterface(null as any, gameState)

  // The module is an interface that the module system uses to write data to
  // used internally by the module plugin, and we make use of it here too.
  // TODO: Test runing nested modules and watch out for unexpected behaviour
  // when child modules overwrite this with their own.
  const module = new Module()
  // Parse array of modules into a map of modules by module name
  const moduleMap = modules?.reduce((modules: any, module: any) => {
    modules[module.name] = module
    return modules
  }, {} as Record<string, ModuleType>)
  // Update the modules available in the module manager during the graph run time

  engine.moduleManager.setModules(moduleMap)

  // ThothContext: map of services expected by Thoth components,
  // allowing client and server provide different sets of helpers that match the common interface
  // EngineContext passed down into the engine and is used by workers.
  const context = {
    module,
    thoth,
    silent: true,
  }

  // Collect all the "trigger ins" that the module manager has gathered
  const triggerIns = engine.moduleManager.triggerIns

  function getFirstNodeTrigger(data: Graph) {
    const extractedNodes = extractNodes(data.nodes, triggerIns)
    return extractedNodes[0]
  }

  // Standard default component to start the serverside run sequence from, which has the run function on it.
  const component = engine.components.get(
    'Module Trigger In'
  ) as ModuleComponent as any

  // Defaulting to the first node trigger to start our "run"
  const triggeredNode = getFirstNodeTrigger(graph) as any

  // Engine process to set up the tasks and prime the system for the first 'run' command.
  await engine.process(graph, null, context)

  const formattedOutputs: Record<string, unknown> = {}
  // Eventual outputs of running the Spell
  const rawOutputs = {} as Record<string, unknown>

  const inputKeys = extractModuleInputKeys(graph) as string[]

  // Return this-- this is the callback for discord etc to handle chat
  async function spellHandler({
    message,
    speaker,
    agent,
    client,
    channelId,
    entity,
    eth_private_key,
    eth_public_address,
    channel
  }: {
    message: string,
    speaker: string,
    agent: string,
    client: string,
    channelId: string,
    entity: any,
    eth_private_key: string,
    eth_public_address: string,
    channel: string
  }
    ) {
    const spellInputs = {
      Input: message,
      Speaker: speaker,
      Agent: agent,
      Client: client,
      ChannelID: channelId,
      Entity: entity,
      Channel: channel,
      eth_private_key,
      eth_public_address
    } as any
    let error = null
    const inputs = inputKeys.reduce(
      (inputs, expectedInput: string, idx: number) => {
        const requestInput = spellInputs

        if (requestInput) {
          inputs[expectedInput] = [requestInput]

          return inputs
        } else {
          error = `Spell expects a value for ${expectedInput} to be provided `
        }
      },
      {} as Record<string, unknown>
    )

    engine.tasks.forEach((task: Task) => {
      task.reset()
    })

    // Attaching inputs to the module, which are passed in when the engine runs.
    // you can see this at work in the 'workerInputs' function of module-manager
    // work inputs worker reads from the module inputs via the key in node.data.name
    // important to note: even single string values are wrapped in arrays due to match the client editor format
    module.read(inputs as any)

    await component.run(triggeredNode)

    // Write all the raw data that was output by the module run to an object
    module.write(rawOutputs)

    const outputs = Object.values(graph.nodes).filter((node: any) => {
      return node.name.includes('Output')
    })

    // Format raw outputs based on the names assigned to Module Outputs node data in the graph
    Object.values(graph.nodes)
      .filter((node: any) => {
        return node.name.includes('Output')
      })
      .forEach((node: any) => {
        formattedOutputs[(node as any).data.name as string] =
          rawOutputs[(node as any).data.socketKey as string]
      })
    if (error) return rawOutputs

    let index = undefined

    for (const x in formattedOutputs) {
      index = x
    }

    if (index && index !== undefined) {
      return formattedOutputs && formattedOutputs[index]
    } else {
      return undefined
    }
  }
  return spellHandler
}
