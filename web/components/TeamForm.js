import React, { Component, PropTypes } from 'react';
import find from 'lodash/find';

const validate = (team, teams) => {
  const errors = {};

  if (!team.name) {
    errors.teamName = 'Required';
  }
  const dupe = find(teams, { name: team.name });
  if (dupe) {
    errors.teamName = 'Team name must be unique.';
  }
  return errors;
};

class TeamForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      teamName: '',
    };

    this.onNameChange = this.onNameChange.bind(this);
    this.save = this.save.bind(this);
  }

  onNameChange(e) {
    this.setState({ teamName: e.target.value });
  }

  save() {
    const team = {
      name: this.state.teamName,
    };
    const errors = validate(team, this.props.teams);
    this.setState({ errors });
    if (!Object.keys(errors).length) {
      this.props.create(team);
    }
  }

  render() {
    return (
      <div className="side-form">
        <div className="form-group">
          <label htmlFor="form-name">Team Name:</label>
          <input
            id="team-name"
            type="text"
            className="form-control"
            value={this.state.teamName}
            onChange={this.onNameChange}
          />
          {this.state.errors.teamName
            ? <p className="text-danger">{this.state.errors.teamName}</p>
            : ''}
        </div>
        {this.props.addTeamError && !Object.keys(this.state.errors).length
          ? <p className="text-danger">{this.props.addTeamError}</p>
          : ''}
        <div className="btn-toolbar">
          <button className="btn btn-sc" onClick={this.save}>Create</button>
          <button className="btn btn-default" onClick={this.props.cancel}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
}

TeamForm.propTypes = {
  create: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  teams: PropTypes.array.isRequired,
  addTeamError: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};

export default TeamForm;
