import React, { Component, PropTypes } from 'react';
import { find } from 'lodash';

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
        <h4>{this.props.team.name}</h4>
        {this.belongs() ?
          <a onClick={() => this.props.teamActions.removeUserTeam(this.props.team.id)}>Leave</a> :
          <a onClick={() => this.props.teamActions.addUserTeam(this.props.team.id)}>
          Join</a>
        }
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
