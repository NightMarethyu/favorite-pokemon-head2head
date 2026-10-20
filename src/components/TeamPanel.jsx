import { wikiHash } from '../data/links.js'
import { TEAM_SIZE } from '../game/head2head.js'
import { useI18n } from '../i18n/useI18n.js'

// Sprite and name; on the final team, a link to its wiki page.
function MemberName({ pokemon, linked }) {
  const { t, pokemonName } = useI18n()
  const name = pokemonName(pokemon)
  const content = (
    <>
      {pokemon.sprite && <img className="team-sprite" src={pokemon.sprite} alt="" />}
      <span className="team-name">{name}</span>
    </>
  )
  if (!linked) return content
  return (
    <a className="team-link" href={wikiHash(pokemon.id)} title={t('wikiOpen', name)}>
      {content}
    </a>
  )
}

// Members show their streak (main round), their rank (Sudden Death / final), or
// their wins and losses (double elimination). With `linked` (the final team)
// each one links to its wiki page.
function TeamPanel({ team, title, linked = false }) {
  const { t } = useI18n()
  const slots = Array.from({ length: TEAM_SIZE }, (_, index) => team[index] ?? null)

  return (
    <section className="team" aria-label={title}>
      <h2 className="team-title">{title}</h2>
      <ol className="team-list">
        {slots.map((member, index) =>
          member ? (
            <li key={member.pokemon.id} className="team-slot">
              <MemberName pokemon={member.pokemon} linked={linked} />
              {member.rank !== undefined ? (
                <span className="team-streak team-rank">#{member.rank}</span>
              ) : member.losses !== undefined ? (
                <span
                  className="team-streak team-record"
                  aria-label={t('recordLabel', member.wins, member.losses)}
                  title={t('recordLabel', member.wins, member.losses)}
                >
                  {t('record', member.wins, member.losses)}
                </span>
              ) : (
                <span className="team-streak">{member.streak}</span>
              )}
            </li>
          ) : (
            <li key={`empty-${index}`} className="team-slot team-slot-empty">
              <span className="team-name">—</span>
            </li>
          ),
        )}
      </ol>
    </section>
  )
}

export default TeamPanel
