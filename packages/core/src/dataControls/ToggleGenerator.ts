import { DataControl } from '../plugins/inspectorPlugin'

export class ToggleGeneratorControl extends DataControl {
  connectionType: string
  constructor({
    socketType = 'triggerSocket',
    taskType = 'output',
    ignored = [],
    icon = 'properties',
    connectionType,
    name: nameInput,
  }: {
    socketType?: string
    taskType?: string
    ignored?: string[]
    icon?: string
    connectionType: 'input' | 'output'
    name: string
  }) {
    if (
      !connectionType ||
      (connectionType !== 'input' && connectionType !== 'output')
    )
      throw new Error(
        "connectionType of your generator must be defined and of the value 'input' or 'output'."
      )

    const name = nameInput || `${socketType} ${connectionType}s`

    const options = {
      dataKey: connectionType + 's',
      name,
      component: 'socketGenerator',
      icon,
      data: {
        ignored,
        socketType,
        taskType,
        connectionType,
      },
    }

    super(options)

    this.connectionType = connectionType
  }
}
