import ExampleModal from './ExampleModal'
import InfoModal from './InfoModal'
import DeployModal from './DeployModal'
import EditSpellModal from './EditSpellModal'
import SaveAsModal from './SaveAsModal'
import StoreAddEditModal from './SearchCorpus/StoreAddEditModal'
import StoreDeleteModal from './SearchCorpus/StoreDeleteModal'
import DocumentAddModal from './SearchCorpus/DocumentAddModal'
import DocumentEditModal from './SearchCorpus/DocumentEditModal'
import DocumentDeleteModal from './SearchCorpus/DocumentDeleteModal'
import ContentObjEditModal from './SearchCorpus/ContentObjEditModal'

const modals = {
  example: ExampleModal,
  infoModal: InfoModal,
  deployModal: DeployModal,
  editSpellModal: EditSpellModal,
  saveAsModal: SaveAsModal,
  documentStoreAddEditModal: StoreAddEditModal,
  documentStoreDeleteModal: StoreDeleteModal,
  documentAddModal: DocumentAddModal,
  documentEditModal: DocumentEditModal,
  documentDeleteModal: DocumentDeleteModal,
  contentObjEditModal: ContentObjEditModal
}

export const getModals = () => {
  return modals
}
