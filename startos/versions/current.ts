import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '25.0.0:4',
  releaseNotes: {
    en_US:
      'Requires StartOS 0.4.2 or later. The package now verifies the Balance of Satoshis release it installs against a pinned checksum.',
    es_ES:
      'Requiere StartOS 0.4.2 o posterior. El paquete ahora verifica la versión de Balance of Satoshis que instala con una suma de comprobación fijada.',
    de_DE:
      'Erfordert StartOS 0.4.2 oder neuer. Das Paket prüft die installierte Version von Balance of Satoshis jetzt gegen eine festgelegte Prüfsumme.',
    pl_PL:
      'Wymaga StartOS 0.4.2 lub nowszego. Pakiet weryfikuje teraz instalowane wydanie Balance of Satoshis względem przypiętej sumy kontrolnej.',
    fr_FR:
      'Nécessite StartOS 0.4.2 ou ultérieur. Le paquet vérifie désormais la version de Balance of Satoshis qu’il installe à l’aide d’une somme de contrôle fixée.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
