import React, { PropTypes } from 'react';
import Team from './Team';

const TeamList = ({ teams, userTeams, teamActions }) => (
  <div>
    <div className="form-list">
      {teams.map(team => (
        <Team
          key={team.id}
          team={team}
          userTeams={userTeams}
          teamActions={teamActions}
        />
      ))}
    </div>
  </div>
);

TeamList.propTypes = {
  teams: PropTypes.array.isRequired,
  userTeams: PropTypes.array.isRequired,
  teamActions: PropTypes.object.isRequired,
};

export default TeamList;
