import { useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import Whiteboard from './components/Whiteboard'
import TopMenu from './components/TopMenu'
import BottomToolbar from './components/BottomToolbar'
import TabelaPanel from './components/TabelaPanel'
import ConfirmModal from './components/ConfirmModal'
import FlashMessage from './components/FlashMessage'
import { useStore } from './store'

export default function App() {
  const [projectName, setProjectName] = useState('Untitled')
  const [tableOpen, setTableOpen] = useState(false)
  const { confirmModal, closeConfirmModal, removeFlow } = useStore()

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      background: '#f5f5f5',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <ReactFlowProvider>
        <Whiteboard />
        <TopMenu
          projectName={projectName}
          onNameChange={setProjectName}
        />
        <BottomToolbar onToggleTable={() => setTableOpen(v => !v)} tableOpen={tableOpen} />
      </ReactFlowProvider>

      {tableOpen && (
        <TabelaPanel onClose={() => setTableOpen(false)} />
      )}

      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={() => removeFlow(confirmModal.nodeId)}
          title="Excluir fluxo completo"
          message="Todos os cards conectados a este card (origens, etapas e resultados) serão permanentemente removidos. Esta ação não pode ser desfeita."
          count={confirmModal.count}
          confirmText="Sim, excluir fluxo"
          cancelText="Cancelar"
        />
      )}

      <FlashMessage />
    </div>
  )
}
