import { Box2 } from 'vecks'

import colors from './util/colors'
import denormalise from './denormalise'
import entityToPolyline from './entityToPolyline'
import applyTransforms from './applyTransforms'
import logger from './util/logger'

export default (parsed) => {
  const entities = denormalise(parsed)
  const polylines = entities.map((entity) => {
    const layerTable = parsed.tables.layers[entity.layer]
    let colorNumber = 0
    if ('colorNumber' in entity) {
      colorNumber = entity.colorNumber
    } else if (layerTable) {
      colorNumber = layerTable.colorNumber
    }

    if (colors[colorNumber] === undefined) {
      logger.warn('Color index', colorNumber, 'invalid, defaulting to black')
      colorNumber = 0
    }

    return {
      rgb: colors[colorNumber],
      layer: layerTable,
      vertices: applyTransforms(entityToPolyline(entity), entity.transforms),
    }
  })

  const bbox = new Box2()
  polylines.forEach((polyline) => {
    polyline.vertices.forEach((vertex) => {
      bbox.expandByPoint({ x: vertex[0], y: vertex[1] })
    })
  })

  return { bbox, polylines }
}
