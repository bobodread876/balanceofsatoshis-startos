import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '26.2.1:0',
  releaseNotes: {
    en_US: `Update Balance of Satoshis to 26.2.1.

**Before updating:** Finish or refund pending swap-in and increase-inbound-liquidity swaps. The new swap-in and swap-out protocols do not accept their legacy recovery codes. Upstream specifies BoS 25.7.0 for refunding older swap-ins.

- increase-inbound-liquidity is now swap-out, and --with is now --out.
- Accounting reports can include Lightning fees across multiple nodes.

[Full upstream changelog](https://github.com/alexbosworth/balanceofsatoshis/blob/v26.2.1/CHANGELOG.md)`,
    es_ES: `Actualiza Balance of Satoshis a 26.2.1.

**Antes de actualizar:** Completa los swaps pendientes creados con swap-in o increase-inbound-liquidity, o recupera sus fondos. Los nuevos protocolos swap-in y swap-out no aceptan sus códigos de recuperación antiguos. El proyecto original indica usar BoS 25.7.0 para reembolsar los swap-ins antiguos.

- increase-inbound-liquidity ahora se llama swap-out, y --with pasa a ser --out.
- Los informes contables pueden incluir las comisiones de Lightning de varios nodos.

[Registro completo de cambios del proyecto original](https://github.com/alexbosworth/balanceofsatoshis/blob/v26.2.1/CHANGELOG.md)`,
    de_DE: `Aktualisiert Balance of Satoshis auf 26.2.1.

**Vor dem Update:** Noch offene Swaps von swap-in und increase-inbound-liquidity abschließen oder die Gelder zurückfordern. Die neuen Protokolle von swap-in und swap-out akzeptieren deren alte Wiederherstellungscodes nicht. Upstream verweist für die Rückerstattung älterer Swap-ins auf BoS 25.7.0.

- increase-inbound-liquidity heißt jetzt swap-out, und --with wird zu --out.
- Buchhaltungsberichte können Lightning-Gebühren mehrerer Knoten enthalten.

[Vollständiges Upstream-Änderungsprotokoll](https://github.com/alexbosworth/balanceofsatoshis/blob/v26.2.1/CHANGELOG.md)`,
    pl_PL: `Aktualizacja Balance of Satoshis do 26.2.1.

**Przed aktualizacją:** Dokończ oczekujące swapy utworzone za pomocą swap-in lub increase-inbound-liquidity albo odzyskaj z nich środki. Nowe protokoły swap-in i swap-out nie obsługują ich starych kodów odzyskiwania. Projekt źródłowy wskazuje BoS 25.7.0 do odzyskiwania środków ze starszych swap-in.

- increase-inbound-liquidity nosi teraz nazwę swap-out, a --with zmienia się na --out.
- Raporty księgowe mogą uwzględniać opłaty Lightning z wielu węzłów.

[Pełna lista zmian projektu źródłowego](https://github.com/alexbosworth/balanceofsatoshis/blob/v26.2.1/CHANGELOG.md)`,
    fr_FR: `Mise à jour de Balance of Satoshis vers 26.2.1.

**Avant la mise à jour :** Terminez les swaps en attente créés avec swap-in ou increase-inbound-liquidity, ou récupérez les fonds correspondants. Les nouveaux protocoles swap-in et swap-out n'acceptent pas leurs anciens codes de récupération. Le projet amont indique d'utiliser BoS 25.7.0 pour rembourser les anciens swap-in.

- increase-inbound-liquidity devient swap-out, et --with devient --out.
- Les rapports comptables peuvent inclure les frais Lightning de plusieurs nœuds.

[Journal complet des modifications du projet amont](https://github.com/alexbosworth/balanceofsatoshis/blob/v26.2.1/CHANGELOG.md)`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
