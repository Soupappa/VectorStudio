import paper from 'paper';

export type BooleanOperation = 'union' | 'subtract' | 'intersect' | 'exclude';

interface PathBooleanResult {
  success: boolean;
  svg?: string;
  error?: string;
}

function extractPathData(svg: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const paths: string[] = [];

  const pathElements = doc.querySelectorAll('path');
  pathElements.forEach(path => {
    const d = path.getAttribute('d');
    if (d) paths.push(d);
  });

  const circles = doc.querySelectorAll('circle');
  circles.forEach(circle => {
    const cx = parseFloat(circle.getAttribute('cx') || '0');
    const cy = parseFloat(circle.getAttribute('cy') || '0');
    const r = parseFloat(circle.getAttribute('r') || '0');
    const d = `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`;
    paths.push(d);
  });

  const rects = doc.querySelectorAll('rect');
  rects.forEach(rect => {
    const x = parseFloat(rect.getAttribute('x') || '0');
    const y = parseFloat(rect.getAttribute('y') || '0');
    const width = parseFloat(rect.getAttribute('width') || '0');
    const height = parseFloat(rect.getAttribute('height') || '0');
    const d = `M ${x},${y} L ${x + width},${y} L ${x + width},${y + height} L ${x},${y + height} Z`;
    paths.push(d);
  });

  const ellipses = doc.querySelectorAll('ellipse');
  ellipses.forEach(ellipse => {
    const cx = parseFloat(ellipse.getAttribute('cx') || '0');
    const cy = parseFloat(ellipse.getAttribute('cy') || '0');
    const rx = parseFloat(ellipse.getAttribute('rx') || '0');
    const ry = parseFloat(ellipse.getAttribute('ry') || '0');
    const d = `M ${cx - rx},${cy} a ${rx},${ry} 0 1,0 ${rx * 2},0 a ${rx},${ry} 0 1,0 -${rx * 2},0`;
    paths.push(d);
  });

  const polygons = doc.querySelectorAll('polygon');
  polygons.forEach(polygon => {
    const points = polygon.getAttribute('points');
    if (points) {
      const coords = points.trim().split(/\s+|,/).filter(s => s);
      if (coords.length >= 2) {
        let d = `M ${coords[0]},${coords[1]}`;
        for (let i = 2; i < coords.length; i += 2) {
          d += ` L ${coords[i]},${coords[i + 1]}`;
        }
        d += ' Z';
        paths.push(d);
      }
    }
  });

  const polylines = doc.querySelectorAll('polyline');
  polylines.forEach(polyline => {
    const points = polyline.getAttribute('points');
    if (points) {
      const coords = points.trim().split(/\s+|,/).filter(s => s);
      if (coords.length >= 2) {
        let d = `M ${coords[0]},${coords[1]}`;
        for (let i = 2; i < coords.length; i += 2) {
          d += ` L ${coords[i]},${coords[i + 1]}`;
        }
        paths.push(d);
      }
    }
  });

  return paths;
}

function extractSvgAttributes(svg: string): { viewBox?: string; fill?: string; stroke?: string } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');

  return {
    viewBox: svgEl?.getAttribute('viewBox') || undefined,
    fill: svgEl?.querySelector('path, circle, rect, ellipse, polygon')?.getAttribute('fill') || undefined,
    stroke: svgEl?.querySelector('path, circle, rect, ellipse, polygon')?.getAttribute('stroke') || undefined,
  };
}

export function performBooleanOperation(
  svg1: string,
  svg2: string,
  operation: BooleanOperation
): PathBooleanResult {
  try {
    paper.setup(new paper.Size(1000, 1000));

    const paths1 = extractPathData(svg1);
    const paths2 = extractPathData(svg2);

    if (paths1.length === 0 || paths2.length === 0) {
      return {
        success: false,
        error: 'No valid paths found in one or both SVGs'
      };
    }

    const paperPaths1 = paths1.map(d => new paper.Path(d));
    const paperPaths2 = paths2.map(d => new paper.Path(d));

    let compoundPath1 = paperPaths1.length === 1
      ? paperPaths1[0]
      : new paper.CompoundPath({ children: paperPaths1 });

    let compoundPath2 = paperPaths2.length === 1
      ? paperPaths2[0]
      : new paper.CompoundPath({ children: paperPaths2 });

    let result: paper.PathItem | null = null;

    switch (operation) {
      case 'union':
        result = compoundPath1.unite(compoundPath2);
        break;
      case 'subtract':
        result = compoundPath1.subtract(compoundPath2);
        break;
      case 'intersect':
        result = compoundPath1.intersect(compoundPath2);
        break;
      case 'exclude':
        result = compoundPath1.exclude(compoundPath2);
        break;
    }

    if (!result) {
      return {
        success: false,
        error: 'Boolean operation failed to produce a result'
      };
    }

    const attrs = extractSvgAttributes(svg1);
    const pathData = result.pathData;

    const viewBox = attrs.viewBox || '0 0 100 100';
    const fill = attrs.fill || 'currentColor';
    const stroke = attrs.stroke || 'none';

    const resultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><path d="${pathData}" fill="${fill}" stroke="${stroke}"/></svg>`;

    return {
      success: true,
      svg: resultSvg
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
