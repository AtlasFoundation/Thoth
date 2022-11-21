import { Spell } from './../types'
export default {
  id: '9b970450-4a0f-43cd-8763-ce0920f9ce1e',
  name: 'gradual blush',
  graph: {
    id: 'demo@0.1.0',
    nodes: {
      '124': {
        id: 124,
        data: {
          name: 'default',
          error: false,
          success: false,
          socketKey: '20c0d2db-1916-433f-88c6-69d3ae123217',
          nodeLocked: true,
          dataControls: {
            name: { expanded: true },
            playtestToggle: { expanded: true },
          },
          playtestToggle: { receivePlaytest: true },
        },
        inputs: {},
        outputs: {
          trigger: {
            connections: [{ node: 772, input: 'trigger', data: { pins: [] } }],
          },
        },
        position: [-1756.3467650623343, -115.72306980887628],
        name: 'Module Trigger In',
      },
      '233': {
        id: 233,
        data: {
          name: 'output',
          error: false,
          display: 'You said test!',
          success: false,
          socketKey: 'ba6ed95b-3aac-49e9-91ae-a33f5510c83b',
          nodeLocked: true,
          dataControls: {
            name: { expanded: true },
            sendToPlaytest: { expanded: true },
          },
          sendToPlaytest: true,
        },
        inputs: {
          input: {
            connections: [{ node: 772, output: 'output', data: { pins: [] } }],
          },
          trigger: {
            connections: [{ node: 772, output: 'trigger', data: { pins: [] } }],
          },
        },
        outputs: { trigger: { connections: [] } },
        position: [-995.0405138261826, -295.3801234200136],
        name: 'Output',
      },
      '646': {
        id: 646,
        data: {
          name: 'input',
          text: 'test',
          display: 'test',
          success: false,
          socketKey: '3a9cfde5-32a0-4e96-9de7-7571a7a4e784',
          nodeLocked: true,
          dataControls: {
            name: { expanded: true },
            useDefault: { expanded: true },
            playtestToggle: { expanded: true },
          },
          defaultValue: 'no',
          playtestToggle: { receivePlaytest: true },
        },
        inputs: {},
        outputs: {
          output: {
            connections: [{ node: 772, input: 'input', data: { pins: [] } }],
          },
        },
        position: [-1756.7490443350143, -376.7788066492969],
        name: 'Universal Input',
      },
      '772': {
        id: 772,
        data: {
          code: '(inputStr) => {\n    return { "output": `You said ${inputStr}!` }\n}',
          dataControls: {
            outputs: { expanded: true },
            code: { expanded: true },
          },
          outputs: [
            {
              name: 'output',
              taskType: 'output',
              socketKey: 'output',
              connectionType: 'output',
              socketType: 'stringSocket',
            },
          ],
          success: false,
        },
        inputs: {
          input: {
            connections: [{ node: 646, output: 'output', data: { pins: [] } }],
          },
          trigger: {
            connections: [{ node: 124, output: 'trigger', data: { pins: [] } }],
          },
        },
        outputs: {
          trigger: {
            connections: [{ node: 233, input: 'trigger', data: { pins: [] } }],
          },
          output: {
            connections: [{ node: 233, input: 'input', data: { pins: [] } }],
          },
        },
        position: [-1386.0319940412824, -303.81826315707195],
        name: 'String Processor',
      },
    },
  },
  createdAt: '2022-06-01T22:46:39.699Z',
  updatedAt: '2022-06-02T01:54:30.536Z',
  deletedAt: null,
  modules: [],
  gameState: { list: [] },
} as unknown as Spell
