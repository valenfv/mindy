/**
 * Stub del módulo virtual `virtual:pwa-register/react`, que sólo existe cuando
 * corre el plugin de PWA. Se usa únicamente en el entorno de tests.
 */
export function useRegisterSW() {
  return {
    needRefresh: [false, () => {}] as [boolean, (value: boolean) => void],
    offlineReady: [false, () => {}] as [boolean, (value: boolean) => void],
    updateServiceWorker: async () => {},
  }
}
