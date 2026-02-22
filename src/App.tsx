import { useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import Whiteboard from './components/Whiteboard'
import TopMenu from './components/TopMenu'
import BottomToolbar from './components/BottomToolbar'
import Calculator from './components/Calculator'
import ConfirmModal from './components/ConfirmModal'
import SimuladorJuros from './components/SimuladorJuros'
import { useStore } from './store'
import type { AppMode } from './appMode'
import { isFinancialModeEnabled } from './featureFlags'

export type { AppMode } from './appMode'

export default function App() {
  const [projectName, setProjectName] = useState('Untitled')
  const [calcOpen, setCalcOpen] = useState(false)
  const [mode, setMode] = useState<AppMode>('basico')
  const [simuladorOpen, setSimuladorOpen] = useState(false)
  const { confirmModal, closeConfirmModal, removeFlow } = useStore()

  const handleModeChange = (m: AppMode) => {
    if (m === 'financeiro' && !isFinancialModeEnabled) return
    setMode(m)
    if (m === 'financeiro') setSimuladorOpen(true)
  }

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
        <BottomToolbar 
          financialEnabled={isFinancialModeEnabled}
          mode={mode}
          onModeChange={handleModeChange}
          onOpenCalc={() => setCalcOpen(true)}
          onOpenSimulador={() => setSimuladorOpen(true)}
          simuladorOpen={simuladorOpen}
        />
      </ReactFlowProvider>

      {calcOpen && (
        <Calculator onClose={() => setCalcOpen(false)} />
      )}

      {isFinancialModeEnabled && mode === 'financeiro' && simuladorOpen && (
        <SimuladorJuros onClose={() => setSimuladorOpen(false)} />
      )}

      {/* Modal de confirmação global (fora do ReactFlow) */}
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
    </div>
  )
}
