// Type artwork keyed by type name ('Fire'). Icons are named Fire_icon_Sleep.png
// and label cards FireIC_SV.png; Vite copies them into the build with hashed names.
const iconFiles = import.meta.glob('../assets/images/type_icons/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})
const labelFiles = import.meta.glob('../assets/images/type_labels/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
})

function byType(files, pattern) {
  return new Map(Object.entries(files).map(([path, url]) => [path.match(pattern)[1], url]))
}

export const TYPE_ICONS = byType(iconFiles, /([A-Za-z]+)_icon_Sleep\.png$/)
export const TYPE_LABELS = byType(labelFiles, /([A-Za-z]+)IC_SV\.png$/)
