import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import find from 'lodash/find';

class Team extends Component {
  belongs() {
    if (find(this.props.userTeams, { id: this.props.team.id })) {
      return true;
    }
    return false;
  }

  render() {
    return (
      <div className="form-item">
        <h4>
          <Link to={`/teams/${this.props.team.id}`}>
            {this.props.team.name}
          </Link>
        </h4>
        {this.belongs()
          ? <a
              onClick={() =>
                this.props.teamActions.removeUserTeam(this.props.team.id)}
            >
              Leave
            </a>
          : <a
              onClick={() =>
                this.props.teamActions.addUserTeam(this.props.team.id)}
            >
              Join
            </a>}
      </div>
    );
  }
}

Team.propTypes = {
  team: PropTypes.object.isRequired,
  userTeams: PropTypes.array.isRequired,
  teamActions: PropTypes.object.isRequired,
};

export default Team;
