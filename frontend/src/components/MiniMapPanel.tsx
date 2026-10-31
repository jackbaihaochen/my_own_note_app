import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react'
import type MindMap from 'simple-mind-map'
import type { MiniMapState } from 'simple-mind-map'

const WIDTH = 220
const HEIGHT = 140

export function MiniMapPanel({ mindMap }: { mindMap: MindMap }) {
  const [open, setOpen] = useState(true)
  const [state, setState] = useState<MiniMapState | null>(null)

  useEffect(() => {
    if (!open) return
    // recalculating serializes the whole SVG, so coalesce bursts (e.g. panning) into one per frame
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setState(mindMap.miniMap.calculationMiniMap(WIDTH, HEIGHT)))
    }
    update()
    mindMap.on('node_tree_render_end', update)
    mindMap.on('view_data_change', update)
    return () => {
      cancelAnimationFrame(frame)
      mindMap.off('node_tree_render_end', update)
      mindMap.off('view_data_change', update)
    }
  }, [mindMap, open])

  if (!open) {
    return (
      <button className="minimap-toggle" title="显示缩略图" onClick={() => setOpen(true)}>
        缩略图
      </button>
    )
  }

  // Click on the map: move the view so the clicked point becomes the centre of the view box
  const jumpTo = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!state) return
    const rect = e.currentTarget.getBoundingClientRect()
    const { left, right, top, bottom } = state.viewBoxStyle
    const centerX = (parseFloat(left) + WIDTH - parseFloat(right)) / 2
    const centerY = (parseFloat(top) + HEIGHT - parseFloat(bottom)) / 2
    mindMap.view.translateX(-(e.clientX - rect.left - centerX) / state.miniMapBoxScale)
    mindMap.view.translateY(-(e.clientY - rect.top - centerY) / state.miniMapBoxScale)
  }

  const startDrag = (e: ReactMouseEvent) => {
    e.stopPropagation()
    mindMap.miniMap.onViewBoxMousedown(e.nativeEvent)
    const onMove = (ev: MouseEvent) => mindMap.miniMap.onViewBoxMousemove(ev)
    const onUp = () => {
      mindMap.miniMap.onMouseup()
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  return (
    <div className="minimap">
      <div className="minimap-box" style={{ width: WIDTH, height: HEIGHT }} onClick={jumpTo}>
        {state && (
          <>
            <div
              className="minimap-svg"
              style={{
                left: state.miniMapBoxLeft,
                top: state.miniMapBoxTop,
                transform: `scale(${state.miniMapBoxScale})`,
              }}
              dangerouslySetInnerHTML={{ __html: state.svgHTML }}
            />
            <div
              className="minimap-viewbox"
              style={state.viewBoxStyle}
              onMouseDown={startDrag}
              onClick={e => e.stopPropagation()}
            />
          </>
        )}
      </div>
      <button className="minimap-close" title="收起缩略图" onClick={() => setOpen(false)}>
        ×
      </button>
    </div>
  )
}
