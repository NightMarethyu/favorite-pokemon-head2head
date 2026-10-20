import { TEAM_SIZE } from '../game/head2head.js'

// Members show their streak (main round) or their rank (Sudden Death / final).
function TeamPanel({ team, title = 'Your Team' }) {
  const slots = Array.from({ length: TEAM_SIZE }, (_, index) => team[index] ?? null)

  return (
    <section className="team" aria-label={title}>
      <h2 className="team-title">{title}</h2>
      <ol className="team-list">
        {slots.map((member, index) =>
          member ? (
            <li key={member.pokemon.id} className="team-slot">
              {member.pokemon.sprite && (
                <img className="team-sprite" src={member.pokemon.sprite} alt="" />
              )}
              <span className="team-name">{member.pokemon.name}</span>
              {member.rank !== undefined ? (
                <span className="team-streak team-rank">#{member.rank}</span>
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
