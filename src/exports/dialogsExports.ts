export function showModalByID(id: string): void {
  const dialog = document.getElementById(id) as HTMLDialogElement
  if (dialog) {
    dialog.showModal()
  }
}

export function openDialogByID(id: string): void {
  const dialog = document.getElementById(id) as HTMLDialogElement
  if (dialog) {
    dialog.show()
  }
}

export function closeDialog(ev: Event) {
  const button = ev.target as HTMLElement
  const closestDialog = button.closest('dialog')
  if (closestDialog) {
    closestDialog.close()
  }
}
