import type { ReactNode } from 'react'

type BoardCellProps = {
  row: number
  col: number
  children?: ReactNode
  onClick?: (row: number, col: number) => void
  onDrop?: (row: number, col: number, data?: unknown) => void
  onDragOver?: (row: number, col: number, event: React.DragEvent<HTMLDivElement>) => void
  isActive?: boolean
}

export function BoardCell({ row, col, children, onClick, onDrop, onDragOver, isActive }: BoardCellProps) {
  return (
    <div
      className={`relative flex aspect-square items-center justify-center rounded-lg border transition ${
        isActive ? 'border-accent bg-accent/10' : 'border-slate/40 bg-slate/30'
      }`}
      onClick={() => onClick?.(row, col)}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver?.(row, col, e)
      }}
      onDrop={(e) => {
        e.preventDefault()
        const payload = e.dataTransfer.getData('application/json')
        onDrop?.(row, col, payload ? JSON.parse(payload) : undefined)
      }}
    >
      {children}
      <span className="pointer-events-none absolute left-1 top-1 text-[10px] text-slate-500">
        {row + 1},{col + 1}
      </span>
    </div>
  )
}

