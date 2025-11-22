export function changeSvgColor(svg: string, newColor: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');

  if (!svgElement) return svg;

  const elementsToColor = svgElement.querySelectorAll('*');

  elementsToColor.forEach((element) => {
    if (element.hasAttribute('fill') && element.getAttribute('fill') !== 'none' && element.getAttribute('fill') !== 'white') {
      element.setAttribute('fill', newColor);
    }

    if (element.hasAttribute('stroke') && element.getAttribute('stroke') !== 'none' && element.getAttribute('stroke') !== 'white') {
      element.setAttribute('stroke', newColor);
    }
  });

  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgElement);
}
