import { TYPE_ICONS } from '../data/typeArt.js'
import { MULTIPLIERS, multiplierText } from '../data/typeChart.js'
import { useI18n } from '../i18n/useI18n.js'

// A small type icon with its name.
function TypePill({ type }) {
  const { typeName } = useI18n()
  return (
    <span className="type-pill">
      {TYPE_ICONS.has(type) && (
        <img src={TYPE_ICONS.get(type)} alt="" width="170" height="170" draggable={false} />
      )}
      {typeName(type)}
    </span>
  )
}

// Types grouped by multiplier ({ 2: ['Fire'], ... }), strongest first.
function MatchupGroups({ groups, label }) {
  const { t } = useI18n()
  const shown = MULTIPLIERS.filter((value) => groups[value]?.length)
  if (shown.length === 0) return <p className="setup-hint">{t('typeAllNeutral')}</p>
  return (
    <dl className="matchup-groups">
      {shown.map((value) => (
        <div
          key={value}
          className={`matchup-group matchup-${value > 1 ? 'strong' : value > 0 ? 'weak' : 'none'}`}
        >
          <dt>
            <span className="matchup-multiplier">{multiplierText(value)}</span> {label(value)}
          </dt>
          <dd>
            {groups[value].map((type) => (
              <TypePill key={type} type={type} />
            ))}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default MatchupGroups
