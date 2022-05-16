//@ts-nocheck

import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { VscNewFile, VscTrash } from 'react-icons/vsc'
import { FaEdit } from 'react-icons/fa'
import SearchCorpusDocument from './SearchCorpusDocument'
import { useModal } from '@/contexts/ModalProvider'
import { store } from '@/state/store'

const SearchCorpus = () => {
  const [documentsStores, setDocumentsStores] = useState(null)
  const { openModal } = useModal()
  const storeRef = useRef(null)
  const [documents, setDocuments] = useState([])

  const add = async () => {
    openModal({
      modal: 'documentAddModal',
      storeId: storeRef.current.value,
      isContentObject: false,
      getDocuments,
    })
  }

  const getDocumentsStores = async () => {
    console.log('get documents store')
    const res = await axios.get(
      `${process.env.REACT_APP_SEARCH_SERVER_URL}/document-store`
    )
    console.log('stores ::: ', res.data)
    setDocumentsStores(res.data)
    setDocuments([])
    if (storeRef.current.value) await getDocuments()
  }

  const getDocuments = async () => {
    const docs = await axios.get(
      `${process.env.REACT_APP_SEARCH_SERVER_URL}/document`,
      {
        params: {
          storeId: storeRef.current.value,
        },
      }
    )
    setDocuments(docs.data)
  }

  const openAddEditModal = opType => {
    let store = null
    if (opType === 'edit') {
      store = documentsStores.filter(store => store.id === parseInt(storeRef.current.value))[0] ?? ''

      console.log(store,'storestorestore')
    } else store = ''
    openModal({
      modal: 'documentStoreAddEditModal',
      opType,
      getDocumentsStores,
      store,
    })
  }

  const openDeleteStoreModal = () => {
    let store = documentsStores.filter(
      store => store.id === parseInt(storeRef.current.value)
    )[0]
    openModal({
      modal: 'documentStoreDeleteModal',
      store,
      getDocumentsStores,
    })
  }

  useEffect(() => {
    (async () => await getDocumentsStores())()
  }, [])

  return (
    <div className="agent-container">
      {!documents ? (
        <h1>Loading...</h1>
      ) : (
        <div>
          <div className="d-flex align-items-center">
            <span className='search-corpus' style={{ width: '50%' }}>
              <select
                name="documents"
                id="documents"
                ref={storeRef}
                onChange={event => {
                  event.preventDefault()
                  getDocuments()
                }}
              >
                {documentsStores &&
                  documentsStores.map((store,i) => {
                    return (<option value={store.id} key={store.id}>
                      {store.name}
                    </option>
                    )
                    })}
              </select>
            </span>
            <span>
              <VscNewFile
                size={20}
                color="#A0A0A0"
                style={{ margin: '0 0.5rem'}}
                onClick={() => {
                  console.log('add clicked')
                  openAddEditModal('add')
                }}
              />
              <FaEdit
                size={20}
                color="#A0A0A0"
                style={{ margin: '0 0.5rem'}}
                onClick={() => {
                  console.log('edit clicked')
                  openAddEditModal('edit')
                }}
              />
              <VscTrash
                size={20}
                color="#A0A0A0"
                style={{ margin: '0 0.5rem'}}
                onClick={() => {
                  console.log('trash clicked')
                  openDeleteStoreModal()
                }}
              />
            </span>
          </div>

          <div className="d-flex flex-column search-corpus-documents-list">
            {documents &&
              documents.map(document => (
                <SearchCorpusDocument
                  document={document}
                  getDoc={getDocuments}
                  key={document.id}
                />
              ))}
            {documents.length === 0 && 'No documents found'}
          </div>

          <button
            className="button"
            type="button"
            onClick={async e => {
              e.preventDefault()
              await add()
            }}
          >
            Create New
          </button>
        </div>
      )}
    </div>
  )
}

export default SearchCorpus
