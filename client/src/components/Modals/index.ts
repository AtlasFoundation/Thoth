import ExampleModal from './ExampleModal'
import InfoModal from './InfoModal'
import DeployModal from './DeployModal'
import EditSpellModal from './EditSpellModal'
import SaveAsModal from './SaveAsModal'
import AddConfig from './AddConfig'
import AddClientSettings from './AddClientSettings'
import AddScope from './AddScope'

const modals = {
  example: ExampleModal,
  infoModal: InfoModal,
  deployModal: DeployModal,
  editSpellModal: EditSpellModal,
  saveAsModal: SaveAsModal,
  addconfig: AddConfig,
  clientSettings: AddClientSettings,
  scope: AddScope,
}

export const getModals = () => {
  return modals
}
