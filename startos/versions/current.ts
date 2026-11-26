import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '26.2.1:0',
  releaseNotes: {
    en_US:
      'Update Balance of Satoshis to 26.2.1. The increase-inbound-liquidity command is now called swap-out. Accounting reports can include Lightning fees across multiple nodes.',
    es_ES:
      'Actualiza Balance of Satoshis a 26.2.1. El comando increase-inbound-liquidity ahora se llama swap-out. Los informes contables pueden incluir las comisiones de Lightning de varios nodos.',
    de_DE:
      'Aktualisiert Balance of Satoshis auf 26.2.1. Der Befehl increase-inbound-liquidity heißt jetzt swap-out. Buchhaltungsberichte können Lightning-Gebühren mehrerer Knoten enthalten.',
    pl_PL:
      'Aktualizacja Balance of Satoshis do 26.2.1. Polecenie increase-inbound-liquidity nosi teraz nazwę swap-out. Raporty księgowe mogą uwzględniać opłaty Lightning z wielu węzłów.',
    fr_FR:
      'Mise à jour de Balance of Satoshis vers 26.2.1. La commande increase-inbound-liquidity devient swap-out. Les rapports comptables peuvent inclure les frais Lightning de plusieurs nœuds.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
