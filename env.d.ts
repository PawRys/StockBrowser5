/// <reference types="vite/client" />

type DBSchema = {
  stockList: Plywood[]
  stockDate?: string
  stockWarehause?: string
}

type Plywood = {
  id: string
  name: string
  size: string
  attr: {
    sizeT: string
    sizeA: string
    sizeB: string
    sizeAB: string
    color: string
    footSize: string
    glueType: string
    woodType: string
    faceType: string
    faceGroup: string
  }
  price?: number
  totalStock: number
  aviableStock?: number
  stockStatus: number
  inventoryStatus: string
  inventory?: {
    m3?: string
    m2?: string
    szt?: string
  }
}

interface AttributeFilter {
  sizeT?: string
  sizeA?: string
  sizeB?: string
  sizeAB?: string
  color?: string
  footSize?: string
  glueType?: string
  woodType?: string
  faceType?: string
  faceGroup?: string
}
