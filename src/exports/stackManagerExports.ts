import CryptoJS from 'crypto-js'
import { downloadFile } from '@/exports/common_functions'
import { setRandomUUID } from '@/exports/common_functions'

export async function createDBbackup() {
  let msg = ``
  setRandomUUID()

  const file = `StanyBackup-${new Date().toJSON().split('T')[0]}.txt`
  const stockData = {
    stockDate: localStorage.getItem('SB5_stockDate') || '',
    stockWarehause: localStorage.getItem('SB5_stockWarehause') || '',
    stockList: JSON.parse(localStorage.getItem('SB5_stockList') || '[]')
  }

  const stockDataString = JSON.stringify(stockData)

  const type = 'application/json; charset=UTF-8'
  const encryptedData = CryptoJS.AES.encrypt(
    stockDataString,
    localStorage.getItem('SB5_UUID') as string
  ).toString()

  try {
    downloadFile(file, encryptedData, type)
    msg = `✔️ Zapisano kopię zapasową.`
  } catch (error) {
    console.error(`**exportIDB()**`, error)
    msg = `❌ Błąd podczas zapisywania kopii zapasowej.`
  }

  return msg
}
